"""
Unit Tests for Kuhn-Munkres (Hungarian) Bipartite Reconciliation Matcher
Verifies optimal bipartite assignment, cost matrix scoring, and residual isolation.
"""

import pytest
from app.services.bipartite_matcher import BipartiteHungarianMatcher, bipartite_matcher


def test_bipartite_exact_matching():
    gw_records = [
        {"transaction_id": "gw_1", "merchant_id": "Fresh Mart", "net_amount": "1500.00", "settlement_date": "2026-08-15"},
        {"transaction_id": "gw_2", "merchant_id": "Urban Store", "net_amount": "2300.00", "settlement_date": "2026-08-15"},
    ]
    bank_records = [
        # Inverted order to test permutation resolution
        {"id": "bk_2", "narration": "UPI/CR/URBAN STORE/MUMBAI", "amount": "2300.00", "date": "2026-08-15"},
        {"id": "bk_1", "narration": "NEFT/FRESH MART/DELHI", "amount": "1500.00", "date": "2026-08-15"},
    ]

    matched, rem_gw, rem_bk = bipartite_matcher.match_bipartite(gw_records, bank_records)

    assert len(matched) == 2
    assert len(rem_gw) == 0
    assert len(rem_bk) == 0

    # Verify correct 1-to-1 pairings
    pair_1 = next(m for m in matched if m["gateway_record"]["transaction_id"] == "gw_1")
    assert pair_1["bank_record"]["id"] == "bk_1"
    assert pair_1["confidence"] >= 0.85

    pair_2 = next(m for m in matched if m["gateway_record"]["transaction_id"] == "gw_2")
    assert pair_2["bank_record"]["id"] == "bk_2"
    assert pair_2["confidence"] >= 0.85


def test_bipartite_unmatched_cost_threshold_rejection():
    gw_records = [
        {"transaction_id": "gw_x", "merchant_id": "Alpha Corp", "net_amount": "100.00", "settlement_date": "2026-08-01"},
    ]
    bank_records = [
        {"id": "bk_y", "narration": "TOTALLY UNRELATED OMEGA ENTITY", "amount": "99999.00", "date": "2026-08-25"},
    ]

    matched, rem_gw, rem_bk = bipartite_matcher.match_bipartite(gw_records, bank_records)

    # Cost exceeds threshold (amount and narration are completely disparate) -> must reject!
    assert len(matched) == 0
    assert len(rem_gw) == 1
    assert len(rem_bk) == 1
