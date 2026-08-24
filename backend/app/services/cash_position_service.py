"""
AI Finance Controller — Cash Position Service

Aggregates current position, historical trends, and forward-looking forecasts.
Uses a weighted moving average for forecasting — auditable, not a black box.
"""

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class CashPositionService:
    """
    Computes cash positions from trusted settlement records.
    All data comes from the trusted DB only — never from quarantined records.
    """

    def __init__(self, ingestion_service=None):
        self.ingestion_service = ingestion_service

    def get_current_position(self) -> dict:
        """Current aggregated cash position across accounts/currencies."""
        records = self.ingestion_service.get_all_records() if self.ingestion_service else []

        # Aggregate by currency
        position_by_currency = {}
        total_balance = Decimal("0")
        pending_count = 0

        for record in records:
            currency = record.get("currency", "INR")
            net_amount = Decimal(str(record.get("net_amount", "0")))
            status = record.get("status", "pending")

            if currency not in position_by_currency:
                position_by_currency[currency] = {
                    "currency": currency,
                    "settled_amount": Decimal("0"),
                    "pending_amount": Decimal("0"),
                    "total_records": 0,
                }

            position_by_currency[currency]["total_records"] += 1

            if status == "settled":
                position_by_currency[currency]["settled_amount"] += net_amount
                total_balance += net_amount
            elif status == "pending":
                position_by_currency[currency]["pending_amount"] += net_amount
                pending_count += 1

        # Convert Decimals to strings for JSON serialization
        accounts = []
        total_pending = Decimal("0")
        for currency, data in position_by_currency.items():
            total_pending += data["pending_amount"]
            accounts.append({
                "currency": currency,
                "settled_amount": str(data["settled_amount"]),
                "pending_amount": str(data["pending_amount"]),
                "total_balance": str(data["settled_amount"] + data["pending_amount"]),
                "total_records": data["total_records"],
            })

        return {
            "total_balance": str(total_balance),
            "total_pending": str(total_pending),
            "currency": "INR",
            "accounts": accounts,
            "pending_settlements_count": pending_count,
            "total_records": len(records),
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    def get_history(self, range_days: int = 30) -> list[dict]:
        """Historical cash position trend for charting."""
        records = self.ingestion_service.get_all_records() if self.ingestion_service else []

        # Group by settlement date
        daily = {}
        today = date.today()
        start_date = today - timedelta(days=range_days)

        for record in records:
            date_str = record.get("settlement_date", "")
            try:
                if isinstance(date_str, date):
                    d = date_str
                elif isinstance(date_str, str) and date_str:
                    d = datetime.strptime(date_str.strip()[:10], "%Y-%m-%d").date()
                else:
                    continue

                if d < start_date or d > today:
                    continue

                date_key = d.isoformat()
                if date_key not in daily:
                    daily[date_key] = {"inflows": Decimal("0"), "outflows": Decimal("0")}

                net = Decimal(str(record.get("net_amount", "0")))
                status = record.get("status", "")

                if status in ("refunded", "partially_refunded"):
                    daily[date_key]["outflows"] += abs(net)
                else:
                    daily[date_key]["inflows"] += net

            except (ValueError, TypeError):
                continue

        # Build cumulative balance series
        history = []
        running_balance = Decimal("0")

        for day_offset in range(range_days + 1):
            d = start_date + timedelta(days=day_offset)
            date_key = d.isoformat()
            day_data = daily.get(date_key, {"inflows": Decimal("0"), "outflows": Decimal("0")})

            net_change = day_data["inflows"] - day_data["outflows"]
            running_balance += net_change

            history.append({
                "date": date_key,
                "balance": str(running_balance),
                "inflows": str(day_data["inflows"]),
                "outflows": str(day_data["outflows"]),
                "net_change": str(net_change),
            })

        return history

    def get_forecast(self, forecast_date: Optional[str] = None) -> dict:
        """
        Projected cash position using weighted moving average.
        Pairs a simple, auditable method with honest confidence bands.
        """
        history = self.get_history(range_days=30)
        records = self.ingestion_service.get_all_records() if self.ingestion_service else []

        if forecast_date:
            try:
                target_date = datetime.strptime(forecast_date, "%Y-%m-%d").date()
            except ValueError:
                target_date = date.today() + timedelta(days=7)
        else:
            target_date = date.today() + timedelta(days=7)

        # Calculate weighted moving average of daily net changes
        recent_changes = []
        for h in history[-14:]:  # Last 14 days
            try:
                nc = Decimal(h.get("net_change", "0"))
                recent_changes.append(nc)
            except Exception:
                recent_changes.append(Decimal("0"))

        if not recent_changes:
            avg_daily_change = Decimal("0")
        else:
            # Weighted: more recent days get higher weight
            weights = list(range(1, len(recent_changes) + 1))
            weighted_sum = sum(c * w for c, w in zip(recent_changes, weights))
            avg_daily_change = weighted_sum / sum(weights)

        # Current balance
        current_balance = Decimal(history[-1]["balance"]) if history else Decimal("0")

        # Pending settlements
        pending = Decimal("0")
        pending_ids = []
        for record in records:
            if record.get("status") == "pending":
                pending += Decimal(str(record.get("net_amount", "0")))
                pending_ids.append(record.get("transaction_id", ""))

        # Days to forecast
        days_ahead = (target_date - date.today()).days
        days_ahead = max(1, min(days_ahead, 90))

        # Projected balance
        projected = current_balance + (avg_daily_change * days_ahead) + pending

        # Confidence bands (wider for further out)
        daily_std = Decimal("0")
        if len(recent_changes) > 1:
            mean = sum(recent_changes) / len(recent_changes)
            variance = sum((x - mean) ** 2 for x in recent_changes) / len(recent_changes)
            daily_std = variance.sqrt() if hasattr(variance, 'sqrt') else Decimal(str(float(variance) ** 0.5))

        band_width = daily_std * Decimal(str(days_ahead ** 0.5)) * Decimal("1.96")
        confidence_low = projected - band_width
        confidence_high = projected + band_width

        return {
            "forecast_date": target_date.isoformat(),
            "projected_balance": str(projected.quantize(Decimal("0.01"))),
            "confidence_band_low": str(confidence_low.quantize(Decimal("0.01"))),
            "confidence_band_high": str(confidence_high.quantize(Decimal("0.01"))),
            "pending_settlements": str(pending.quantize(Decimal("0.01"))),
            "pending_count": len(pending_ids),
            "method": "weighted_moving_average",
            "days_ahead": days_ahead,
            "avg_daily_change": str(avg_daily_change.quantize(Decimal("0.01"))),
            "cited_record_ids": pending_ids[:10],  # Cite up to 10 pending records
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
