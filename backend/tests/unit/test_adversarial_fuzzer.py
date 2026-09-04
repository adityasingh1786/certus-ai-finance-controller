"""
Unit Tests for Automated Adversarial Invariant Fuzzer Engine
Verifies dynamic mutation synthesis, salami-slicing fee drift, replay race condition traps, and 100% quarantine neutralization.
"""

import pytest
from app.services.adversarial_fuzzer import AdversarialInvariantFuzzer, adversarial_fuzzer


def test_adversarial_salami_mutations_generation():
    base_record = {
        "transaction_id": "tx_base",
        "merchant_id": "merch_1",
        "settlement_date": "2026-08-15",
        "gross_amount": "2000.00",
        "net_amount": "1960.00",
        "fee": "40.00",
        "tax": "0.00",
        "currency": "INR",
        "status": "settled",
    }
    mutations = adversarial_fuzzer.generate_salami_mutations(base_record, count=20)
    assert len(mutations) == 20
    for m in mutations:
        assert "SALAMI_" in m["transaction_id"]
        assert m["attack_vector"] == "SALAMI_SLICING_ROUNDING_LEAKAGE"


def test_adversarial_parity_inversions():
    base_record = {
        "transaction_id": "tx_base",
        "merchant_id": "merch_1",
        "settlement_date": "2026-08-15",
        "gross_amount": "2000.00",
        "net_amount": "1960.00",
        "fee": "40.00",
        "tax": "0.00",
        "currency": "INR",
        "status": "settled",
    }
    inversions = adversarial_fuzzer.generate_parity_inversions(base_record)
    assert len(inversions) == 3

    # Verify negative gross is generated
    neg_gross = next(inv for inv in inversions if inv["attack_vector"] == "NEGATIVE_GROSS_AMOUNT")
    assert neg_gross["gross_amount"] == "-1000.00"

    # Verify net > gross is generated
    net_gt = next(inv for inv in inversions if inv["attack_vector"] == "NET_EXCEEDING_GROSS")
    assert float(net_gt["net_amount"]) > float(net_gt["gross_amount"])


def test_adversarial_fuzzing_campaign_neutralization():
    fuzzer = AdversarialInvariantFuzzer()
    report = fuzzer.run_fuzzing_campaign(iterations_per_vector=15)

    assert report["campaign_status"] == "COMPLETED"
    assert report["total_attack_vectors_injected"] > 0
    # Must achieve 100.00% neutralization with 0 leaks
    assert report["attack_vectors_leaked"] == 0
    assert report["attack_vectors_neutralized"] == report["total_attack_vectors_injected"]
    assert report["resilience_rate"] == "100.00%"
    assert report["is_impervious"] is True
    assert len(report["rule_trap_breakdown"]) > 0
