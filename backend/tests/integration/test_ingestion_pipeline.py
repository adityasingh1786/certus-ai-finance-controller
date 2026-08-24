"""
AI Finance Controller — Integration Tests for File Ingestion Pipeline
"""

import pytest
import os
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_full_batch_csv_ingestion():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/synthetic/full_batch.csv"))
        assert os.path.exists(data_path), "Synthetic test dataset missing"

        with open(data_path, "rb") as f:
            content = f.read()

        response = await ac.post(
            "/api/v1/settlements/ingest",
            files={"file": ("full_batch.csv", content, "text/csv")},
        )
        assert response.status_code == 200
        data = response.json()
        assert "batch_id" in data
        batch_id = data["batch_id"]

        # Check summary
        summary_resp = await ac.get(f"/api/v1/settlements/{batch_id}/summary")
        assert summary_resp.status_code == 200
        summary = summary_resp.json()
        assert summary["total"] >= 50
        assert summary["quarantined"] > 0
        assert summary["passed"] > 0


@pytest.mark.asyncio
async def test_demo_load_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/settlements/demo-load")
        assert response.status_code == 200
        data = response.json()
        assert data["batch_id"] is not None
        assert data["summary"]["total"] >= 50
