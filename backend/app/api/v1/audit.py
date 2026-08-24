from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ...db.session import get_db
from ...models.orm import AuditLogModel

router = APIRouter()


@router.get("", response_model=Dict[str, Any])
def list_audit_logs(
    record_id: Optional[str] = Query(None, description="Filter by record or transaction ID"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    List immutable audit log records demonstrating full decision provenance.
    """
    query = db.query(AuditLogModel)

    if record_id:
        query = query.filter(AuditLogModel.record_id == record_id)
    if action:
        query = query.filter(AuditLogModel.action == action)

    total = query.count()
    records = query.order_by(AuditLogModel.timestamp.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "logs": [
            {
                "id": r.id,
                "record_id": r.record_id,
                "batch_id": r.batch_id,
                "action": r.action,
                "detail": r.detail,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            }
            for r in records
        ],
    }


@router.get("/{record_id}", response_model=Dict[str, Any])
def get_record_audit_trail(record_id: str, db: Session = Depends(get_db)):
    """
    Retrieve the chronological decision trail for a specific transaction or batch.
    """
    records = (
        db.query(AuditLogModel)
        .filter(AuditLogModel.record_id == record_id)
        .order_by(AuditLogModel.timestamp.asc())
        .all()
    )

    if not records:
        raise HTTPException(status_code=404, detail=f"No audit trail found for record '{record_id}'")

    return {
        "record_id": record_id,
        "event_count": len(records),
        "trail": [
            {
                "id": r.id,
                "action": r.action,
                "batch_id": r.batch_id,
                "detail": r.detail,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            }
            for r in records
        ],
    }
