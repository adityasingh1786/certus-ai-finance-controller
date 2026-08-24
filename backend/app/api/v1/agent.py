"""
AI Finance Controller — Agent Query API Routes

POST /api/v1/agent/query — natural-language query with mandatory citations
GET  /api/v1/agent/tools — list available tools (read-only introspection)
GET  /api/v1/agent/conversations/{id} — full audit transcript
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4
from datetime import datetime, timezone

router = APIRouter()
conversations: dict[str, list[dict]] = {}


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    conversation_id: Optional[str] = None


@router.post("/query")
async def agent_query(request: Request, body: QueryRequest):
    """
    Natural-language entry point.
    Returns answer + cited record IDs + confidence + tool calls trace.
    """
    agent_orchestrator = request.app.state.agent_orchestrator
    conversation_id = body.conversation_id or str(uuid4())

    if conversation_id not in conversations:
        conversations[conversation_id] = []

    conversations[conversation_id].append({
        "role": "user",
        "content": body.question,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Call orchestrator
    response = await agent_orchestrator.answer_query(
        question=body.question,
        conversation_id=conversation_id,
    )

    conversations[conversation_id].append({
        "role": "assistant",
        "content": response["answer"],
        "confidence": response["confidence"],
        "cited_record_ids": response["cited_record_ids"],
        "tool_calls": response["tool_calls"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return response


@router.get("/tools")
async def list_agent_tools():
    """
    Introspection endpoint listing every tool schema the agent can call.
    All tools are READ-ONLY by design.
    """
    return {
        "tools": [
            {
                "name": "get_cash_position",
                "description": "Get current aggregated cash position across all accounts and currencies. Returns total balance, pending settlements, and per-currency breakdown.",
                "parameters": {},
                "is_read_only": True,
            },
            {
                "name": "get_pending_settlements",
                "description": "Get all pending (unsettled) settlement records. Returns count, total amount, and individual record details.",
                "parameters": {
                    "currency": {"type": "string", "description": "Filter by currency (optional)", "required": False},
                    "min_amount": {"type": "number", "description": "Minimum amount filter (optional)", "required": False},
                },
                "is_read_only": True,
            },
            {
                "name": "search_transaction_history",
                "description": "Search transaction history using natural language. Performs semantic search over transaction narrations and metadata.",
                "parameters": {
                    "query": {"type": "string", "description": "Natural language search query", "required": True},
                    "limit": {"type": "integer", "description": "Max results to return", "required": False, "default": 10},
                },
                "is_read_only": True,
            },
        ],
        "governing_principle": "Every tool is READ-ONLY with respect to financial state. The agent can query, reconcile, and forecast — no tool can execute a transfer, post a journal entry, or alter a trusted record.",
    }


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")

    return {
        "conversation_id": conversation_id,
        "messages": conversations[conversation_id],
        "message_count": len(conversations[conversation_id]),
    }
