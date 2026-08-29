"""
Certus AI Finance Controller — Championship Logic Unit Test Suite
Lead Architect: Aditya Singh

Tests:
1. Many-to-One Batch Settlement Solver (Subset-Sum DP in integer paisa).
2. Dynamic Tiered MDR Rate-Card Classifier (UPI Zero MDR, Card Tiers, GST).
3. Cryptographic Binary SHA-256 Merkle Tree Solvency Engine.
4. Autonomous Bank Dispute Demand Notice Generator.
"""

import pytest
from app.services.batch_solver import solve_many_to_one_settlements
from app.services.mdr_classifier import MDRRateCardClassifier
from app.core.merkle_engine import MerkleTree
from app.agent.dispute_generator import DisputeNoticeGenerator


def test_many_to_one_batch_solver_exact_match():
    """Verify that multiple gateway transactions are correctly resolved into a single bank credit."""
    gateway_records = [
        {"payment_id": "pay_01", "net_amount_paisa": 500000},  # ₹5,000
        {"payment_id": "pay_02", "net_amount_paisa": 650000},  # ₹6,500
        {"payment_id": "pay_03", "net_amount_paisa": 300000},  # ₹3,000
        {"payment_id": "pay_04", "net_amount_paisa": 120000},  # ₹1,200 (unrelated)
    ]

    bank_credits = [
        {"statement_id": "bank_01", "credit_amount_paisa": 1450000, "utr": "HDFC44910283910"},  # ₹14,500
    ]

    matches, rem_gateways, rem_banks = solve_many_to_one_settlements(gateway_records, bank_credits)

    assert len(matches) == 1
    match = matches[0]
    assert match["match_type"] == "MANY_TO_ONE_BATCH"
    assert match["bank_credit_paisa"] == 1450000
    assert match["total_gateway_net_paisa"] == 1450000
    assert match["batch_count"] == 3
    assert set(match["gateway_payment_ids"]) == {"pay_01", "pay_02", "pay_03"}
    assert len(rem_gateways) == 1
    assert rem_gateways[0]["payment_id"] == "pay_04"
    assert len(rem_banks) == 0


def test_mdr_classifier_zero_fee_upi():
    """Verify that UPI transactions with zero fees pass, and unauthorized fees are flagged."""
    # 1. Valid zero fee UPI
    res_valid = MDRRateCardClassifier.evaluate_fee(
        payment_method="UPI",
        gross_amount_paisa=100000,  # ₹1,000
        actual_fee_deducted_paisa=0,
    )
    assert res_valid["is_valid"] is True
    assert res_valid["anomaly_type"] == "NONE"

    # 2. Invalid UPI with 2% fee deducted
    res_invalid = MDRRateCardClassifier.evaluate_fee(
        payment_method="UPI",
        gross_amount_paisa=100000,  # ₹1,000
        actual_fee_deducted_paisa=2360,  # ₹23.60
    )
    assert res_invalid["is_valid"] is False
    assert res_invalid["anomaly_type"] == "ZERO_MDR_UPI_INCORRECTLY_CHARGED"
    assert res_invalid["action_required"] == "DEMAND_FEE_REVERSAL"


def test_mdr_classifier_credit_card_tier():
    """Verify domestic credit card 2.00% + 18% GST evaluation."""
    # ₹10,000 gross -> Base fee ₹200 (2.0%) + 18% GST (₹36) = ₹236 (23,600 paisa)
    res = MDRRateCardClassifier.evaluate_fee(
        payment_method="CREDIT_CARD",
        gross_amount_paisa=1000000,
        actual_fee_deducted_paisa=23600,
    )
    assert res["is_valid"] is True
    assert res["expected_fee_paisa"] == 23600


def test_merkle_tree_solvency_proof():
    """Verify binary SHA-256 Merkle tree calculation and deterministic root generation."""
    records = [
        {"txn_id": "TXN_01", "amount_paisa": 10000},
        {"txn_id": "TXN_02", "amount_paisa": 25000},
        {"txn_id": "TXN_03", "amount_paisa": 50000},
    ]

    tree = MerkleTree(records)
    root = tree.get_root()

    assert root is not None
    assert len(root) == 64  # SHA-256 hex string
    assert len(tree.leaves) == 3

    # Ensure deterministic reproduction
    tree2 = MerkleTree(records)
    assert tree2.get_root() == root


def test_dispute_notice_generator():
    """Verify that formal legal dispute demand letters are compiled correctly."""
    exception = {
        "record_id": "pay_MDR_OVERCHARGE_901",
        "utr": "HDFCNODAL99018273",
        "amount_paisa": 1450000,
        "variance_paisa": 21750,
        "trap_rule": "INV_RULE_04_MDR_DRIFT",
    }

    notice = DisputeNoticeGenerator.generate_demand_notice(exception)

    assert notice["record_id"] == "pay_MDR_OVERCHARGE_901"
    assert notice["utr"] == "HDFCNODAL99018273"
    assert notice["variance_formatted"] == "₹217.50"
    assert "FORMAL DEMAND NOTICE" in notice["letter_markdown"]
    assert "RBI Master Directions" in notice["letter_markdown"]
    assert "72 hours" in notice["letter_markdown"]
