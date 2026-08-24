"""
AI Finance Controller — Quarantine & Audit API Routes

GET  /api/v1/quarantine — list quarantined records
GET  /api/v1/quarantine/{record_id} — full detail
POST /api/v1/quarantine/{record_id}/resolve — human correction
GET  /api/v1/audit-log/{record_id} — full decision trail
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()


class ResolveRequest(BaseModel):
    resolution_note: str = Field(..., min_length=1, max_length=500)
    corrected_data: Optional[dict] = None


@router.get("/quarantine")
async def list_quarantine(request: Request, batch_id: Optional[str] = None):
    """List all currently quarantined records with reason_code."""
    ingestion_service = request.app.state.ingestion_service
    records = ingestion_service.get_quarantine_records(batch_id=batch_id)

    return {
        "count": len(records),
        "records": records,
    }


@router.get("/quarantine/{record_id}")
async def get_quarantine_detail(request: Request, record_id: str):
    """Full detail: raw input, which layer flagged it, and why."""
    ingestion_service = request.app.state.ingestion_service
    record = ingestion_service.get_quarantine_record(record_id)

    if not record:
        raise HTTPException(status_code=404, detail=f"Quarantine record {record_id} not found")

    return record


@router.post("/quarantine/{record_id}/resolve")
async def resolve_quarantine(request: Request, record_id: str, body: ResolveRequest):
    """
    Human-in-the-loop correction — resolve a flagged record.
    This is the moment in the demo that turns 'the AI got something wrong'
    from a liability into a controlled, transparent action.
    """
    ingestion_service = request.app.state.ingestion_service
    result = ingestion_service.resolve_quarantine_record(
        record_id=record_id,
        resolution_note=body.resolution_note,
        corrected_data=body.corrected_data,
    )

    if not result:
        raise HTTPException(status_code=404, detail=f"Quarantine record {record_id} not found")

    return {"message": "Record resolved successfully", "record": result}


@router.get("/audit-log/{record_id}")
async def get_audit_log(request: Request, record_id: str):
    """Full decision trail for any single record."""
    ingestion_service = request.app.state.ingestion_service
    entries = ingestion_service.get_audit_log(record_id=record_id)

    if not entries:
        raise HTTPException(status_code=404, detail=f"No audit log entries for record {record_id}")

    return {
        "record_id": record_id,
        "entries": entries,
        "count": len(entries),
    }
