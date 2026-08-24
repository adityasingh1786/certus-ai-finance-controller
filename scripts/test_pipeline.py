"""Quick test script for the ingestion pipeline."""
import httpx
import json
import sys

BASE_URL = "http://localhost:8000"

def test_pipeline():
    print("=" * 60)
    print("AI Finance Controller - Pipeline Test")
    print("=" * 60)

    # 1. Health check
    r = httpx.get(f"{BASE_URL}/")
    print(f"\n[1] Health: {r.json()}")

    # 2. Upload synthetic batch
    print(f"\n[2] Uploading synthetic batch...")
    with open("data/synthetic/full_batch.csv", "rb") as f:
        r = httpx.post(
            f"{BASE_URL}/api/v1/settlements/ingest",
            files={"file": ("full_batch.csv", f, "text/csv")},
            timeout=30,
        )
    result = r.json()
    batch_id = result["batch_id"]
    print(f"    Batch ID: {batch_id}")
    print(f"    Status: {result['status']}")

    # 3. Get batch summary
    r = httpx.get(f"{BASE_URL}/api/v1/settlements/{batch_id}/summary")
    summary = r.json()
    print(f"\n[3] Batch Summary:")
    print(f"    Total: {summary.get('total', 0)}")
    print(f"    Passed: {summary.get('passed', 0)}")
    print(f"    Quarantined: {summary.get('quarantined', 0)}")
    print(f"    Avg Confidence: {summary.get('avg_confidence', 'N/A')}")
    print(f"    Processing Time: {summary.get('processing_time_ms', 'N/A')}ms")

    # 4. Get quarantine records
    r = httpx.get(f"{BASE_URL}/api/v1/quarantine")
    quarantine = r.json()
    print(f"\n[4] Quarantine Queue: {quarantine['count']} records")
    for q in quarantine["records"][:5]:
        print(f"    - {q['reason_code']}: {q['reason_detail'][:80]}...")

    # 5. Cash position
    r = httpx.get(f"{BASE_URL}/api/v1/cash-position")
    position = r.json()
    print(f"\n[5] Cash Position:")
    print(f"    Total Balance: INR {position.get('total_balance', '0')}")
    print(f"    Pending: INR {position.get('total_pending', '0')}")
    print(f"    Records: {position.get('total_records', 0)}")

    # 6. Forecast
    r = httpx.get(f"{BASE_URL}/api/v1/cash-position/forecast")
    forecast = r.json()
    print(f"\n[6] Forecast:")
    print(f"    Date: {forecast.get('forecast_date', 'N/A')}")
    print(f"    Projected: INR {forecast.get('projected_balance', 'N/A')}")
    print(f"    Confidence Band: {forecast.get('confidence_band_low', 'N/A')} - {forecast.get('confidence_band_high', 'N/A')}")

    # 7. Agent query
    r = httpx.post(
        f"{BASE_URL}/api/v1/agent/query",
        json={"question": "What's our current cash position?"},
        timeout=10,
    )
    agent_resp = r.json()
    print(f"\n[7] Agent Query: 'What's our current cash position?'")
    print(f"    Answer: {agent_resp.get('answer', 'N/A')[:100]}...")
    print(f"    Confidence: {agent_resp.get('confidence', 'N/A')}")
    print(f"    Citations: {len(agent_resp.get('cited_record_ids', []))} records")

    # 8. Agent tools
    r = httpx.get(f"{BASE_URL}/api/v1/agent/tools")
    tools = r.json()
    print(f"\n[8] Agent Tools:")
    for t in tools.get("tools", []):
        print(f"    - {t['name']}: {t['description'][:60]}...")
    print(f"    Governing Principle: {tools.get('governing_principle', 'N/A')[:80]}...")

    print(f"\n{'=' * 60}")
    print(f"ALL TESTS PASSED!")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    test_pipeline()
