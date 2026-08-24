"""
AI Finance Controller — Unit Tests for Multi-Source Reconciliation Engine
"""

import pytest
from app.services.reconciliation_service import MultiSourceReconciliationEngine


@pytest.fixture
def recon_engine():
    return MultiSourceReconciliationEngine()


def test_exact_utr_and_invoice_match(recon_engine):
    gateway = [{
        "transaction_id": "TXN_001",
        "utr_number": "UTR123456",
        "order_id": "ORD_001",
        "invoice_number": "INV_001",
        "gross_amount": "1000.00",
        "net_amount": "980.00",
        "currency": "INR",
    }]
    bank = [{
        "transaction_id": "BNK_001",
        "utr_number": "UTR123456",
        "net_amount": "980.00",
        "narration": "CREDIT UTR123456",
    }]
    erp = [{
        "transaction_id": "ERP_001",
        "invoice_number": "INV_001",
        "order_id": "ORD_001",
        "gross_amount": "1000.00",
    }]

    result = recon_engine.reconcile_sources(gateway, bank, erp)
    assert result["summary"]["matched_count"] == 1
    assert result["summary"]["unmatched_gateway_count"] == 0
    assert result["summary"]["exceptions_count"] == 0
    assert result["matches"][0]["confidence"] >= 0.95


def test_amount_mismatch_exception(recon_engine):
    gateway = [{
        "transaction_id": "TXN_002",
        "utr_number": "UTR999999",
        "gross_amount": "5000.00",
        "net_amount": "4900.00",
    }]
    bank = [{
        "transaction_id": "BNK_002",
        "utr_number": "UTR999999",
        "net_amount": "4500.00",  # Mismatch of 400
    }]
    erp = []

    result = recon_engine.reconcile_sources(gateway, bank, erp)
    assert len(result["exceptions"]) >= 1
    assert result["exceptions"][0]["type"] == "AMOUNT_MISMATCH_BANK"


def test_fuzzy_merchant_matching(recon_engine):
    gateway = [{
        "transaction_id": "TXN_003",
        "merchant_name": "Acme Retail Technologies India Private Limited",
        "gross_amount": "2500.00",
        "net_amount": "2450.00",
    }]
    bank = []
    erp = [{
        "transaction_id": "ERP_003",
        "merchant_name": "Acme Retail Tech India Pvt Ltd",
        "gross_amount": "2500.00",
    }]

    result = recon_engine.reconcile_sources(gateway, bank, erp)
    assert result["summary"]["matched_count"] == 1
    assert "fuzzy" in result["matches"][0]["match_reason"].lower()
