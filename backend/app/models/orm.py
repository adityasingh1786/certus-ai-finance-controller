"""
AI Finance Controller — SQLAlchemy ORM Models
Defines tables for Batches, Settlement Records, Quarantine Records, and Audit Logs.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Numeric,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class BatchModel(Base):
    __tablename__ = "batches"

    id = Column(String(36), primary_key=True)
    filename = Column(String(255), nullable=False)
    source = Column(String(50), default="manual_upload")
    status = Column(String(30), default="processing")
    total_records = Column(Integer, default=0)
    passed_records = Column(Integer, default=0)
    quarantined_records = Column(Integer, default=0)
    avg_confidence = Column(Numeric(4, 3), nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    records = relationship("SettlementRecordModel", back_populates="batch")
    quarantine_records = relationship("QuarantineRecordModel", back_populates="batch")


class SettlementRecordModel(Base):
    __tablename__ = "settlement_records"

    transaction_id = Column(String(100), primary_key=True)
    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=True)
    merchant_id = Column(String(100), nullable=True)
    merchant_name = Column(String(255), nullable=True)
    order_id = Column(String(100), nullable=True)
    invoice_number = Column(String(100), nullable=True)
    utr_number = Column(String(100), nullable=True)
    settlement_date = Column(String(20), nullable=False)
    gross_amount = Column(Numeric(14, 2), nullable=False)
    fee = Column(Numeric(14, 2), default=0.00)
    tax = Column(Numeric(14, 2), default=0.00)
    net_amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(10), default="INR")
    payment_method = Column(String(50), default="UPI")
    status = Column(String(30), default="settled")
    narration = Column(Text, nullable=True)
    confidence_score = Column(Numeric(4, 3), default=1.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    batch = relationship("BatchModel", back_populates="records")


class QuarantineRecordModel(Base):
    __tablename__ = "quarantine_records"

    record_id = Column(String(36), primary_key=True)
    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=True)
    transaction_id = Column(String(100), nullable=True)
    reason_code = Column(String(50), nullable=False)
    reason_detail = Column(Text, nullable=False)
    flagged_by = Column(String(50), default="layer_1_rules")
    model_output = Column(Text, nullable=True)
    raw_record_json = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolution_note = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    batch = relationship("BatchModel", back_populates="quarantine_records")


class AuditLogModel(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(String(100), nullable=True)
    batch_id = Column(String(36), nullable=True)
    action = Column(String(50), nullable=False)
    detail = Column(Text, nullable=False)
    metadata_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ReconciliationRunModel(Base):
    __tablename__ = "reconciliation_runs"

    run_id = Column(String(64), primary_key=True)
    total_records = Column(Integer, default=0)
    matched_count = Column(Integer, default=0)
    mismatched_count = Column(Integer, default=0)
    missing_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    match_rate = Column(Numeric(5, 4), default=0.0)
    avg_confidence = Column(Numeric(5, 4), default=0.0)
    results_json = Column(Text, nullable=False)
    summary_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

