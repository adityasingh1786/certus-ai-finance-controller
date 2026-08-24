"""
Tool: get_pending_settlements
Read-only tool that queries pending/unsettled settlement records with optional currency and amount filters.
"""

from typing import Any, Dict, List, Optional
from decimal import Decimal

def get_pending_settlements_tool(
    ingestion_service,
    currency: Optional[str] = None,
    min_amount: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Returns pending settlement records, total pending amount, and transaction IDs.
    """
    if not ingestion_service:
        return {"total_pending": "0.00", "count": 0, "records": []}

    records = ingestion_service.get_all_records()
    pending = [r for r in records if r.get("status") == "pending"]

    if currency:
        pending = [r for r in pending if r.get("currency", "INR").upper() == currency.upper()]

    if min_amount is not None:
        pending = [r for r in pending if float(r.get("net_amount", 0)) >= min_amount]

    total_pending = sum(Decimal(str(r.get("net_amount", "0"))) for r in pending)

    return {
        "total_pending": str(total_pending),
        "count": len(pending),
        "cited_record_ids": [r.get("transaction_id") for r in pending if r.get("transaction_id")],
        "sample_records": pending[:10],
    }
