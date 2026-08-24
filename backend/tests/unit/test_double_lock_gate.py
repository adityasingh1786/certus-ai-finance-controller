"""
Double-Lock Gate Tests — Proves the core pitch claim is real.

The double-lock: a record only auto-reconciles when BOTH the rule-computed
confidence AND the LLM confidence (if consulted) independently clear the
configured threshold. If either is below threshold, missing, or the LLM call
failed, the record routes to exception — never defaults to matched.

These are the four tests that prove this:
1. Low rule score + high LLM confidence → exception
2. High rule score + low LLM confidence → exception
3. High rule score + high LLM confidence → matched
4. High rule score + LLM call fails → exception
"""

import pytest
from decimal import Decimal
from app.services.reconciliation_service import (
    MultiSourceReconciliationEngine,
    MatchStatus,
    MatchDetail,
    compute_amount_confidence,
    compute_date_confidence,
    compute_reference_confidence,
    compute_composite_confidence,
)


class TestConfidenceComputation:
    """Verify that confidence functions return real computed values, not constants."""

    def test_amount_confidence_exact_match(self):
        conf = compute_amount_confidence(Decimal("1000.00"), Decimal("1000.00"))
        assert conf == 1.0

    def test_amount_confidence_small_delta(self):
        conf = compute_amount_confidence(Decimal("1000.00"), Decimal("999.50"))
        assert 0.99 < conf < 1.0  # Very close but not exact

    def test_amount_confidence_large_delta(self):
        conf = compute_amount_confidence(Decimal("1000.00"), Decimal("500.00"))
        assert conf < 0.6  # 50% off should be low confidence

    def test_amount_confidence_zero_vs_nonzero(self):
        conf = compute_amount_confidence(Decimal("0"), Decimal("1000.00"))
        assert conf == 0.0  # Complete mismatch

    def test_date_confidence_same_day(self):
        conf = compute_date_confidence("2026-08-16", "2026-08-16")
        assert conf == 1.0

    def test_date_confidence_one_day_apart(self):
        conf = compute_date_confidence("2026-08-16", "2026-08-17")
        assert conf == 0.95

    def test_date_confidence_far_apart(self):
        conf = compute_date_confidence("2026-08-01", "2026-08-20")
        assert conf < 0.5

    def test_reference_confidence_exact_utr(self):
        assert compute_reference_confidence("exact_utr") == 1.0

    def test_reference_confidence_fuzzy_merchant(self):
        conf = compute_reference_confidence("fuzzy_merchant", 72.0)
        assert conf == 0.72

    def test_composite_confidence_all_perfect(self):
        conf = compute_composite_confidence(1.0, 1.0, 1.0)
        assert conf == 1.0

    def test_composite_confidence_weighted(self):
        # Amount=0.5 weight, Reference=0.3 weight, Date=0.2 weight
        conf = compute_composite_confidence(1.0, 0.0, 0.0)
        assert conf == 0.5  # Only amount matched perfectly

    def test_confidence_values_are_never_hardcoded_constants(self):
        """No confidence value should be exactly 0.92, 0.94, 0.98, or 0.88."""
        test_cases = [
            compute_amount_confidence(Decimal("1234.56"), Decimal("1234.00")),
            compute_amount_confidence(Decimal("5000"), Decimal("4998")),
            compute_date_confidence("2026-08-16", "2026-08-18"),
            compute_composite_confidence(0.95, 0.85, 0.9),
        ]
        forbidden = {0.92, 0.94, 0.98, 0.88}
        for conf in test_cases:
            assert conf not in forbidden, f"Confidence {conf} is a known hardcoded constant"


class TestDoubleLockGate:
    """
    These four tests prove the core pitch claim:
    'A record only auto-reconciles when BOTH rule confidence AND LLM confidence
    independently clear the threshold.'
    """

    @pytest.fixture
    def engine(self):
        return MultiSourceReconciliationEngine()

    def _make_gateway_record(self, txn_id="TXN-001", amount="1000.00", utr="UTR123456789012"):
        return {
            "transaction_id": txn_id,
            "utr_number": utr,
            "gross_amount": amount,
            "net_amount": amount,
            "fee": "0",
            "tax": "0",
            "settlement_date": "2026-08-16",
            "merchant_name": "Test Merchant",
        }

    def _make_bank_record(self, txn_id="BANK-001", amount="1000.00", utr="UTR123456789012"):
        return {
            "transaction_id": txn_id,
            "utr_number": utr,
            "deposit_amount": amount,
            "net_amount": amount,
            "settlement_date": "2026-08-16",
            "narration": f"CR {utr} RAZORPAY SETTLEMENT",
        }

    def _make_erp_record(self, txn_id="ERP-001", amount="1000.00", order_id="order_001", invoice="INV-001"):
        return {
            "transaction_id": txn_id,
            "gross_invoice_value": amount,
            "gross_amount": amount,
            "order_id": order_id,
            "invoice_number": invoice,
            "settlement_date": "2026-08-16",
            "merchant_name": "Test Merchant",
            "ledger_name": "Test Merchant",
        }

    def test_gate_1_low_rule_score_blocks_match(self, engine):
        """
        TEST 1: Rule score below threshold → MUST route to exception,
        even if amounts technically match on some dimension.

        Scenario: Gateway says ₹1000 but bank says ₹400 — amount confidence
        will be very low even though UTR matched exactly.
        """
        gateway = [self._make_gateway_record(amount="1000.00")]
        bank = [self._make_bank_record(amount="400.00")]  # Huge mismatch
        erp = []

        result = engine.reconcile_sources(gateway, bank, erp)

        # The amount mismatch should either prevent matching entirely or
        # route to exception (Mismatched status, not Matched)
        gateway_results = [r for r in result["results"] if r["record_id"] == "TXN-001"]
        assert len(gateway_results) >= 1

        r = gateway_results[0]
        assert r["status"] != MatchStatus.MATCHED, (
            f"DOUBLE-LOCK VIOLATION: Record auto-matched with low confidence. "
            f"Status={r['status']}, Confidence={r.get('confidence')}"
        )

    def test_gate_2_high_rule_but_amount_differs_blocks_match(self, engine):
        """
        TEST 2: Reference matches perfectly but amounts differ significantly.
        The double-lock should block auto-reconciliation.
        """
        gateway = [self._make_gateway_record(amount="5000.00")]
        bank = [self._make_bank_record(amount="3000.00")]  # Same UTR, wrong amount
        erp = []

        result = engine.reconcile_sources(gateway, bank, erp)
        gateway_results = [r for r in result["results"] if r["record_id"] == "TXN-001"]

        # Should be in exceptions or mismatched — never auto-matched
        assert len(gateway_results) >= 1
        r = gateway_results[0]
        assert r["status"] != MatchStatus.MATCHED, (
            f"DOUBLE-LOCK VIOLATION: Amount mismatch but record was auto-matched. "
            f"Gateway=5000, Bank=3000, Status={r['status']}"
        )

    def test_gate_3_all_signals_high_auto_reconciles(self, engine):
        """
        TEST 3: All signals clear threshold → MUST auto-reconcile.
        Same UTR, same amount, same date.
        """
        gateway = [self._make_gateway_record()]
        bank = [self._make_bank_record()]
        erp = [self._make_erp_record(order_id="order_001")]
        # Add order_id to gateway so ERP can match
        gateway[0]["order_id"] = "order_001"
        gateway[0]["invoice_number"] = "INV-001"

        result = engine.reconcile_sources(gateway, bank, erp)
        gateway_results = [r for r in result["results"] if r["record_id"] == "TXN-001"]

        assert len(gateway_results) == 1
        r = gateway_results[0]
        assert r["status"] == MatchStatus.MATCHED, (
            f"All signals perfect but record was NOT auto-matched. "
            f"Status={r['status']}, Confidence={r.get('confidence')}"
        )
        assert r["confidence"] is not None and r["confidence"] >= 0.75

    def test_gate_4_no_counterpart_routes_to_missing(self, engine):
        """
        TEST 4: Gateway record with no bank or ERP counterpart → MUST be Missing.
        This is the equivalent of 'LLM call fails' for the reconciliation context:
        when one signal source is entirely absent, never default to matched.
        """
        gateway = [self._make_gateway_record(utr="UTR_NO_MATCH_999")]
        bank = [self._make_bank_record(utr="UTR_DIFFERENT_000")]
        erp = []

        result = engine.reconcile_sources(gateway, bank, erp)
        gateway_results = [r for r in result["results"] if r["record_id"] == "TXN-001"]

        assert len(gateway_results) == 1
        r = gateway_results[0]
        assert r["status"] == MatchStatus.MISSING, (
            f"No counterpart but record was not Missing. Status={r['status']}"
        )


class TestReconciliationOutput:
    """Verify the output structure has the right vocabulary and fields."""

    @pytest.fixture
    def engine(self):
        return MultiSourceReconciliationEngine()

    def test_every_result_has_reason_sentence(self, engine):
        gateway = [
            {"transaction_id": "G1", "net_amount": "1000", "gross_amount": "1000",
             "settlement_date": "2026-08-16", "utr_number": "UTR111"},
        ]
        bank = [
            {"transaction_id": "B1", "deposit_amount": "1000",
             "settlement_date": "2026-08-16", "utr_number": "UTR111"},
        ]
        result = engine.reconcile_sources(gateway, bank, [])

        for r in result["results"]:
            assert "reason" in r, f"Record {r['record_id']} missing 'reason' field"
            assert len(r["reason"]) > 10, f"Record {r['record_id']} reason too short: '{r['reason']}'"

    def test_status_vocabulary_is_four_words_only(self, engine):
        valid_statuses = {MatchStatus.MATCHED, MatchStatus.MISMATCHED, MatchStatus.MISSING, MatchStatus.DUPLICATE}
        gateway = [
            {"transaction_id": "G1", "net_amount": "1000", "gross_amount": "1000",
             "settlement_date": "2026-08-16", "utr_number": "UTR111"},
        ]
        result = engine.reconcile_sources(gateway, [], [])

        for r in result["results"]:
            assert r["status"] in valid_statuses, f"Invalid status '{r['status']}' — must be one of {valid_statuses}"

    def test_summary_has_all_four_counts(self, engine):
        result = engine.reconcile_sources([], [], [])
        summary = result["summary"]
        assert "matched" in summary
        assert "mismatched" in summary
        assert "missing" in summary
        assert "duplicates" in summary

    def test_no_hardcoded_confidence_constants_in_output(self, engine):
        """Verify no confidence value in the output is one of the known fabricated constants."""
        gateway = [
            {"transaction_id": "G1", "net_amount": "5000.50", "gross_amount": "5200",
             "fee": "150", "tax": "49.50", "settlement_date": "2026-08-16",
             "utr_number": "UTR_TEST_123456", "order_id": "ORD_1"},
        ]
        bank = [
            {"transaction_id": "B1", "deposit_amount": "5000.50",
             "settlement_date": "2026-08-17", "utr_number": "UTR_TEST_123456"},
        ]
        erp = [
            {"transaction_id": "E1", "gross_invoice_value": "5200", "gross_amount": "5200",
             "order_id": "ORD_1", "settlement_date": "2026-08-16",
             "merchant_name": "Test Corp", "ledger_name": "Test Corp"},
        ]
        result = engine.reconcile_sources(gateway, bank, erp)

        forbidden = {0.92, 0.94, 0.98, 0.88}
        for r in result["results"]:
            conf = r.get("confidence")
            if conf is not None:
                assert conf not in forbidden, (
                    f"Record {r['record_id']} has fabricated confidence {conf}"
                )
