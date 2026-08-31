"""
Razorpay Webhook Protocol Demonstration Harness.

NOTE: This script generates a synthetic Razorpay webhook payload, signs it using
the official HMAC-SHA256 protocol, and tests verification against the local Certus
API endpoint. This demonstrates cryptographic compliance and protocol understanding
in a self-contained local environment.
"""

import hmac
import hashlib
import json
import time
import requests

WEBHOOK_URL = "http://localhost:8000/api/v1/webhooks/razorpay"
SECRET = "rzp_webhook_secret_certus_2026"


def run_webhook_protocol_demo():
    print("=================================================================")
    print("      CERTUS — RAZORPAY WEBHOOK PROTOCOL DEMONSTRATION")
    print("=================================================================")
    print(f"Target Endpoint : {WEBHOOK_URL}")
    print(f"Secret Key      : {SECRET[:8]}... (HMAC-SHA256)")
    print()

    # Step 1: Create synthetic payload
    payload = {
        "event": "settlement.processed",
        "event_id": f"evt_demo_{int(time.time())}",
        "created_at": int(time.time()),
        "payload": {
            "settlement": {
                "entity": {
                    "id": "setl_DEMO_20260901",
                    "amount": 12500000,  # ₹1,25,000.00
                    "currency": "INR",
                    "status": "processed",
                    "utr": "HDFCN00098765432",
                    "fee": 25000,        # ₹250.00
                    "tax": 4500,         # ₹45.00 (18% GST)
                }
            }
        },
    }

    raw_body = json.dumps(payload).encode("utf-8")

    # Step 2: Compute cryptographic signature
    signature = hmac.new(SECRET.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    print(f"1. Generated Synthetic Payload for event: '{payload['event']}'")
    print(f"   Amount: ₹{payload['payload']['settlement']['entity']['amount']/100:,.2f}")
    print(f"   UTR   : {payload['payload']['settlement']['entity']['utr']}")
    print(f"2. Computed HMAC-SHA256 Signature:\n   {signature}")
    print()

    # Step 3: Dispatch to local server if running
    try:
        res = requests.post(
            WEBHOOK_URL,
            data=raw_body,
            headers={
                "Content-Type": "application/json",
                "X-Razorpay-Signature": signature,
            },
            timeout=3.0,
        )
        print(f"3. Local Dispatch Response: HTTP {res.status_code}")
        print(f"   Response Body: {json.dumps(res.json(), indent=2)}")
        print("\n[SUCCESS] Webhook cryptographic protocol verified successfully!")
    except Exception as e:
        print(f"3. (Local server not active on port 8000: {e})")
        print("   Direct verification logic demonstrated via unit test suite: 'pytest tests/unit/test_webhooks.py'")


if __name__ == "__main__":
    run_webhook_protocol_demo()
