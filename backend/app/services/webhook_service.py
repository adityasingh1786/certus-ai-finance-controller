"""
Razorpay Webhook Service & HMAC-SHA256 Signature Verification.

NOTE: This service implements the official Razorpay webhook verification protocol.
In demo/evaluation environments, payloads are constructed and signed locally
by test harnesses (e.g. backend/scripts/demo_webhook.py) to prove cryptographic
compliance without requiring external public ingress.
"""

import hmac
import hashlib
import json
import logging
from typing import Dict, Any, Optional, Set

logger = logging.getLogger("certus.webhooks")


class WebhookService:
    """Handles cryptographic verification and event dispatching for Razorpay webhooks."""

    def __init__(self, default_secret: str = "rzp_webhook_secret_certus_2026"):
        self.default_secret = default_secret
        self._processed_events: Set[str] = set()
        self._event_log: list = []

    def verify_signature(
        self,
        raw_body: bytes,
        signature: str,
        secret: Optional[str] = None,
    ) -> bool:
        """
        Validates the X-Razorpay-Signature header against the raw request body.
        Algorithm: HMAC-SHA256(secret, raw_body) == signature
        """
        if not signature:
            return False

        active_secret = secret or self.default_secret
        computed_sig = hmac.new(
            active_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        # Constant-time comparison to prevent timing attacks
        return hmac.compare_digest(computed_sig, signature)

    def is_duplicate(self, event_id: str) -> bool:
        """Idempotency check: returns True if event_id has already been processed."""
        return event_id in self._processed_events

    def process_webhook_payload(
        self,
        payload: Dict[str, Any],
        raw_body: bytes,
        signature: str,
        secret: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Verifies signature, enforces idempotency, and dispatches the event.
        """
        # Step 1: Cryptographic verification
        if not self.verify_signature(raw_body, signature, secret):
            logger.warning("WebhookService: Invalid HMAC-SHA256 signature rejected.")
            return {
                "status": "UNAUTHORIZED",
                "detail": "Invalid X-Razorpay-Signature header",
                "processed": False,
            }

        event_type = payload.get("event", "unknown")
        event_id = payload.get("event_id") or payload.get("id") or f"evt_{hash(raw_body)}"

        # Step 2: Idempotency check
        if self.is_duplicate(event_id):
            logger.info(f"WebhookService: Duplicate event {event_id} ignored (idempotent pass).")
            return {
                "status": "DUPLICATE_IGNORED",
                "event_id": event_id,
                "event": event_type,
                "processed": False,
            }

        # Step 3: Event extraction & logging
        event_data = payload.get("payload", {}).get(event_type.split(".")[0], {}).get("entity", {})
        
        extracted_summary = {
            "event_id": event_id,
            "event_type": event_type,
            "entity_id": event_data.get("id"),
            "amount_paisa": event_data.get("amount", 0),
            "currency": event_data.get("currency", "INR"),
            "fee_paisa": event_data.get("fee", 0),
            "tax_paisa": event_data.get("tax", 0),
            "utr": event_data.get("acquirer_data", {}).get("utr") or event_data.get("utr"),
        }

        self._processed_events.add(event_id)
        self._event_log.append(extracted_summary)

        logger.info(
            f"WebhookService: Successfully verified & processed '{event_type}' (ID: {event_id})"
        )

        return {
            "status": "PROCESSED",
            "event_id": event_id,
            "event": event_type,
            "summary": extracted_summary,
            "processed": True,
        }

    def get_processed_events(self) -> list:
        """Returns the audit log of processed webhook events."""
        return list(self._event_log)

    def reset(self) -> None:
        """Resets the in-memory event registry."""
        self._processed_events.clear()
        self._event_log.clear()


# Global singleton instance
webhook_service = WebhookService()
