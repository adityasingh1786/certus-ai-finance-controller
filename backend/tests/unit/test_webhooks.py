"""
Unit tests for Razorpay webhook HMAC-SHA256 verification and event handling.
"""

import hmac
import hashlib
import json
import pytest
from fastapi.testclient import TestClient
from app.main import create_app
from app.services.webhook_service import webhook_service

SECRET = "rzp_webhook_secret_certus_2026"


@pytest.fixture
def client():
    webhook_service.reset()
    app = create_app()
    return TestClient(app)


def compute_signature(payload_dict: dict, secret: str = SECRET) -> tuple[bytes, str]:
    raw_body = json.dumps(payload_dict).encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return raw_body, sig


class TestRazorpayWebhooks:
    """Test suite verifying cryptographic HMAC-SHA256 webhook validation and idempotency."""

    def test_valid_signature_payment_captured(self, client):
        payload = {
            "event": "payment.captured",
            "event_id": "evt_pay_test_001",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_TEST12345",
                        "amount": 250000,
                        "currency": "INR",
                        "fee": 5900,
                        "tax": 900,
                    }
                }
            },
        }
        raw_body, sig = compute_signature(payload)

        res = client.post(
            "/api/v1/webhooks/razorpay",
            content=raw_body,
            headers={
                "Content-Type": "application/json",
                "X-Razorpay-Signature": sig,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "PROCESSED"
        assert data["event"] == "payment.captured"
        assert data["event_id"] == "evt_pay_test_001"
        assert data["summary"]["amount_paisa"] == 250000

    def test_invalid_signature_returns_401(self, client):
        payload = {"event": "payment.captured", "event_id": "evt_tampered_002"}
        raw_body, _ = compute_signature(payload)

        res = client.post(
            "/api/v1/webhooks/razorpay",
            content=raw_body,
            headers={
                "Content-Type": "application/json",
                "X-Razorpay-Signature": "invalid_forged_signature_hex",
            },
        )
        assert res.status_code == 401
        assert "Invalid webhook signature" in res.json()["error"]

    def test_missing_signature_header_returns_400(self, client):
        payload = {"event": "payment.captured"}
        raw_body, _ = compute_signature(payload)

        res = client.post(
            "/api/v1/webhooks/razorpay",
            content=raw_body,
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 400
        assert "Missing required 'X-Razorpay-Signature' header" in res.json()["detail"]

    def test_idempotent_duplicate_delivery(self, client):
        payload = {
            "event": "settlement.processed",
            "event_id": "evt_settle_dup_003",
            "payload": {
                "settlement": {
                    "entity": {
                        "id": "setl_TEST999",
                        "amount": 1000000,
                        "utr": "HDFCN00012345678",
                    }
                }
            },
        }
        raw_body, sig = compute_signature(payload)
        headers = {"Content-Type": "application/json", "X-Razorpay-Signature": sig}

        # First delivery -> PROCESSED
        res1 = client.post("/api/v1/webhooks/razorpay", content=raw_body, headers=headers)
        assert res1.status_code == 200
        assert res1.json()["status"] == "PROCESSED"

        # Second identical delivery -> DUPLICATE_IGNORED (200 OK)
        res2 = client.post("/api/v1/webhooks/razorpay", content=raw_body, headers=headers)
        assert res2.status_code == 200
        assert res2.json()["status"] == "DUPLICATE_IGNORED"

    def test_settlement_processed_payload_extraction(self, client):
        payload = {
            "event": "settlement.processed",
            "event_id": "evt_setl_utr_004",
            "payload": {
                "settlement": {
                    "entity": {
                        "id": "setl_EXP_456",
                        "amount": 5400000,
                        "utr": "ICICIR5202409180",
                        "fee": 10800,
                        "tax": 1944,
                    }
                }
            },
        }
        raw_body, sig = compute_signature(payload)

        res = client.post(
            "/api/v1/webhooks/razorpay",
            content=raw_body,
            headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["summary"]["utr"] == "ICICIR5202409180"
        assert data["summary"]["amount_paisa"] == 5400000

    def test_webhook_events_audit_log_endpoint(self, client):
        # Dispatch 1 event
        payload = {"event": "refund.processed", "event_id": "evt_rfnd_005", "payload": {}}
        raw_body, sig = compute_signature(payload)
        client.post(
            "/api/v1/webhooks/razorpay",
            content=raw_body,
            headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig},
        )

        res = client.get("/api/v1/webhooks/events")
        assert res.status_code == 200
        events_data = res.json()
        assert events_data["total_events"] >= 1
        assert any(e["event_id"] == "evt_rfnd_005" for e in events_data["events"])
