"""
AI Finance Controller — Unit Tests for Deterministic Rules Engine (Layer 1)
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta
from app.services.rules_engine import RulesEngine
from app.agent.schemas import QuarantineReasonCode


@pytest.fixture
def rules_engine():
    engine = RulesEngine()
    engine.reset_batch()
    return engine


def test_clean_record_passes(rules_engine):
    record = {
        "transaction_id": "TXN-1001",
        "merchant_id": "MRCH001",
        "settlement_date": date.today().isoformat(),
        "gross_amount": "1000.00",
        "fee": "20.00",
        "tax": "3.60",
        "net_amount": "976.40",
        "currency": "INR",
        "payment_method": "UPI",
        "status": "settled",
        "narration": "UPI settlement order 123",
    }
    result, audit = rules_engine.validate_record(record)
    assert result.status == "pass"
    assert result.rule_id == "ALL_RULES_PASSED"


def test_missing_field_quarantined(rules_engine):
    record = {
        "transaction_id": "TXN-1002",
        "merchant_id": "",
        "settlement_date": date.today().isoformat(),
        "gross_amount": "1000.00",
        "currency": "INR",
        "status": "settled",
    }
    result, _ = rules_engine.validate_record(record)
    assert result.status == "fail"
    assert result.reason_code == QuarantineReasonCode.MISSING_FIELD


def test_duplicate_transaction_id(rules_engine):
    record1 = {
        "transaction_id": "TXN-DUP-01",
        "merchant_id": "MRCH001",
        "settlement_date": date.today().isoformat(),
        "gross_amount": "500.00",
        "fee": "10.00",
        "tax": "1.80",
        "net_amount": "488.20",
        "currency": "INR",
        "status": "settled",
    }
    res1, _ = rules_engine.validate_record(record1)
    assert res1.status == "pass"

    record2 = record1.copy()
    res2, _ = rules_engine.validate_record(record2)
    assert res2.status == "fail"
    assert res2.reason_code == QuarantineReasonCode.DUPLICATE_ID


def test_negative_gross_amount(rules_engine):
    record = {
        "transaction_id": "TXN-NEG-01",
        "merchant_id": "MRCH001",
        "settlement_date": date.today().isoformat(),
        "gross_amount": "-500.00",
        "currency": "INR",
        "status": "settled",
    }
    result, _ = rules_engine.validate_record(record)
    assert result.status == "fail"
    assert result.reason_code == QuarantineReasonCode.IMPOSSIBLE_VALUE


def test_net_exceeds_gross(rules_engine):
    record = {
        "transaction_id": "TXN-IMPOSSIBLE-01",
        "merchant_id": "MRCH001",
        "settlement_date": date.today().isoformat(),
        "gross_amount": "100.00",
        "fee": "0.00",
        "tax": "0.00",
        "net_amount": "500.00",
        "currency": "INR",
        "status": "settled",
    }
    result, _ = rules_engine.validate_record(record)
    assert result.status == "fail"
    assert result.reason_code == QuarantineReasonCode.IMPOSSIBLE_VALUE


def test_invalid_currency(rules_engine):
    record = {
        "transaction_id": "TXN-CURR-01",
        "merchant_id": "MRCH001",
        "settlement_date": date.today().isoformat(),
        "gross_amount": "100.00",
        "fee": "0.00",
        "tax": "0.00",
        "net_amount": "100.00",
        "currency": "BITCOIN",
        "status": "settled",
    }
    result, _ = rules_engine.validate_record(record)
    assert result.status == "fail"
    assert result.reason_code == QuarantineReasonCode.INVALID_CURRENCY


def test_far_future_date(rules_engine):
    future = date.today() + timedelta(days=90)
    record = {
        "transaction_id": "TXN-FUT-01",
        "merchant_id": "MRCH001",
        "settlement_date": future.isoformat(),
        "gross_amount": "100.00",
        "fee": "0.00",
        "tax": "0.00",
        "net_amount": "100.00",
        "currency": "INR",
        "status": "settled",
    }
    result, _ = rules_engine.validate_record(record)
    assert result.status == "fail"
    assert result.reason_code == QuarantineReasonCode.INVALID_DATE
