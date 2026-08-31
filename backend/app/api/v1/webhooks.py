"""
Razorpay Webhook Ingestion API Endpoint.
Exposes POST /api/v1/webhooks/razorpay with HMAC-SHA256 signature verification.
"""

import json
import logging
from typing import Optional
from fastapi import APIRouter, Request, Header, HTTPException, status
from fastapi.responses import JSONResponse
from app.services.webhook_service import webhook_service

logger = logging.getLogger("certus.webhooks_api")
router = APIRouter(prefix="/webhooks", tags=["Webhooks & Protocol Ingestion"])


@router.post(
    "/razorpay",
    summary="Razorpay Webhook Ingestion",
    description=(
        "Receives and verifies Razorpay webhook events using HMAC-SHA256 signature verification. "
        "Requires X-Razorpay-Signature header matching HMAC(webhook_secret, raw_body)."
    ),
)
async def receive_razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature"),
):
    """
    Ingests and cryptographically verifies Razorpay webhook events.
    Returns:
        - 200 OK: Valid signature, event processed or recognized duplicate.
        - 401 Unauthorized: Invalid HMAC-SHA256 signature.
        - 400 Bad Request: Missing signature header or malformed JSON body.
    """
    if not x_razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required 'X-Razorpay-Signature' header",
        )

    # Read raw body bytes for cryptographic HMAC verification
    raw_body = await request.body()

    try:
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed JSON payload: {str(e)}",
        )

    # Process through webhook verification service
    result = webhook_service.process_webhook_payload(
        payload=payload,
        raw_body=raw_body,
        signature=x_razorpay_signature,
    )

    if result["status"] == "UNAUTHORIZED":
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Invalid webhook signature", "detail": result.get("detail")},
        )

    return {
        "status": result["status"],
        "event": result.get("event"),
        "event_id": result.get("event_id"),
        "processed": result.get("processed"),
        "summary": result.get("summary"),
    }


@router.get(
    "/events",
    summary="List Processed Webhook Events",
    description="Returns the in-memory audit log of all verified webhook events.",
)
async def list_webhook_events():
    """Returns the list of processed webhook events for audit inspection."""
    events = webhook_service.get_processed_events()
    return {
        "total_events": len(events),
        "events": events,
    }
