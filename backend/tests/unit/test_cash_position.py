"""
AI Finance Controller — Unit Tests for Cash Position & Forecasting
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta
from app.services.cash_position_service import CashPositionService
from app.services.ingestion_service import IngestionService


class MockIngestionService:
    def __init__(self, records):
        self._records = records

    def get_all_records(self):
        return self._records


def test_cash_position_aggregation():
    records = [
        {"transaction_id": "T1", "currency": "INR", "net_amount": "1000.00", "status": "settled", "settlement_date": date.today().isoformat()},
        {"transaction_id": "T2", "currency": "INR", "net_amount": "500.00", "status": "settled", "settlement_date": date.today().isoformat()},
        {"transaction_id": "T3", "currency": "INR", "net_amount": "200.00", "status": "pending", "settlement_date": (date.today() + timedelta(days=1)).isoformat()},
        {"transaction_id": "T4", "currency": "USD", "net_amount": "100.00", "status": "settled", "settlement_date": date.today().isoformat()},
    ]
    service = CashPositionService(ingestion_service=MockIngestionService(records))
    pos = service.get_current_position()

    assert Decimal(pos["total_balance"]) == Decimal("1600.00")  # 1000 + 500 + 100
    assert Decimal(pos["total_pending"]) == Decimal("200.00")
    assert pos["pending_settlements_count"] == 1


def test_forecast_calculation():
    records = [
        {"transaction_id": f"T_{i}", "currency": "INR", "net_amount": "1000.00", "status": "settled", "settlement_date": (date.today() - timedelta(days=i)).isoformat()}
        for i in range(10)
    ]
    records.append({
        "transaction_id": "T_PENDING",
        "currency": "INR",
        "net_amount": "5000.00",
        "status": "pending",
        "settlement_date": (date.today() + timedelta(days=3)).isoformat(),
    })

    service = CashPositionService(ingestion_service=MockIngestionService(records))
    forecast = service.get_forecast()

    assert "projected_balance" in forecast
    assert Decimal(forecast["pending_settlements"]) == Decimal("5000.00")
    assert forecast["method"] == "weighted_moving_average"
    assert "confidence_band_low" in forecast
    assert "confidence_band_high" in forecast
