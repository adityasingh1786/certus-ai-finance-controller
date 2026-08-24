"""
AI Finance Controller — Agent Query API Routes

POST /api/v1/agent/query — natural-language query with mandatory citations & live scenario context
GET  /api/v1/agent/tools — list available tools (read-only introspection)
GET  /api/v1/agent/conversations/{id} — full audit transcript
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from uuid import uuid4
from datetime import datetime, timezone

router = APIRouter()
conversations: Dict[str, List[Dict[str, Any]]] = {}


class QueryRequest(BaseModel):
    question: Optional[str] = None
    query: Optional[str] = None
    conversation_id: Optional[str] = None
    chat_history: Optional[List[Dict[str, Any]]] = None
    context: Optional[Dict[str, Any]] = None  # Live screen state (active scenario, records, exceptions)


@router.post("/query")
async def agent_query(request: Request, body: QueryRequest):
    """
    Natural-language entry point for Autonomous Financial Controller Copilot.
    Receives live scenario context and returns expert forensic diagnosis,
    step-by-step fix recommendations, cited record IDs, and tool execution traces.
    """
    user_query = body.question or body.query or ""
    if not user_query.strip():
        raise HTTPException(status_code=400, detail="Query or question text is required.")

    agent_orchestrator = getattr(request.app.state, "agent_orchestrator", None)
    if not agent_orchestrator:
        from app.agent.orchestrator import AgentOrchestrator
        agent_orchestrator = AgentOrchestrator(
            ingestion_service=getattr(request.app.state, "ingestion_service", None),
            cash_service=getattr(request.app.state, "cash_service", None),
        )
        request.app.state.agent_orchestrator = agent_orchestrator

    conversation_id = body.conversation_id or str(uuid4())

    if conversation_id not in conversations:
        conversations[conversation_id] = []

    conversations[conversation_id].append({
        "role": "user",
        "content": user_query,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Call orchestrator with live context
    response = await agent_orchestrator.answer_query(
        question=user_query,
        conversation_id=conversation_id,
        client_context=body.context,
    )

    conversations[conversation_id].append({
        "role": "assistant",
        "content": response.get("answer", ""),
        "confidence": response.get("confidence"),
        "cited_record_ids": response.get("cited_record_ids", []),
        "tool_calls": response.get("tool_calls", []),
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
            {
                "name": "audit_exceptions_and_remediations",
                "description": "Analyzes quarantined exceptions and produces deterministic forensic remediation steps.",
                "parameters": {
                    "scenario_id": {"type": "integer", "description": "Active scenario identifier", "required": False},
                },
                "is_read_only": True,
            },
        ],
        "governing_principle": "Every tool is READ-ONLY with respect to financial state. The agent can query, reconcile, analyze and suggest fixes — no tool can execute a transfer or alter a ledger.",
    }


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
    return {"conversation_id": conversation_id, "messages": conversations[conversation_id]}
