"""
AI Finance Controller — Ingestion Service

The core pipeline: file upload → parse → per-record validation → route.
Every record either lands in the trusted DB or in quarantine with a reason.
Nothing is silently dropped. Nothing is silently guessed.

KEY DESIGN: Each record is processed independently. A failure on record #23
doesn't stop records #24 through #60 from processing.
"""

import csv
import io
import json
import time
import logging
import traceback
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Optional
from uuid import UUID, uuid4

from app.agent.schemas import (
    BatchStatus,
    BatchSummary,
    QuarantineReasonCode,
    FlaggingLayer,
    AuditAction,
    AuditLogEntry,
    QuarantineRecordBase,
    DataSource,
)
from app.services.rules_engine import RulesEngine, RuleResult
from app.db.session import SessionLocal
from app.models.orm import BatchModel, SettlementRecordModel, QuarantineRecordModel, AuditLogModel

logger = logging.getLogger(__name__)


class IngestionService:
    """
    Ingests settlement data from messy, heterogeneous sources.
    Routes each record through Layer 1 (rules) and optionally Layer 2 (LLM).
    """

    def __init__(self, db_service=None, quarantine_service=None, agent_orchestrator=None):
        self.rules_engine = RulesEngine()
        self.db_service = db_service
        self.quarantine_service = quarantine_service
        self.agent_orchestrator = agent_orchestrator

        # In-memory storage for MVP (replace with Supabase in production)
        self.batches: dict[str, dict] = {}
        self.records: dict[str, list[dict]] = {}
        self.quarantine_records: list[dict] = []
        self.audit_log: list[dict] = []

    async def ingest_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        source: DataSource = DataSource.MANUAL_UPLOAD,
    ) -> dict:
        """
        Accept a file, return a batch_id immediately, process records.

        Returns: { batch_id, status }
        """
        batch_id = str(uuid4())
        start_time = time.time()

        # Initialize batch
        self.batches[batch_id] = {
            "batch_id": batch_id,
            "status": BatchStatus.PROCESSING.value,
            "total": 0,
            "passed": 0,
            "quarantined": 0,
            "failed_to_parse": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "filename": filename,
            "source": source.value,
        }
        self.records[batch_id] = []

        try:
            # Step 1: Parse the file into raw records
            raw_records = self._parse_file(file_content, filename, content_type)

            if raw_records is None:
                # File-level failure — quarantine the whole file
                self._quarantine_file_level(batch_id, filename, "Failed to parse file")
                self.batches[batch_id]["status"] = BatchStatus.COMPLETE.value
                return {"batch_id": batch_id, "status": "complete"}

            self.batches[batch_id]["total"] = len(raw_records)

            # Step 2: Process each record independently (PER-RECORD ERROR BOUNDARY)
            self.rules_engine.reset_batch()

            for idx, raw_record in enumerate(raw_records):
                try:
                    await self._process_single_record(batch_id, raw_record, idx, source)
                except Exception as e:
                    # Per-record error boundary — NEVER let one record crash the batch
                    logger.error(f"Unhandled exception on record {idx} in batch {batch_id}: {e}")
                    self._quarantine_record(
                        batch_id=batch_id,
                        raw_record=raw_record,
                        reason_code=QuarantineReasonCode.PROCESSING_EXCEPTION,
                        reason_detail=f"Unhandled exception processing record {idx}: {str(e)}",
                        flagged_by=FlaggingLayer.SYSTEM,
                        model_output=traceback.format_exc(),
                    )
                    self.batches[batch_id]["quarantined"] += 1

            # Step 3: Finalize batch
            elapsed_ms = int((time.time() - start_time) * 1000)
            self.batches[batch_id]["status"] = BatchStatus.COMPLETE.value
            self.batches[batch_id]["processing_time_ms"] = elapsed_ms

            # Calculate average confidence
            passed_records = [r for r in self.records.get(batch_id, []) if r.get("confidence_score")]
            if passed_records:
                avg_conf = sum(r["confidence_score"] for r in passed_records) / len(passed_records)
                self.batches[batch_id]["avg_confidence"] = round(avg_conf, 3)

            # Log final summary
            summary = self.batches[batch_id]
            audit_item = {
                "batch_id": batch_id,
                "action": "batch_complete",
                "detail": f"Batch complete: {summary['total']} total, {summary['passed']} passed, "
                          f"{summary['quarantined']} quarantined in {elapsed_ms}ms",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            self.audit_log.append(audit_item)
            self._db_save_batch(summary)
            self._db_save_audit(audit_item)

            logger.info(
                f"Batch {batch_id} complete: {summary['total']} total, "
                f"{summary['passed']} passed, {summary['quarantined']} quarantined "
                f"in {elapsed_ms}ms"
            )

        except Exception as e:
            logger.error(f"Batch-level error for {batch_id}: {e}")
            self.batches[batch_id]["status"] = BatchStatus.FAILED.value
            self._quarantine_file_level(batch_id, filename, str(e))

        return {"batch_id": batch_id, "status": self.batches[batch_id]["status"]}

    async def _process_single_record(
        self,
        batch_id: str,
        raw_record: dict,
        idx: int,
        source: DataSource,
    ):
        """
        Process a single record through the dual-layer pipeline.
        This method is wrapped in a per-record try/except at the caller level.
        """
        raw_record["source"] = source.value

        # Layer 1: Deterministic Rules Engine
        result, audit_entries = self.rules_engine.validate_record(raw_record)

        # Store audit entries
        for entry in audit_entries:
            dumped = entry.model_dump(mode="json")
            self.audit_log.append(dumped)
            self._db_save_audit(dumped)

        if result.status == "pass":
            # Record passed all rules — store in trusted DB
            normalized = self._normalize_record(raw_record, batch_id)
            normalized["confidence_score"] = 1.0  # Deterministic = full confidence
            self.records[batch_id].append(normalized)
            self.batches[batch_id]["passed"] += 1
            self._db_save_record(normalized, batch_id)

        elif result.status == "fail":
            # Record failed a deterministic rule — quarantine immediately
            self._quarantine_record(
                batch_id=batch_id,
                raw_record=raw_record,
                reason_code=result.reason_code,
                reason_detail=result.reason_detail,
                flagged_by=FlaggingLayer.RULES_ENGINE,
            )
            self.batches[batch_id]["quarantined"] += 1

        elif result.status == "ambiguous":
            # Record needs LLM judgment — escalate to Layer 2
            await self._escalate_to_llm(batch_id, raw_record, result)

    async def _escalate_to_llm(self, batch_id: str, raw_record: dict, rule_result: RuleResult):
        """
        Layer 2: Escalate ambiguous record to LLM for extraction/classification.
        LLM output MUST pass Pydantic validation before being trusted.
        """
        if self.agent_orchestrator is None:
            # No LLM available — quarantine with reason
            self._quarantine_record(
                batch_id=batch_id,
                raw_record=raw_record,
                reason_code=rule_result.reason_code or QuarantineReasonCode.LOW_CONFIDENCE,
                reason_detail=f"Ambiguous record (rule: {rule_result.rule_id}) — no LLM available for resolution. "
                              f"Original reason: {rule_result.reason_detail}",
                flagged_by=FlaggingLayer.RULES_ENGINE,
                confidence=rule_result.confidence,
            )
            self.batches[batch_id]["quarantined"] += 1
            return

        try:
            # Call LLM for extraction
            llm_result = await self.agent_orchestrator.extract_structured_record(raw_record)

            if llm_result is None:
                # LLM returned nothing — quarantine
                self._quarantine_record(
                    batch_id=batch_id,
                    raw_record=raw_record,
                    reason_code=QuarantineReasonCode.LLM_SCHEMA_FAIL,
                    reason_detail="LLM returned no result for ambiguous record",
                    flagged_by=FlaggingLayer.LLM_AGENT,
                )
                self.batches[batch_id]["quarantined"] += 1
                return

            confidence = llm_result.get("confidence", 0.0)

            # Confidence gate — even schema-valid results can be rejected if low confidence
            from app.core.config import get_settings
            threshold = get_settings().confidence_threshold

            if confidence < threshold:
                self._quarantine_record(
                    batch_id=batch_id,
                    raw_record=raw_record,
                    reason_code=QuarantineReasonCode.LOW_CONFIDENCE,
                    reason_detail=f"LLM confidence ({confidence:.2f}) below threshold ({threshold})",
                    flagged_by=FlaggingLayer.LLM_AGENT,
                    confidence=confidence,
                    model_output=json.dumps(llm_result),
                )
                self.batches[batch_id]["quarantined"] += 1
                return

            # Schema validation gate — the LLM output must validate
            try:
                from app.agent.schemas import SettlementRecordCreate
                validated = SettlementRecordCreate(**llm_result.get("data", {}))
                normalized = self._normalize_record(validated.model_dump(mode="json"), batch_id)
                normalized["confidence_score"] = confidence
                self.records[batch_id].append(normalized)
                self.batches[batch_id]["passed"] += 1

                self.audit_log.append({
                    "record_id": normalized.get("transaction_id"),
                    "batch_id": batch_id,
                    "action": AuditAction.VALIDATED.value,
                    "layer": FlaggingLayer.LLM_AGENT.value,
                    "detail": f"LLM extraction validated with confidence {confidence:.2f}",
                    "confidence_score": confidence,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            except Exception as validation_error:
                # Pydantic validation failed — quarantine with raw LLM output
                self._quarantine_record(
                    batch_id=batch_id,
                    raw_record=raw_record,
                    reason_code=QuarantineReasonCode.LLM_SCHEMA_FAIL,
                    reason_detail=f"LLM output failed schema validation: {str(validation_error)}",
                    flagged_by=FlaggingLayer.LLM_AGENT,
                    confidence=confidence,
                    model_output=json.dumps(llm_result),
                )
                self.batches[batch_id]["quarantined"] += 1

        except Exception as e:
            # LLM call failed — quarantine, don't crash
            self._quarantine_record(
                batch_id=batch_id,
                raw_record=raw_record,
                reason_code=QuarantineReasonCode.PROCESSING_EXCEPTION,
                reason_detail=f"LLM escalation failed: {str(e)}",
                flagged_by=FlaggingLayer.LLM_AGENT,
                model_output=traceback.format_exc(),
            )
            self.batches[batch_id]["quarantined"] += 1

    def _parse_file(
        self, content: bytes, filename: str, content_type: str
    ) -> Optional[list[dict]]:
        """
        Parse uploaded file into a list of raw record dicts.
        Supports CSV and plain text. PDF support can be added.
        """
        try:
            if content_type == "text/csv" or filename.lower().endswith(".csv"):
                return self._parse_csv(content)
            elif content_type == "text/plain" or filename.lower().endswith(".txt"):
                return self._parse_text(content)
            elif content_type == "application/json" or filename.lower().endswith(".json"):
                return self._parse_json(content)
            elif content_type == "application/pdf" or filename.lower().endswith(".pdf"):
                return self._parse_pdf(content)
            else:
                logger.warning(f"Unsupported file type: {content_type} ({filename})")
                return None
        except Exception as e:
            logger.error(f"File parsing failed for {filename}: {e}")
            return None

    def _parse_csv(self, content: bytes) -> list[dict]:
        """Parse CSV content into list of dicts with BOM sanitization & dynamic column mapping."""
        text = content.decode("utf-8", errors="replace").lstrip("\ufeff")
        reader = csv.DictReader(io.StringIO(text))
        raw_rows = list(reader)
        if not raw_rows:
            return []

        # Apply ColumnDetector for automatic schema mapping
        try:
            from app.services.column_detector import ColumnDetector
            detector = ColumnDetector()
            mapping = detector.detect_mapping(raw_rows[:10])
        except Exception:
            mapping = {}

        records = []
        for row in raw_rows:
            cleaned = {}
            for k, v in row.items():
                if k:
                    cleaned_key = k.strip().lower().replace(" ", "_")
                    cleaned[cleaned_key] = v.strip() if isinstance(v, str) else v

            # Map canonical field names if detected
            for canonical_key, raw_header in mapping.items():
                clean_raw = raw_header.strip().lower().replace(" ", "_")
                if clean_raw in cleaned and canonical_key not in cleaned:
                    cleaned[canonical_key] = cleaned[clean_raw]

            records.append(cleaned)
        return records

    def _parse_text(self, content: bytes) -> list[dict]:
        """Parse plain text — treat each line as a narration to be extracted."""
        text = content.decode("utf-8", errors="replace")
        lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
        records = []
        for i, line in enumerate(lines):
            records.append({
                "transaction_id": f"TXT-{uuid4().hex[:8]}",
                "narration": line,
                "source": "text_upload",
                "raw_line_number": i + 1,
            })
        return records

    def _parse_json(self, content: bytes) -> list[dict]:
        """Parse JSON content."""
        text = content.decode("utf-8", errors="replace")
        data = json.loads(text)
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "records" in data:
            return data["records"]
        else:
            return [data]

    def _parse_pdf(self, content: bytes) -> Optional[list[dict]]:
        """Parse PDF content (basic text extraction)."""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=content, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()

            # Treat extracted text as lines to process
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            records = []
            for i, line in enumerate(lines):
                if len(line) > 5:  # Skip very short lines (headers, etc.)
                    records.append({
                        "transaction_id": f"PDF-{uuid4().hex[:8]}",
                        "narration": line,
                        "source": "pdf_upload",
                        "raw_line_number": i + 1,
                    })
            return records if records else None
        except ImportError:
            logger.warning("PyMuPDF not installed — PDF parsing unavailable")
            return None
        except Exception as e:
            logger.error(f"PDF parsing failed: {e}")
            return None

    def _normalize_record(self, raw: dict, batch_id: str) -> dict:
        """Normalize a raw record dict into standard format across Razorpay, Bank, and ERP sources."""
        # 1. Transaction & Identifier mapping
        tx_id = (
            raw.get("transaction_id")
            or raw.get("entity_id")
            or raw.get("payment_id")
            or raw.get("voucher_number")
            or f"TX-{uuid4().hex[:8]}"
        )
        utr = raw.get("utr_number") or raw.get("settlement_utr") or raw.get("chq_ref_no") or raw.get("utr")
        payment_id = raw.get("payment_id") or raw.get("entity_id") or raw.get("razorpay_payment_id")
        order_id = raw.get("order_id")
        invoice_number = raw.get("invoice_number")
        merchant_name = raw.get("merchant_name") or raw.get("merchant_legal_name") or raw.get("ledger_name") or raw.get("merchant_id")

        # 2. Financial Amount Normalization — Deterministic conversion (no magnitude guessing)
        gross_raw = raw.get("gross_amount") or raw.get("gross_invoice_value") or raw.get("amount") or raw.get("deposit_amount") or 0
        fee_raw = raw.get("fee") or 0
        tax_raw = raw.get("tax") or 0
        tds_raw = raw.get("tds_194o") or raw.get("tds_section_194o") or 0
        net_raw = raw.get("net_amount") or raw.get("deposit_amount") or raw.get("net_receivable")

        # Explicit unit check — only convert if explicitly declared in paise
        is_explicit_paise = str(raw.get("currency_unit", "")).lower() in ("paise", "paisa")

        def _to_decimal(v, default=Decimal("0")):
            if v is None or v == "":
                return default
            try:
                d = Decimal(str(v).replace(",", "").replace("₹", "").replace("$", "").strip())
                return d / Decimal(100) if is_explicit_paise else d
            except (InvalidOperation, TypeError, ValueError):
                return default

        gross_dec = _to_decimal(gross_raw)
        fee_dec = _to_decimal(fee_raw)
        tax_dec = _to_decimal(tax_raw)
        tds_dec = _to_decimal(tds_raw)

        if net_raw is not None and str(net_raw).strip() != "":
            try:
                net_dec = Decimal(str(net_raw))
            except (InvalidOperation, TypeError):
                net_dec = gross_dec - fee_dec - tax_dec - tds_dec
        else:
            net_dec = gross_dec - fee_dec - tax_dec - tds_dec

        # 3. Settlement Date extraction
        date_raw = raw.get("settlement_date") or raw.get("settled_at") or raw.get("voucher_date") or raw.get("date") or raw.get("created_at") or ""
        if isinstance(date_raw, str) and "T" in date_raw:
            settle_date = date_raw.split("T")[0]
        elif isinstance(date_raw, str) and "/" in date_raw:
            # DD/MM/YYYY
            parts = date_raw.split("/")
            if len(parts) == 3:
                settle_date = f"{parts[2]}-{parts[1]}-{parts[0]}"
            else:
                settle_date = date_raw
        else:
            settle_date = str(date_raw)

        record = {
            "id": str(uuid4()),
            "batch_id": batch_id,
            "transaction_id": str(tx_id),
            "merchant_id": str(merchant_name or ""),
            "merchant_name": str(merchant_name or ""),
            "settlement_date": settle_date,
            "gross_amount": str(gross_dec),
            "fee": str(fee_dec),
            "tax": str(tax_dec),
            "tds_194o": str(tds_dec),
            "net_amount": str(net_dec),
            "currency": str(raw.get("currency", "INR")).upper(),
            "payment_method": str(raw.get("payment_method") or raw.get("method") or "OTHER").upper(),
            "status": str(raw.get("status", "settled" if net_dec > 0 else "pending")).lower(),
            "narration": raw.get("narration") or raw.get("description") or "",
            "source": raw.get("source", "razorpay_gateway"),
            "utr_number": utr,
            "payment_id": payment_id,
            "order_id": order_id,
            "invoice_number": invoice_number,
            "confidence_score": raw.get("confidence_score", 1.0),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        return record

    def _quarantine_record(
        self,
        batch_id: str,
        raw_record: dict,
        reason_code: QuarantineReasonCode,
        reason_detail: str,
        flagged_by: FlaggingLayer,
        confidence: Optional[float] = None,
        model_output: Optional[str] = None,
    ):
        """Store a record in quarantine with full explainability."""
        quarantine_entry = {
            "record_id": str(uuid4()),
            "batch_id": batch_id,
            "transaction_id": raw_record.get("transaction_id"),
            "reason_code": reason_code.value,
            "reason_detail": reason_detail,
            "flagged_by": flagged_by.value,
            "raw_input": json.dumps(raw_record, default=str),
            "confidence_score": confidence,
            "model_output": model_output,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "resolved": False,
            "resolved_at": None,
            "resolution_note": None,
        }
        self.quarantine_records.append(quarantine_entry)
        self._db_save_quarantine(quarantine_entry)

        # Audit log entry
        audit_entry = {
            "record_id": raw_record.get("transaction_id", "unknown"),
            "batch_id": batch_id,
            "action": AuditAction.QUARANTINED.value,
            "layer": flagged_by.value,
            "detail": f"{reason_code.value}: {reason_detail}",
            "confidence_score": confidence,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.audit_log.append(audit_entry)
        self._db_save_audit(audit_entry)

    def _quarantine_file_level(self, batch_id: str, filename: str, reason: str):
        """Quarantine an entire file — no partial parse attempted."""
        self._quarantine_record(
            batch_id=batch_id,
            raw_record={"filename": filename, "error": reason},
            reason_code=QuarantineReasonCode.FILE_LEVEL_FAILURE,
            reason_detail=f"File-level failure for '{filename}': {reason}",
            flagged_by=FlaggingLayer.SYSTEM,
        )
        self.batches[batch_id]["failed_to_parse"] = 1
        self.batches[batch_id]["quarantined"] += 1

    # ============================================================
    # PERSISTENCE HELPERS (SQLite / SQLAlchemy)
    # ============================================================

    def _db_save_batch(self, batch_data: dict):
        try:
            with SessionLocal() as db:
                batch = db.query(BatchModel).filter_by(id=batch_data["batch_id"]).first()
                if not batch:
                    batch = BatchModel(id=batch_data["batch_id"])
                    db.add(batch)
                batch.filename = batch_data.get("filename", "unknown.csv")
                batch.source = batch_data.get("source", "manual_upload")
                batch.status = batch_data.get("status", "complete")
                batch.total_records = batch_data.get("total", 0)
                batch.passed_records = batch_data.get("passed", 0)
                batch.quarantined_records = batch_data.get("quarantined", 0)
                batch.avg_confidence = batch_data.get("avg_confidence")
                batch.processing_time_ms = batch_data.get("processing_time_ms")
                db.commit()
        except Exception as e:
            logger.warning(f"Database batch save warning: {e}")

    def _db_save_record(self, record_data: dict, batch_id: str):
        try:
            with SessionLocal() as db:
                txn_id = record_data.get("transaction_id")
                if not txn_id:
                    return
                rec = db.query(SettlementRecordModel).filter_by(transaction_id=txn_id).first()
                if not rec:
                    rec = SettlementRecordModel(transaction_id=txn_id)
                    db.add(rec)
                rec.batch_id = batch_id
                rec.merchant_id = record_data.get("merchant_id")
                rec.merchant_name = record_data.get("merchant_name")
                rec.order_id = record_data.get("order_id")
                rec.invoice_number = record_data.get("invoice_number")
                rec.utr_number = record_data.get("utr_number")
                rec.settlement_date = str(record_data.get("settlement_date", ""))
                rec.gross_amount = Decimal(str(record_data.get("gross_amount", 0)))
                rec.fee = Decimal(str(record_data.get("fee", 0)))
                rec.tax = Decimal(str(record_data.get("tax", 0)))
                rec.net_amount = Decimal(str(record_data.get("net_amount", 0)))
                rec.currency = record_data.get("currency", "INR")
                rec.payment_method = record_data.get("payment_method", "UPI")
                rec.status = record_data.get("status", "settled")
                rec.narration = record_data.get("narration")
                rec.confidence_score = record_data.get("confidence_score", 1.0)
                db.commit()
        except Exception as e:
            logger.warning(f"Database record save warning: {e}")

    def _db_save_quarantine(self, q_data: dict):
        try:
            with SessionLocal() as db:
                rec_id = q_data.get("record_id")
                if not rec_id:
                    return
                q = db.query(QuarantineRecordModel).filter_by(record_id=rec_id).first()
                if not q:
                    q = QuarantineRecordModel(record_id=rec_id)
                    db.add(q)
                q.batch_id = q_data.get("batch_id")
                q.transaction_id = q_data.get("transaction_id")
                q.reason_code = q_data.get("reason_code", "UNKNOWN")
                q.reason_detail = q_data.get("reason_detail", "")
                q.flagged_by = q_data.get("flagged_by", "system")
                q.model_output = q_data.get("model_output")
                q.raw_record_json = json.dumps(q_data.get("raw_record", {}))
                q.is_resolved = q_data.get("resolved", False)
                q.resolution_note = q_data.get("resolution_note")
                db.commit()
        except Exception as e:
            logger.warning(f"Database quarantine save warning: {e}")

    def _db_save_audit(self, audit_data: dict):
        try:
            with SessionLocal() as db:
                audit = AuditLogModel(
                    record_id=audit_data.get("record_id"),
                    batch_id=audit_data.get("batch_id"),
                    action=audit_data.get("action", "UNKNOWN"),
                    detail=audit_data.get("detail", ""),
                    metadata_json=json.dumps(audit_data) if isinstance(audit_data, dict) else None,
                )
                db.add(audit)
                db.commit()
        except Exception as e:
            logger.warning(f"Database audit save warning: {e}")

    # ============================================================
    # QUERY METHODS (used by API endpoints)
    # ============================================================

    def get_batch_status(self, batch_id: str) -> Optional[dict]:
        if batch_id in self.batches:
            return self.batches.get(batch_id)
        try:
            with SessionLocal() as db:
                b = db.query(BatchModel).filter_by(id=batch_id).first()
                if b:
                    return {
                        "batch_id": b.id,
                        "status": b.status,
                        "total": b.total_records,
                        "passed": b.passed_records,
                        "quarantined": b.quarantined_records,
                        "avg_confidence": float(b.avg_confidence) if b.avg_confidence else None,
                        "filename": b.filename,
                        "source": b.source,
                    }
        except Exception:
            pass
        return None

    def get_batch_summary(self, batch_id: str) -> Optional[dict]:
        return self.get_batch_status(batch_id)

    def get_batch_records(self, batch_id: str) -> list[dict]:
        if batch_id in self.records and self.records[batch_id]:
            return self.records[batch_id]
        try:
            with SessionLocal() as db:
                recs = db.query(SettlementRecordModel).filter_by(batch_id=batch_id).all()
                if recs:
                    return [
                        {
                            "transaction_id": r.transaction_id,
                            "batch_id": r.batch_id,
                            "merchant_id": r.merchant_id,
                            "merchant_name": r.merchant_name,
                            "order_id": r.order_id,
                            "invoice_number": r.invoice_number,
                            "utr_number": r.utr_number,
                            "settlement_date": r.settlement_date,
                            "gross_amount": str(r.gross_amount),
                            "fee": str(r.fee),
                            "tax": str(r.tax),
                            "net_amount": str(r.net_amount),
                            "currency": r.currency,
                            "payment_method": r.payment_method,
                            "status": r.status,
                            "narration": r.narration,
                            "confidence_score": float(r.confidence_score) if r.confidence_score else 1.0,
                        }
                        for r in recs
                    ]
        except Exception:
            pass
        return []

    def get_all_records(self) -> list[dict]:
        db_records = []
        try:
            with SessionLocal() as db:
                recs = db.query(SettlementRecordModel).order_by(SettlementRecordModel.created_at.desc()).limit(1000).all()
                db_records = [
                    {
                        "transaction_id": r.transaction_id,
                        "batch_id": r.batch_id,
                        "merchant_id": r.merchant_id,
                        "merchant_name": r.merchant_name,
                        "order_id": r.order_id,
                        "invoice_number": r.invoice_number,
                        "utr_number": r.utr_number,
                        "settlement_date": r.settlement_date,
                        "gross_amount": str(r.gross_amount),
                        "fee": str(r.fee),
                        "tax": str(r.tax),
                        "net_amount": str(r.net_amount),
                        "currency": r.currency,
                        "payment_method": r.payment_method,
                        "status": r.status,
                        "narration": r.narration,
                        "confidence_score": float(r.confidence_score) if r.confidence_score else 1.0,
                    }
                    for r in recs
                ]
        except Exception as e:
            logger.warning(f"Database query error in get_all_records: {e}")

        # Combine with in-memory records (keyed by transaction_id to dedupe)
        seen_txns = {r["transaction_id"] for r in db_records if r.get("transaction_id")}
        for batch_recs in self.records.values():
            for r in batch_recs:
                txn = r.get("transaction_id")
                if txn and txn not in seen_txns:
                    db_records.append(r)
                    seen_txns.add(txn)
        return db_records

    def get_quarantine_records(self, batch_id: Optional[str] = None) -> list[dict]:
        db_records = []
        try:
            with SessionLocal() as db:
                q = db.query(QuarantineRecordModel)
                if batch_id:
                    q = q.filter_by(batch_id=batch_id)
                recs = q.order_by(QuarantineRecordModel.created_at.desc()).limit(500).all()
                db_records = [
                    {
                        "record_id": r.record_id,
                        "batch_id": r.batch_id,
                        "transaction_id": r.transaction_id,
                        "reason_code": r.reason_code,
                        "reason_detail": r.reason_detail,
                        "flagged_by": r.flagged_by,
                        "raw_record": json.loads(r.raw_record_json) if r.raw_record_json else {},
                        "resolved": r.is_resolved,
                        "resolution_note": r.resolution_note,
                        "resolved_at": r.resolved_at.isoformat() if r.resolved_at else None,
                    }
                    for r in recs
                ]
        except Exception as e:
            logger.warning(f"Database quarantine query warning: {e}")

        seen_ids = {r["record_id"] for r in db_records}
        for r in self.quarantine_records:
            if batch_id and r.get("batch_id") != batch_id:
                continue
            if r.get("record_id") not in seen_ids:
                db_records.append(r)
                seen_ids.add(r.get("record_id"))
        return db_records

    def get_quarantine_record(self, record_id: str) -> Optional[dict]:
        for r in self.quarantine_records:
            if r["record_id"] == record_id or r.get("transaction_id") == record_id:
                return r
        try:
            with SessionLocal() as db:
                r = db.query(QuarantineRecordModel).filter(
                    (QuarantineRecordModel.record_id == record_id) | (QuarantineRecordModel.transaction_id == record_id)
                ).first()
                if r:
                    return {
                        "record_id": r.record_id,
                        "batch_id": r.batch_id,
                        "transaction_id": r.transaction_id,
                        "reason_code": r.reason_code,
                        "reason_detail": r.reason_detail,
                        "flagged_by": r.flagged_by,
                        "raw_record": json.loads(r.raw_record_json) if r.raw_record_json else {},
                        "resolved": r.is_resolved,
                        "resolution_note": r.resolution_note,
                        "resolved_at": r.resolved_at.isoformat() if r.resolved_at else None,
                    }
        except Exception:
            pass
        return None

    def resolve_quarantine_record(self, record_id: str, resolution_note: str, corrected_data: Optional[dict] = None) -> Optional[dict]:
        resolved_item = None
        for r in self.quarantine_records:
            if r["record_id"] == record_id or r.get("transaction_id") == record_id:
                r["resolved"] = True
                r["resolved_at"] = datetime.now(timezone.utc).isoformat()
                r["resolution_note"] = resolution_note
                resolved_item = r
                break

        now = datetime.now(timezone.utc)
        try:
            with SessionLocal() as db:
                q = db.query(QuarantineRecordModel).filter(
                    (QuarantineRecordModel.record_id == record_id) | (QuarantineRecordModel.transaction_id == record_id)
                ).first()
                if q:
                    q.is_resolved = True
                    q.resolution_note = resolution_note
                    q.resolved_at = now
                    db.commit()
        except Exception as e:
            logger.warning(f"Database resolve quarantine error: {e}")

        # Audit log
        audit_entry = {
            "record_id": record_id,
            "batch_id": resolved_item.get("batch_id") if resolved_item else None,
            "action": AuditAction.RESOLVED.value,
            "layer": FlaggingLayer.SYSTEM.value,
            "detail": f"Resolved: {resolution_note}",
            "timestamp": now.isoformat(),
        }
        self.audit_log.append(audit_entry)
        self._db_save_audit(audit_entry)

        return resolved_item or {"record_id": record_id, "resolved": True, "resolution_note": resolution_note}

    def get_audit_log(self, record_id: Optional[str] = None) -> list[dict]:
        db_logs = []
        try:
            with SessionLocal() as db:
                q = db.query(AuditLogModel)
                if record_id:
                    q = q.filter_by(record_id=record_id)
                logs = q.order_by(AuditLogModel.timestamp.desc()).limit(500).all()
                db_logs = [
                    {
                        "id": l.id,
                        "record_id": l.record_id,
                        "batch_id": l.batch_id,
                        "action": l.action,
                        "detail": l.detail,
                        "timestamp": l.timestamp.isoformat() if l.timestamp else None,
                    }
                    for l in logs
                ]
        except Exception as e:
            logger.warning(f"Database audit query warning: {e}")

        seen_keys = {(l.get("record_id"), l.get("action"), l.get("timestamp")) for l in db_logs}
        for entry in self.audit_log:
            if record_id and entry.get("record_id") != record_id:
                continue
            key = (entry.get("record_id"), entry.get("action"), entry.get("timestamp"))
            if key not in seen_keys:
                db_logs.append(entry)
                seen_keys.add(key)
        return db_logs
