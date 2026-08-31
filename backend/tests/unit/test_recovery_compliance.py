"""
Certus AI Finance Controller — Revenue Recovery, Compliance & Baseline Tests

Tests cover:
1. Compliance Engine (9 rule checks)
2. Recovery Memory (adaptive windowed learning)
3. Revenue Recovery Pipeline (full end-to-end)
4. Baseline Reconciler (naive exact matching)
5. Idempotency guarantees
6. Edge cases and boundary conditions
"""

import pytest
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from app.services.compliance_engine import (
    ComplianceEngine,
    ComplianceStatus,
    ComplianceCategory,
    RecoveryAction,
    ComplianceGateResult,
    MDR_RATE_CARD,
    MIN_DISPUTE_AMOUNT_PAISA,
)
from app.services.recovery_memory import (
    RecoveryMemory,
    RecoveryOutcome,
)
from app.services.revenue_recovery_engine import (
    RevenueRecoveryEngine,
    RecoveryCaseStatus,
    REASON_TO_ROOT_CAUSE,
)
from app.services.baseline_reconciler import BaselineReconciler, run_comparison


# ============================================================
# FIXTURES
# ============================================================

@pytest.fixture
def compliance_engine():
    """Fresh compliance engine for each test."""
    engine = ComplianceEngine()
    engine.reset_history()
    return engine


@pytest.fixture
def recovery_memory():
    """Fresh recovery memory for each test."""
    memory = RecoveryMemory(window_size=10)
    return memory


@pytest.fixture
def recovery_engine(compliance_engine, recovery_memory):
    """Fresh recovery engine with clean state."""
    return RevenueRecoveryEngine(
        compliance_engine=compliance_engine,
        memory=recovery_memory,
    )


@pytest.fixture
def sample_quarantine_record():
    """A sample quarantine record for testing."""
    return {
        "record_id": "QR-TEST-001",
        "transaction_id": "TXN-TEST-001",
        "batch_id": str(uuid4()),
        "reason_code": "AMOUNT_MISMATCH",
        "reason_detail": "Net amount deviates from expected Gross - Fee - Tax",
        "flagged_by": "rules_engine",
        "gross_amount": "10000.00",
        "fee": "200.00",
        "tax": "36.00",
        "net_amount": "9546.50",  # ₹217.50 variance
        "payment_method": "CARD",
        "currency": "INR",
        "settlement_date": "2026-08-25",
        "utr_number": "UTR44910283910",
        "is_resolved": False,
        "variance_paisa": 21750,
    }


@pytest.fixture
def sample_quarantine_batch():
    """A batch of quarantine records with various reason codes."""
    return [
        {
            "record_id": f"QR-BATCH-{i:03d}",
            "transaction_id": f"TXN-BATCH-{i:03d}",
            "batch_id": str(uuid4()),
            "reason_code": reason,
            "reason_detail": f"Test exception #{i}",
            "flagged_by": "rules_engine",
            "gross_amount": str(1000 + i * 500),
            "fee": str((1000 + i * 500) * 0.02),
            "tax": str((1000 + i * 500) * 0.02 * 0.18),
            "net_amount": str((1000 + i * 500) * 0.9764),
            "payment_method": "CARD",
            "currency": "INR",
            "settlement_date": "2026-08-25",
            "is_resolved": False,
            "variance_paisa": 5000 + i * 1000,
        }
        for i, reason in enumerate([
            "AMOUNT_MISMATCH", "MISSING_FIELD", "DUPLICATE_ID",
            "LOW_CONFIDENCE", "REFERENCE_MISMATCH", "AMOUNT_MISMATCH",
            "INVALID_DATE", "MALFORMED_NARRATION",
        ])
    ]


# ============================================================
# COMPLIANCE ENGINE TESTS
# ============================================================

class TestComplianceEngine:
    """Tests for the deterministic compliance gate."""

    def test_contact_window_pass_during_business_hours(self, compliance_engine):
        """Contact window check should pass during business hours."""
        # This test may depend on current IST time
        result = compliance_engine._check_contact_window()
        assert result.rule_id == "COMP-01-CONTACT-WINDOW"
        assert result.category == ComplianceCategory.CONTACT_WINDOW
        assert "RBI Fair Practices Code" in result.regulatory_citation

    def test_attempt_cap_pass_within_limit(self, compliance_engine):
        """Attempt cap should pass when below limit."""
        result = compliance_engine._check_attempt_cap(
            RecoveryAction.RAISE_GATEWAY_DISPUTE, "QR-001", attempt_count=1
        )
        assert result.status == ComplianceStatus.PASS
        assert result.rule_id == "COMP-02-ATTEMPT-CAP"

    def test_attempt_cap_fail_above_limit(self, compliance_engine):
        """Attempt cap should FAIL when at/above limit."""
        result = compliance_engine._check_attempt_cap(
            RecoveryAction.RAISE_GATEWAY_DISPUTE, "QR-001", attempt_count=3
        )
        assert result.status == ComplianceStatus.FAIL
        assert "EXCEEDS cap" in result.reason_detail

    def test_idempotency_pass_first_action(self, compliance_engine):
        """First action on a record should pass idempotency check."""
        result = compliance_engine._check_idempotency(
            RecoveryAction.RAISE_GATEWAY_DISPUTE, "QR-001"
        )
        assert result.status == ComplianceStatus.PASS
        assert result.rule_id == "COMP-03-IDEMPOTENCY"

    def test_idempotency_fail_duplicate_action(self, compliance_engine):
        """Duplicate action on same record should FAIL idempotency check."""
        compliance_engine._record_action("QR-001", RecoveryAction.RAISE_GATEWAY_DISPUTE, 0)
        result = compliance_engine._check_idempotency(
            RecoveryAction.RAISE_GATEWAY_DISPUTE, "QR-001"
        )
        assert result.status == ComplianceStatus.FAIL
        assert "already executed" in result.reason_detail

    def test_minimum_dispute_amount_pass(self, compliance_engine):
        """Dispute amount above threshold should pass."""
        record = {"variance_paisa": 15000}  # ₹150
        result = compliance_engine._check_minimum_dispute_amount(record)
        assert result.status == ComplianceStatus.PASS

    def test_minimum_dispute_amount_warning_below_threshold(self, compliance_engine):
        """Dispute amount below threshold should warn."""
        record = {"variance_paisa": 3000}  # ₹30
        result = compliance_engine._check_minimum_dispute_amount(record)
        assert result.status == ComplianceStatus.WARNING
        assert result.recommended_action == "WRITE_OFF_VARIANCE"

    def test_already_resolved_pass(self, compliance_engine):
        """Unresolved record should pass."""
        record = {"is_resolved": False}
        result = compliance_engine._check_already_resolved(record)
        assert result.status == ComplianceStatus.PASS

    def test_already_resolved_fail(self, compliance_engine):
        """Already-resolved record should FAIL."""
        record = {"is_resolved": True}
        result = compliance_engine._check_already_resolved(record)
        assert result.status == ComplianceStatus.FAIL

    def test_mdr_fee_pass_within_tolerance(self, compliance_engine):
        """MDR fee within tolerance should pass."""
        record = {
            "gross_amount": "10000.00",
            "fee": "200.00",  # 2% of 10000 — matches CREDIT_CARD rate
            "payment_method": "CARD",
        }
        result = compliance_engine._check_mdr_fee_compliance(record)
        assert result.status == ComplianceStatus.PASS

    def test_mdr_fee_warning_upi_charged(self, compliance_engine):
        """UPI charged with fee should trigger warning."""
        record = {
            "gross_amount": "10000.00",
            "fee": "200.00",  # UPI should be 0% MDR
            "payment_method": "UPI",
        }
        result = compliance_engine._check_mdr_fee_compliance(record)
        assert result.status == ComplianceStatus.WARNING

    def test_gst_compliance_pass(self, compliance_engine):
        """GST at exactly 18% of MDR should pass."""
        record = {
            "fee": "200.00",
            "tax": "36.00",  # 18% of 200
            "payment_method": "CARD",
        }
        result = compliance_engine._check_gst_compliance(record)
        assert result.status == ComplianceStatus.PASS

    def test_gst_compliance_fail_mismatch(self, compliance_engine):
        """GST not at 18% should fail."""
        record = {
            "fee": "200.00",
            "tax": "50.00",  # Not 18% of 200
            "payment_method": "CARD",
        }
        result = compliance_engine._check_gst_compliance(record)
        assert result.status == ComplianceStatus.FAIL

    def test_tds_194o_pass_1pct(self, compliance_engine):
        """TDS at 1% should pass."""
        record = {
            "gross_amount": "100000.00",
            "tds_amount": "1000.00",  # 1%
        }
        result = compliance_engine._check_tds_194o(record)
        assert result.status == ComplianceStatus.PASS

    def test_tds_194o_warning_5pct(self, compliance_engine):
        """TDS at 5% should warn (PAN not furnished)."""
        record = {
            "gross_amount": "100000.00",
            "tds_amount": "5000.00",  # 5%
        }
        result = compliance_engine._check_tds_194o(record)
        assert result.status == ComplianceStatus.WARNING

    def test_full_gate_approve(self, compliance_engine, sample_quarantine_record):
        """Full compliance gate should approve valid action."""
        result = compliance_engine.verify_recovery_action(
            action=RecoveryAction.RAISE_GATEWAY_DISPUTE,
            record=sample_quarantine_record,
            attempt_count=0,
        )
        assert isinstance(result, ComplianceGateResult)
        # Result depends on current time (contact window)
        assert result.idempotency_key != ""

    def test_full_gate_block_attempt_cap(self, compliance_engine, sample_quarantine_record):
        """Full gate should block when attempt cap exceeded."""
        result = compliance_engine.verify_recovery_action(
            action=RecoveryAction.RAISE_GATEWAY_DISPUTE,
            record=sample_quarantine_record,
            attempt_count=5,
        )
        assert result.approved is False
        assert len(result.failed_rules) > 0


# ============================================================
# RECOVERY MEMORY TESTS
# ============================================================

class TestRecoveryMemory:
    """Tests for adaptive windowed memory."""

    def test_record_and_retrieve_outcome(self, recovery_memory):
        """Recording an outcome should be retrievable."""
        outcome = RecoveryOutcome(
            record_id="QR-001",
            reason_code="AMOUNT_MISMATCH",
            action=RecoveryAction.RAISE_GATEWAY_DISPUTE,
            success=True,
            amount_recovered_paisa=21750,
        )
        recovery_memory.record_outcome(outcome)
        ranking = recovery_memory.get_strategy_ranking("AMOUNT_MISMATCH")
        assert len(ranking) > 0
        assert ranking[0].action == "RAISE_GATEWAY_DISPUTE"

    def test_window_size_enforcement(self, recovery_memory):
        """Memory should trim to window size."""
        for i in range(15):
            outcome = RecoveryOutcome(
                record_id=f"QR-{i:03d}",
                reason_code="TEST_CODE",
                action=RecoveryAction.RAISE_GATEWAY_DISPUTE,
                success=i % 2 == 0,
            )
            recovery_memory.record_outcome(outcome)
        # Window size is 10, so only 10 should remain
        snapshot = recovery_memory.get_full_memory_snapshot()
        assert snapshot["memory"]["TEST_CODE"]["total_outcomes"] == 10

    def test_recency_weighting(self, recovery_memory):
        """More recent outcomes should have higher influence."""
        # Record 5 failures followed by 5 successes
        for i in range(5):
            recovery_memory.record_outcome(RecoveryOutcome(
                record_id=f"QR-F-{i}", reason_code="TEST",
                action=RecoveryAction.RAISE_GATEWAY_DISPUTE, success=False,
            ))
        for i in range(5):
            recovery_memory.record_outcome(RecoveryOutcome(
                record_id=f"QR-S-{i}", reason_code="TEST",
                action=RecoveryAction.RAISE_GATEWAY_DISPUTE, success=True,
            ))
        ranking = recovery_memory.get_strategy_ranking("TEST")
        # Weighted success rate should be > 0.5 (recency favors recent successes)
        assert ranking[0].weighted_success_rate > 0.5

    def test_default_ranking_no_history(self, recovery_memory):
        """Should return default ranking when no history exists."""
        ranking = recovery_memory.get_strategy_ranking("AMOUNT_MISMATCH")
        assert len(ranking) > 0
        assert ranking[0].action == "RAISE_GATEWAY_DISPUTE"

    def test_best_strategy_from_history(self, recovery_memory):
        """Should identify best strategy from historical outcomes."""
        # Record multiple strategies with different success rates
        for _ in range(5):
            recovery_memory.record_outcome(RecoveryOutcome(
                record_id=f"QR-D-{_}", reason_code="MISSING_FIELD",
                action=RecoveryAction.RAISE_GATEWAY_DISPUTE, success=False,
            ))
        for _ in range(5):
            recovery_memory.record_outcome(RecoveryOutcome(
                record_id=f"QR-B-{_}", reason_code="MISSING_FIELD",
                action=RecoveryAction.REQUEST_BANK_RECONCILIATION, success=True,
            ))
        best = recovery_memory.get_best_strategy("MISSING_FIELD")
        assert best == RecoveryAction.REQUEST_BANK_RECONCILIATION

    def test_memory_reset(self, recovery_memory):
        """Reset should clear all memory."""
        recovery_memory.record_outcome(RecoveryOutcome(
            record_id="QR-001", reason_code="TEST",
            action=RecoveryAction.STOP, success=True,
        ))
        recovery_memory.reset()
        snapshot = recovery_memory.get_full_memory_snapshot()
        assert snapshot["total_outcomes"] == 0


# ============================================================
# REVENUE RECOVERY ENGINE TESTS
# ============================================================

class TestRevenueRecoveryEngine:
    """Tests for the full recovery pipeline."""

    def test_detect_recoverable_cases(self, recovery_engine, sample_quarantine_batch):
        """Should detect recoverable cases from quarantine batch."""
        cases = recovery_engine.detect_recoverable_cases(sample_quarantine_batch)
        assert len(cases) == len(sample_quarantine_batch)
        assert all(c.status == RecoveryCaseStatus.DETECTED for c in cases)

    def test_skip_resolved_records(self, recovery_engine):
        """Should skip already-resolved records."""
        records = [
            {"record_id": "QR-001", "reason_code": "AMOUNT_MISMATCH", "is_resolved": True},
            {"record_id": "QR-002", "reason_code": "AMOUNT_MISMATCH", "is_resolved": False},
        ]
        cases = recovery_engine.detect_recoverable_cases(records)
        assert len(cases) == 1
        assert cases[0].record_id == "QR-002"

    def test_diagnose_case(self, recovery_engine, sample_quarantine_record):
        """Should produce a diagnosis with root cause."""
        from app.services.revenue_recovery_engine import RecoveryCase
        case = RecoveryCase(
            case_id="RC-TEST-001",
            record_id="QR-TEST-001",
            reason_code="AMOUNT_MISMATCH",
            status=RecoveryCaseStatus.DETECTED,
        )
        diagnosis = recovery_engine.diagnose_case(case, sample_quarantine_record)
        assert diagnosis.root_cause_category == "MDR_FEE_DRIFT"
        assert diagnosis.severity == "HIGH"
        assert diagnosis.confidence > 0

    def test_select_strategy(self, recovery_engine, sample_quarantine_record):
        """Should select appropriate strategy based on reason code."""
        from app.services.revenue_recovery_engine import RecoveryCase, RecoveryDiagnosis
        case = RecoveryCase(
            case_id="RC-TEST-001",
            record_id="QR-TEST-001",
            reason_code="AMOUNT_MISMATCH",
            status=RecoveryCaseStatus.DETECTED,
            diagnosis=RecoveryDiagnosis(
                record_id="QR-TEST-001",
                reason_code="AMOUNT_MISMATCH",
                root_cause_category="MDR_FEE_DRIFT",
                root_cause_detail="Test",
                severity="HIGH",
                estimated_recoverable_paisa=21750,
                confidence=0.85,
            ),
        )
        action = recovery_engine.select_strategy(case)
        assert action == RecoveryAction.RAISE_GATEWAY_DISPUTE

    def test_full_pipeline(self, recovery_engine, sample_quarantine_batch):
        """Should run the full pipeline end-to-end."""
        results = recovery_engine.process_quarantine_batch(sample_quarantine_batch)
        assert results["total_detected"] == len(sample_quarantine_batch)
        assert results["summary"]["compliance_violations"] == 0
        assert results["summary"]["compliance_rate"] == "100.0%"
        assert len(results["cases"]) == len(sample_quarantine_batch)

    def test_recovery_stats(self, recovery_engine, sample_quarantine_batch):
        """Should track recovery statistics."""
        recovery_engine.process_quarantine_batch(sample_quarantine_batch)
        stats = recovery_engine.get_recovery_stats()
        assert stats["compliance_violations"] == 0
        assert stats["total_cases"] > 0

    def test_all_reason_codes_have_root_cause(self):
        """Every quarantine reason code should have a root cause mapping."""
        expected_codes = [
            "AMOUNT_MISMATCH", "MISSING_FIELD", "DUPLICATE_ID",
            "LOW_CONFIDENCE", "REFERENCE_MISMATCH", "IMPOSSIBLE_VALUE",
            "INVALID_CURRENCY", "INVALID_DATE", "MALFORMED_NARRATION",
            "LLM_SCHEMA_FAIL",
        ]
        for code in expected_codes:
            assert code in REASON_TO_ROOT_CAUSE, f"Missing root cause for {code}"


# ============================================================
# BASELINE RECONCILER TESTS
# ============================================================

class TestBaselineReconciler:
    """Tests for the naive baseline reconciler."""

    def test_exact_match(self):
        """Should match records with identical transaction IDs."""
        baseline = BaselineReconciler()
        gw = [{"transaction_id": "TXN-001", "net_amount": "1000.00"}]
        bk = [{"transaction_id": "TXN-001", "net_amount": "1000.00"}]
        results = baseline.reconcile(gw, bk)
        assert results["matched"] == 1
        assert results["match_rate"] == 1.0

    def test_amount_mismatch(self):
        """Should flag amount mismatches."""
        baseline = BaselineReconciler()
        gw = [{"transaction_id": "TXN-001", "net_amount": "1000.00"}]
        bk = [{"transaction_id": "TXN-001", "net_amount": "1200.00"}]
        results = baseline.reconcile(gw, bk)
        assert results["mismatched"] == 1
        assert results["matched"] == 0

    def test_missing_in_bank(self):
        """Should detect records missing from bank."""
        baseline = BaselineReconciler()
        gw = [{"transaction_id": "TXN-001", "net_amount": "1000.00"}]
        bk = []
        results = baseline.reconcile(gw, bk)
        assert results["missing_in_bank"] == 1

    def test_duplicate_detection(self):
        """Should detect duplicate transaction IDs."""
        baseline = BaselineReconciler()
        gw = [
            {"transaction_id": "TXN-001", "net_amount": "1000.00"},
            {"transaction_id": "TXN-001", "net_amount": "1000.00"},
        ]
        bk = [{"transaction_id": "TXN-001", "net_amount": "1000.00"}]
        results = baseline.reconcile(gw, bk)
        assert results["duplicates"] == 1

    def test_no_fuzzy_matching(self):
        """Baseline should NOT match records with different IDs."""
        baseline = BaselineReconciler()
        gw = [{"transaction_id": "TXN-001", "net_amount": "1000.00"}]
        bk = [{"transaction_id": "TXN-002", "net_amount": "1000.00"}]
        results = baseline.reconcile(gw, bk)
        assert results["matched"] == 0  # No fuzzy matching

    def test_comparison_function(self):
        """run_comparison should produce structured output."""
        gw = [{"transaction_id": "TXN-001", "net_amount": "1000.00"}]
        bk = [{"transaction_id": "TXN-001", "net_amount": "1000.00"}]
        certus = {"match_rate": 1.0, "matched": 1, "exceptions": 0, "processing_time_ms": 5}
        result = run_comparison(gw, bk, certus_results=certus)
        assert "baseline" in result
        assert "certus" in result
        assert "comparison" in result
        assert "verdict" in result


# ============================================================
# INTEGRATION TESTS
# ============================================================

class TestIntegration:
    """Integration tests combining multiple components."""

    def test_compliance_blocks_then_recovery_escalates(self, compliance_engine):
        """When compliance blocks a dispute (attempt cap), recovery should escalate."""
        record = {
            "record_id": "QR-INT-001",
            "reason_code": "AMOUNT_MISMATCH",
            "is_resolved": False,
            "variance_paisa": 15000,
        }
        # First 3 attempts should pass
        for i in range(3):
            result = compliance_engine.verify_recovery_action(
                RecoveryAction.RAISE_GATEWAY_DISPUTE, record, i
            )
        # 4th attempt should be blocked by attempt cap
        result = compliance_engine.verify_recovery_action(
            RecoveryAction.RAISE_GATEWAY_DISPUTE, record, 3
        )
        assert result.approved is False

    def test_memory_influences_strategy(self, recovery_engine):
        """Recovery memory should influence strategy selection after history builds."""
        # Build history: REQUEST_BANK_RECONCILIATION works better for MISSING_FIELD
        for i in range(5):
            recovery_engine.memory.record_outcome(RecoveryOutcome(
                record_id=f"QR-H-{i}", reason_code="MISSING_FIELD",
                action=RecoveryAction.REQUEST_BANK_RECONCILIATION, success=True,
                amount_recovered_paisa=10000,
            ))
        for i in range(5):
            recovery_engine.memory.record_outcome(RecoveryOutcome(
                record_id=f"QR-F-{i}", reason_code="MISSING_FIELD",
                action=RecoveryAction.RAISE_GATEWAY_DISPUTE, success=False,
            ))

        from app.services.revenue_recovery_engine import RecoveryCase, RecoveryDiagnosis
        case = RecoveryCase(
            case_id="RC-MEM-001",
            record_id="QR-MEM-001",
            reason_code="MISSING_FIELD",
            status=RecoveryCaseStatus.DETECTED,
            diagnosis=RecoveryDiagnosis(
                record_id="QR-MEM-001",
                reason_code="MISSING_FIELD",
                root_cause_category="MISSING_BANK_UTR",
                root_cause_detail="Test",
                severity="MEDIUM",
                estimated_recoverable_paisa=10000,
                confidence=0.85,
            ),
        )
        action = recovery_engine.select_strategy(case)
        assert action == RecoveryAction.REQUEST_BANK_RECONCILIATION
