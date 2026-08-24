"""
Tool: get_cash_position
Read-only tool that retrieves the current audited cash position and per-currency totals.
"""

from typing import Any, Dict

def get_cash_position_tool(cash_service) -> Dict[str, Any]:
    """
    Executes the read-only cash position query.
    Returns real-time aggregated figures.
    """
    if not cash_service:
        return {"total_balance": "0.00", "currency": "INR", "accounts": []}
    return cash_service.get_current_position()
