"""
Unit Tests for Cryptographic Merkle Sum Tree Solvency Engine
Verifies mathematical tree sum conservation, non-interactive audit proofs, and solvency logic.
"""

import pytest
from app.core.merkle_sum_tree import MerkleSumTree, MerkleSumNode


def test_empty_merkle_sum_tree():
    tree = MerkleSumTree()
    manifest = tree.get_root_manifest()
    assert manifest["total_balance_paisa"] == 0
    assert manifest["total_leaves"] == 0
    assert manifest["merkle_sum_root"] is not None


def test_single_leaf_merkle_sum_tree():
    records = [{"transaction_id": "tx_01", "net_amount": "145.50"}]
    tree = MerkleSumTree(records)
    manifest = tree.get_root_manifest()
    assert manifest["total_balance_paisa"] == 14550
    assert manifest["total_leaves"] == 1


def test_merkle_sum_tree_conservation_invariant():
    records = [
        {"transaction_id": "tx_01", "net_amount": "100.00"},
        {"transaction_id": "tx_02", "net_amount": "250.25"},
        {"transaction_id": "tx_03", "net_amount": "49.75"},
        {"transaction_id": "tx_04", "net_amount": "1200.00"},
        {"transaction_id": "tx_05", "net_amount": "300.00"},
    ]
    tree = MerkleSumTree(records)
    manifest = tree.get_root_manifest()

    expected_sum = 10000 + 25025 + 4975 + 120000 + 30000
    assert manifest["total_balance_paisa"] == expected_sum
    assert manifest["total_balance_paisa"] == 190000


def test_merkle_sum_inclusion_proof():
    records = [
        {"transaction_id": "tx_01", "net_amount": "100.00"},
        {"transaction_id": "tx_02", "net_amount": "250.25"},
        {"transaction_id": "tx_03", "net_amount": "49.75"},
        {"transaction_id": "tx_04", "net_amount": "1200.00"},
    ]
    tree = MerkleSumTree(records)

    # Prove inclusion for tx_02
    proof = tree.get_inclusion_proof("tx_02")
    assert proof is not None
    assert proof["transaction_id"] == "tx_02"
    assert proof["leaf_paisa"] == 25025

    # Verify inclusion proof
    is_valid = MerkleSumTree.verify_inclusion_proof(proof)
    assert is_valid is True

    # Tamper with proof balance - must fail!
    tampered_proof = dict(proof)
    tampered_proof["leaf_paisa"] = 25026
    assert MerkleSumTree.verify_inclusion_proof(tampered_proof) is False


def test_solvency_verification():
    records = [
        {"transaction_id": "tx_01", "net_amount": "500.00"},
        {"transaction_id": "tx_02", "net_amount": "500.00"},
    ]
    tree = MerkleSumTree(records)

    # Assets >= Liabilities
    cert = tree.verify_solvency(
        liquid_cash_paisa=70000,
        in_transit_paisa=30000,
        liabilities_paisa=80000,
        variance_paisa=0,
    )
    assert cert["is_solvent"] is True
    assert cert["total_assets_paisa"] == 100000
    assert "0x" in cert["solvency_seal"]

    # Insolvency condition
    insolvent_cert = tree.verify_solvency(
        liquid_cash_paisa=10000,
        in_transit_paisa=10000,
        liabilities_paisa=50000,
        variance_paisa=0,
    )
    assert insolvent_cert["is_solvent"] is False
