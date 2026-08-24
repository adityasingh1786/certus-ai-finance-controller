"""
AI Finance Controller — Pydantic Schemas

Every data structure that crosses a trust boundary is defined here.
These schemas are the enforcement mechanism behind "deterministic fallback" —
an LLM response that doesn't validate against these models is programmatically rejected.
"""

from datetime import datetime, date, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional, Any, List, Dict
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


# ============================================================
# ENUMS
# ============================================================

class Currency(str, Enum):
    INR = "INR"
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"


class PaymentMethod(str, Enum):
    UPI = "UPI"
    CARD = "CARD"
    NETBANKING = "NETBANKING"
    WALLET = "WALLET"
    BANK_TRANSFER = "BANK_TRANSFER"
    OTHER = "OTHER"


class RecordStatus(str, Enum):
    PENDING = "pending"
    SETTLED = "settled"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class BatchStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"


class QuarantineReasonCode(str, Enum):
    DUPLICATE_ID = "DUPLICATE_ID"
    MISSING_FIELD = "MISSING_FIELD"
    INVALID_CURRENCY = "INVALID_CURRENCY"
    IMPOSSIBLE_VALUE = "IMPOSSIBLE_VALUE"
    INVALID_DATE = "INVALID_DATE"
    LLM_SCHEMA_FAIL = "LLM_SCHEMA_FAIL"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    PROCESSING_EXCEPTION = "PROCESSING_EXCEPTION"
    FILE_LEVEL_FAILURE = "FILE_LEVEL_FAILURE"
    MALFORMED_NARRATION = "MALFORMED_NARRATION"
    AMOUNT_MISMATCH = "AMOUNT_MISMATCH"
    REFERENCE_MISMATCH = "REFERENCE_MISMATCH"


class FlaggingLayer(str, Enum):
    RULES_ENGINE = "rules_engine"
    LLM_AGENT = "llm_agent"
    SYSTEM = "system"


class AuditAction(str, Enum):
    INGESTED = "ingested"
    VALIDATED = "validated"
    QUARANTINED = "quarantined"
    RESOLVED = "resolved"
    MATCHED = "matched"
    EXCEPTION = "exception"


class DataSource(str, Enum):
    RAZORPAY_GATEWAY = "razorpay_gateway"
    BANK_STATEMENT = "bank_statement"
    ERP_LEDGER = "erp_ledger"
    MANUAL_UPLOAD = "manual_upload"


# ============================================================
# SETTLEMENT RECORD SCHEMAS
# ============================================================

class SettlementRecordBase(BaseModel):
    """Base schema for a normalized settlement record."""
    transaction_id: str = Field(..., min_length=1, max_length=100, description="Unique transaction identifier")
    merchant_id: str = Field(..., min_length=1, max_length=100)
    settlement_date: date
    gross_amount: Decimal = Field(..., ge=0, decimal_places=2)
    fee: Decimal = Field(..., ge=0, decimal_places=2)
    tax: Decimal = Field(..., ge=0, decimal_places=2)
    net_amount: Decimal = Field(..., decimal_places=2)
    currency: Currency
    payment_method: PaymentMethod
    status: RecordStatus
    narration: str = Field(default="", max_length=1000)
    source: DataSource = DataSource.MANUAL_UPLOAD

    # Optional cross-reference fields for multi-source reconciliation
    utr_number: Optional[str] = None
    payment_id: Optional[str] = None  # Razorpay payment_id
    order_id: Optional[str] = None  # Razorpay order_id
    invoice_number: Optional[str] = None  # ERP invoice reference

    @field_validator("settlement_date")
    @classmethod
    def date_not_in_far_future(cls, v: date) -> date:
        from datetime import timedelta
        max_future = date.today() + timedelta(days=30)
        if v > max_future:
            raise ValueError(f"Settlement date {v} is more than 30 days in the future")
        return v

    @model_validator(mode="after")
    def net_must_not_exceed_gross(self):
        if self.net_amount > self.gross_amount:
            raise ValueError(
                f"net_amount ({self.net_amount}) cannot exceed gross_amount ({self.gross_amount})"
            )
        expected_net = self.gross_amount - self.fee - self.tax
        if abs(self.net_amount - expected_net) > Decimal("1.00"):
            raise ValueError(
                f"net_amount ({self.net_amount}) doesn't match "
                f"gross - fee - tax ({expected_net}), delta > ₹1"
            )
        return self


class SettlementRecordCreate(SettlementRecordBase):
    """Schema for creating a new settlement record."""
    pass


class SettlementRecordDB(SettlementRecordBase):
    """Schema for a settlement record stored in the database."""
    id: UUID = Field(default_factory=uuid4)
    batch_id: UUID
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SettlementRecordResponse(SettlementRecordDB):
    """Response schema for a settlement record."""
    model_config = ConfigDict(from_attributes=True)


# ============================================================
# BATCH SCHEMAS
# ============================================================

class BatchSummary(BaseModel):
    """Summary of a processed batch — the object you screenshot for the pitch."""
    batch_id: UUID
    status: BatchStatus
    total: int = Field(..., ge=0)
    passed: int = Field(..., ge=0)
    quarantined: int = Field(..., ge=0)
    failed_to_parse: int = Field(0, ge=0)
    avg_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    processing_time_ms: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BatchStatusResponse(BaseModel):
    """Polling response for batch processing status."""
    batch_id: UUID
    status: BatchStatus
    progress_pct: Optional[float] = Field(None, ge=0.0, le=100.0)


# ============================================================
# QUARANTINE SCHEMAS
# ============================================================

class QuarantineRecordBase(BaseModel):
    """A quarantined record — the explainability artifact itself."""
    record_id: UUID = Field(default_factory=uuid4)
    batch_id: UUID
    transaction_id: Optional[str] = None
    reason_code: QuarantineReasonCode
    reason_detail: str = Field(..., min_length=1, description="Human-readable explanation")
    flagged_by: FlaggingLayer
    raw_input: str = Field(..., description="The original raw input that caused the flag")
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    model_output: Optional[str] = None  # Raw LLM output if applicable
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved: bool = False
    resolved_at: Optional[datetime] = None
    resolution_note: Optional[str] = None


class QuarantineRecordResponse(QuarantineRecordBase):
    """Response schema for quarantine records."""
    model_config = ConfigDict(from_attributes=True)


class QuarantineResolveRequest(BaseModel):
    """Request to resolve a quarantined record."""
    resolution_note: str = Field(..., min_length=1, max_length=500)
    corrected_data: Optional[Dict[str, Any]] = None


# ============================================================
# CASH POSITION SCHEMAS
# ============================================================

class CashPositionCurrent(BaseModel):
    """Current aggregated cash position."""
    total_balance: Decimal
    currency: Currency = Currency.INR
    accounts: List[Dict[str, Any]] = []
    pending_settlements: Decimal = Decimal("0")
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CashPositionHistory(BaseModel):
    """Historical cash position data point."""
    date: date
    balance: Decimal
    inflows: Decimal
    outflows: Decimal
    net_change: Decimal


class CashPositionForecast(BaseModel):
    """Projected cash position."""
    forecast_date: date
    projected_balance: Decimal
    confidence_band_low: Decimal
    confidence_band_high: Decimal
    pending_settlements: Decimal
    method: str = "weighted_moving_average"
    cited_record_ids: List[str] = []


# ============================================================
# AGENT QUERY SCHEMAS
# ============================================================

class AgentQueryRequest(BaseModel):
    """Natural-language query to the agent."""
    question: str = Field(..., min_length=1, max_length=1000)
    conversation_id: Optional[str] = None


class AgentToolCall(BaseModel):
    """Record of a tool call made by the agent."""
    tool_name: str
    arguments: Dict[str, Any]
    result_summary: str
    duration_ms: int


class AgentQueryResponse(BaseModel):
    """Agent response — answer + confidence + cited record IDs. Non-negotiable: no citation = error."""
    answer: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    cited_record_ids: List[str] = Field(..., min_length=0, description="Source record IDs backing this answer")
    conversation_id: str
    tool_calls: List[AgentToolCall] = []
    reasoning_trace: Optional[str] = None


class AgentToolSchema(BaseModel):
    """Schema describing an available agent tool — shown at /agent/tools."""
    name: str
    description: str
    parameters: Dict[str, Any]
    is_read_only: bool = True


# ============================================================
# AUDIT LOG SCHEMAS
# ============================================================

class AuditLogEntry(BaseModel):
    """Full decision trail for any single record."""
    id: UUID = Field(default_factory=uuid4)
    record_id: Optional[str] = None
    batch_id: Optional[str] = None
    action: AuditAction
    layer: FlaggingLayer
    detail: str
    confidence_score: Optional[float] = None
    rule_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Optional[Dict[str, Any]] = None


# ============================================================
# RECONCILIATION SCHEMAS
# ============================================================

class ReconciliationMatch(BaseModel):
    """A matched pair/group across data sources."""
    match_id: UUID = Field(default_factory=uuid4)
    source_records: List[Dict[str, Any]]
    match_type: str  # "exact", "fuzzy", "llm_assisted"
    confidence: float = Field(..., ge=0.0, le=1.0)
    match_reason: str  # Human-readable: "same amount, UTR substring match, 1-day window"
    amount_delta: Optional[Decimal] = None
    date_delta_days: Optional[int] = None


class ReconciliationSummary(BaseModel):
    """Overall reconciliation results."""
    total_records: int
    matched: int
    unmatched: int
    exceptions: int
    match_rate: float = Field(..., ge=0.0, le=1.0)
    throughput_records_per_second: Optional[float] = None
    processing_time_ms: int
