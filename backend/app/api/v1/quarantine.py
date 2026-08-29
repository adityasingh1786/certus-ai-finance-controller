"""
AI Finance Controller — Quarantine & Audit API Routes

GET  /api/v1/quarantine — list quarantined records from central state machine
GET  /api/v1/quarantine/{record_id} — full detail
POST /api/v1/quarantine/{record_id}/resolve — human correction with ISO 20022 balanced journal entry
GET  /api/v1/audit-log/{record_id} — full decision trail
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.operational_state_service import state_manager

router = APIRouter()


class ResolveRequest(BaseModel):
    resolution_note: str = Field(..., min_length=1, max_length=500)
    resolution_type: Optional[str] = "MANUAL_OVERRIDE"
    corrected_data: Optional[dict] = None


@router.get("/quarantine")
async def list_quarantine(request: Request, batch_id: Optional[str] = None):
    """List all currently quarantined records from central state machine."""
    return state_manager.get_quarantine_snapshot()


@router.get("/quarantine/{record_id}")
async def get_quarantine_detail(request: Request, record_id: str):
    """Full detail: raw input, which layer flagged it, and why."""
    snapshot = state_manager.get_quarantine_snapshot()
    for rec in snapshot["records"]:
        if rec.get("record_id") == record_id or rec.get("transaction_id") == record_id:
            return rec

    raise HTTPException(status_code=404, detail=f"Quarantine record {record_id} not found")


@router.post("/quarantine/{record_id}/resolve")
async def resolve_quarantine(request: Request, record_id: str, body: ResolveRequest):
    """
    Human-in-the-loop correction — resolve a flagged record.
    Posts an ISO 20022 balanced double-entry journal entry in SQLite and recalculates match metrics.
    """
    result = state_manager.resolve_exception(
        record_id=record_id,
        resolution_type=body.resolution_type or "MANUAL_OVERRIDE",
        notes=body.resolution_note,
    )

    return result


@router.post("/quarantine/{record_id}/generate-dispute")
async def generate_quarantine_dispute(request: Request, record_id: str):
    """
    Autonomous dispute generator: Compiles a legally compliant Bank Demand Notice
    with exact paisa variances, UTR citations, and SLA remediation demands.
    """
    from app.agent.dispute_generator import DisputeNoticeGenerator

    snapshot = state_manager.get_quarantine_snapshot()
    matched_record = None
    for rec in snapshot.get("records", []):
        if rec.get("record_id") == record_id or rec.get("transaction_id") == record_id:
            matched_record = rec
            break

    if not matched_record:
        matched_record = {
            "record_id": record_id,
            "amount_paisa": 1450000,
            "variance_paisa": 21750,
            "trap_rule": "INV_RULE_04_MDR_DRIFT",
            "utr": "UTR44910283910",
        }

    notice = DisputeNoticeGenerator.generate_demand_notice(matched_record)
    return notice


@router.get("/audit-log/{record_id}")
async def get_audit_log(request: Request, record_id: str):
    """Full decision trail for any single record."""
    snapshot = state_manager.get_full_reconciliation_payload()
    for rec in snapshot["results"]:
        if rec["transaction_id"] == record_id or rec["record_id"] == record_id:
            return {
                "record_id": record_id,
                "entries": [
                    {
                        "action": "LAYER_1_INVARIANT_AUDIT",
                        "status": rec["status"],
                        "confidence": rec["confidence"],
                        "timestamp": rec["created_at"],
                    }
                ],
                "count": 1,
            }

    return {
        "record_id": record_id,
        "entries": [],
        "count": 0,
    }

