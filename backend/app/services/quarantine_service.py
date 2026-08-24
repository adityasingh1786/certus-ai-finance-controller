from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models.orm import QuarantineRecordModel, AuditLogModel, SettlementRecordModel
from ..agent.schemas import QuarantineRecordResponse, QuarantineResolveRequest
from ..core.logging import logger


class QuarantineService:
    """
    Dedicated service for managing quarantined records, human-in-the-loop
    reviews, diagnostic reason tracking, and audit logging.
    """

    def __init__(self, db_session_factory=None):
        self.db_factory = db_session_factory

    def list_quarantine_records(
        self,
        db: Session,
        status: Optional[str] = None,
        reason_code: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Fetch quarantined records with optional filtering."""
        query = db.query(QuarantineRecordModel)

        if status == "unresolved":
            query = query.filter(QuarantineRecordModel.is_resolved == False)
        elif status == "resolved":
            query = query.filter(QuarantineRecordModel.is_resolved == True)

        if reason_code:
            query = query.filter(QuarantineRecordModel.reason_code == reason_code)

        records = query.order_by(QuarantineRecordModel.created_at.desc()).offset(offset).limit(limit).all()

        return [
            {
                "id": r.record_id,
                "record_id": r.record_id,
                "batch_id": r.batch_id,
                "transaction_id": r.transaction_id,
                "reason_code": r.reason_code,
                "reason_detail": r.reason_detail,
                "flagged_by": r.flagged_by,
                "raw_record_json": r.raw_record_json,
                "model_output": r.model_output,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "is_resolved": r.is_resolved,
                "resolution_note": r.resolution_note,
                "resolved_at": r.resolved_at.isoformat() if r.resolved_at else None,
            }
            for r in records
        ]

    def get_quarantine_by_id(self, db: Session, record_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full details of a quarantined record."""
        r = db.query(QuarantineRecordModel).filter(
            (QuarantineRecordModel.record_id == record_id) | (QuarantineRecordModel.transaction_id == record_id)
        ).first()

        if not r:
            return None

        return {
            "id": r.record_id,
            "record_id": r.record_id,
            "batch_id": r.batch_id,
            "transaction_id": r.transaction_id,
            "reason_code": r.reason_code,
            "reason_detail": r.reason_detail,
            "flagged_by": r.flagged_by,
            "raw_record_json": r.raw_record_json,
            "model_output": r.model_output,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "is_resolved": r.is_resolved,
            "resolution_note": r.resolution_note,
            "resolved_at": r.resolved_at.isoformat() if r.resolved_at else None,
        }

    def resolve_quarantine_record(
        self,
        db: Session,
        record_id: str,
        resolution_type: str,
        notes: str,
        reviewer_id: str = "human_operator_01",
    ) -> Dict[str, Any]:
        """
        Execute human-in-the-loop resolution on a quarantined record.
        Inserts immutable audit log entry and updates status.
        """
        r = db.query(QuarantineRecordModel).filter(
            (QuarantineRecordModel.record_id == record_id) | (QuarantineRecordModel.transaction_id == record_id)
        ).first()

        if not r:
            raise ValueError(f"Quarantine record {record_id} not found.")

        now = datetime.now(timezone.utc)
        r.is_resolved = True
        r.resolution_note = f"[{resolution_type.upper()}] {notes} (by {reviewer_id})"
        r.resolved_at = now

        # Insert immutable audit log
        audit = AuditLogModel(
            record_id=r.record_id,
            batch_id=r.batch_id,
            action="QUARANTINE_RESOLVED",
            detail=f"Resolution: {resolution_type} | Notes: {notes} | Reason: {r.reason_code}",
            timestamp=now,
        )
        db.add(audit)
        db.commit()
        db.refresh(r)

        logger.info(f"Quarantine record {record_id} resolved by {reviewer_id} with action {resolution_type}")

        return {
            "success": True,
            "record_id": r.record_id,
            "status": "RESOLVED",
            "resolution_type": resolution_type,
            "resolved_at": now.isoformat(),
            "audit_logged": True,
        }

    def get_quarantine_stats(self, db: Session) -> Dict[str, Any]:
        """Aggregate breakdown of reason codes and resolution status."""
        total = db.query(QuarantineRecordModel).count()
        unresolved = db.query(QuarantineRecordModel).filter(QuarantineRecordModel.is_resolved == False).count()
        resolved = total - unresolved

        reasons = {}
        all_recs = db.query(QuarantineRecordModel.reason_code).all()
        for rec in all_recs:
            code = rec[0] or "UNKNOWN"
            reasons[code] = reasons.get(code, 0) + 1

        return {
            "total_quarantined": total,
            "active_unresolved": unresolved,
            "resolved_count": resolved,
            "breakdown_by_reason": reasons,
        }
