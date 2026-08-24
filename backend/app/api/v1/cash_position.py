"""
AI Finance Controller — Cash Position API Routes

GET /api/v1/cash-position — current aggregated position
GET /api/v1/cash-position/history — historical trend for charting
GET /api/v1/cash-position/forecast — projected position
"""

from fastapi import APIRouter, Request, Query
from typing import Optional

router = APIRouter()


@router.get("")
async def get_cash_position(request: Request):
    """Current aggregated cash position across accounts/currencies."""
    service = request.app.state.cash_position_service
    return service.get_current_position()


@router.get("/history")
async def get_cash_position_history(
    request: Request,
    range: str = Query("30d", description="Time range, e.g. '30d', '7d', '90d'"),
):
    """Historical trend for charting."""
    service = request.app.state.cash_position_service

    # Parse range string
    try:
        days = int(range.replace("d", "").strip())
        days = max(1, min(days, 365))
    except ValueError:
        days = 30

    return {"range_days": days, "history": service.get_history(range_days=days)}


@router.get("/forecast")
async def get_cash_position_forecast(
    request: Request,
    date: Optional[str] = Query(None, description="Target date in YYYY-MM-DD format"),
):
    """Projected position factoring in pending/unsettled amounts."""
    service = request.app.state.cash_position_service
    return service.get_forecast(forecast_date=date)
