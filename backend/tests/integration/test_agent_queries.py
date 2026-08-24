"""
AI Finance Controller — Integration Tests for Agent Natural Language Queries
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_agent_query_mandatory_citations():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Load demo data first
        await ac.post("/api/v1/settlements/demo-load")

        # 2. Ask cash position question
        response = await ac.post(
            "/api/v1/agent/query",
            json={"question": "What is our current cash position balance and pending settlements?"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "confidence" in data
        assert "cited_record_ids" in data
        assert len(data["cited_record_ids"]) > 0, "Agent response MUST cite verified source record IDs"
        assert len(data["tool_calls"]) > 0


@pytest.mark.asyncio
async def test_agent_tools_introspection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/agent/tools")
        assert response.status_code == 200
        data = response.json()
        assert "tools" in data
        for tool in data["tools"]:
            assert tool["is_read_only"] is True
