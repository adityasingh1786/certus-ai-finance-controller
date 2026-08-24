"""
AI Finance Controller — Deterministic Rules Engine (Layer 1)

Runs FIRST on every record, ALWAYS. Cheap, instant, no LLM cost.
Its behavior is 100% predictable in a live demo.

Three-way routing:
  - PASS: record is fully valid and structured → write to trusted DB
  - FAIL: record violates a deterministic rule → quarantine with reason_code
  - AMBIGUOUS: record passes basic checks but is unstructured/needs judgment → escalate to LLM
"""

import re
import logging
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation
from typing import Optional
from uuid import UUID

from app.agent.schemas import (
    Currency,
    PaymentMethod,
    RecordStatus,
    QuarantineReasonCode,
    FlaggingLayer,
    AuditAction,
    AuditLogEntry,
)

logger = logging.getLogger(__name__)


class RuleResult:
    """Result of running the rules engine on a single record."""

    def __init__(
        self,
        status: str,  # "pass", "fail", "ambiguous"
        reason_code: Optional[QuarantineReasonCode] = None,
        reason_detail: Optional[str] = None,
        rule_id: Optional[str] = None,
        confidence: float = 1.0,
    ):
        self.status = status
        self.reason_code = reason_code
        self.reason_detail = reason_detail
        self.rule_id = rule_id
        self.confidence = confidence

    def __repr__(self):
        return f"RuleResult(status={self.status}, reason_code={self.reason_code}, rule_id={self.rule_id})"


class RulesEngine:
    """
    Deterministic Layer 1 validation.

    Each rule is a separate method returning a RuleResult.
    Rules are run sequentially — first failure short-circuits to quarantine.
    If all rules pass but the narration is unstructured, route to AMBIGUOUS.
    """

    # Known transaction IDs seen in this batch (for duplicate detection)
    _seen_transaction_ids: set[str]

    def __init__(self):
        self._seen_transaction_ids = set()
        self._valid_currencies = {c.value for c in Currency}
        self._valid_payment_methods = {m.value for m in PaymentMethod}
        self._valid_statuses = {s.value for s in RecordStatus}

    def reset_batch(self):
        """Reset state for a new batch."""
        self._seen_transaction_ids.clear()

    def validate_record(self, record: dict) -> tuple[RuleResult, list[AuditLogEntry]]:
        """
        Run all deterministic rules on a single record.
        Returns (RuleResult, list of audit log entries).

        This is wrapped in a per-record error boundary at the service level —
        an exception here quarantines this record, never crashes the batch.
        """
        audit_entries = []

        # Standardize field aliases across Razorpay / Bank / ERP formats
        if "transaction_id" not in record:
            record["transaction_id"] = record.get("entity_id") or record.get("payment_id") or record.get("voucher_number")
        if "merchant_id" not in record:
            record["merchant_id"] = record.get("merchant_name") or record.get("ledger_name") or record.get("merchant_legal_name")
        if "settlement_date" not in record:
            record["settlement_date"] = record.get("settled_at") or record.get("created_at") or record.get("voucher_date") or record.get("date")
        if "gross_amount" not in record and (record.get("amount") is not None or record.get("gross_invoice_value") is not None or record.get("deposit_amount") is not None):
            raw_amt = record.get("amount") if record.get("amount") is not None else (record.get("gross_invoice_value") if record.get("gross_invoice_value") is not None else record.get("deposit_amount"))
            if isinstance(raw_amt, (int, str)) and str(raw_amt).isdigit() and int(raw_amt) > 10000:
                record["gross_amount"] = str(Decimal(raw_amt) / Decimal(100))
                if "fee" in record and str(record["fee"]).isdigit() and int(record["fee"]) > 0:
                    record["fee"] = str(Decimal(record["fee"]) / Decimal(100))
                if "tax" in record and str(record["tax"]).isdigit() and int(record["tax"]) > 0:
                    record["tax"] = str(Decimal(record["tax"]) / Decimal(100))
                if "tds_194o" in record and str(record["tds_194o"]).isdigit() and int(record["tds_194o"]) > 0:
                    record["tds_194o"] = str(Decimal(record["tds_194o"]) / Decimal(100))
            else:
                record["gross_amount"] = str(raw_amt)
        if "status" not in record:
            record["status"] = "settled"

        # Ordered list of rules — each returns RuleResult
        rules = [
            self._check_required_fields,
            self._check_transaction_id_format,
            self._check_duplicate_transaction_id,
            self._check_currency,
            self._check_amounts_numeric,
            self._check_amounts_non_negative,
            self._check_net_not_exceeding_gross,
            self._check_amount_arithmetic,
            self._check_settlement_date,
            self._check_payment_method,
            self._check_status,
            self._check_narration_quality,
        ]

        for rule_fn in rules:
            result = rule_fn(record)

            audit_entries.append(AuditLogEntry(
                record_id=record.get("transaction_id", "unknown"),
                action=AuditAction.VALIDATED if result.status == "pass" else AuditAction.QUARANTINED,
                layer=FlaggingLayer.RULES_ENGINE,
                detail=f"Rule {result.rule_id}: {result.status}" + (
                    f" — {result.reason_detail}" if result.reason_detail else ""
                ),
                rule_id=result.rule_id,
                confidence_score=result.confidence,
            ))

            if result.status in ("fail", "ambiguous"):
                return result, audit_entries

        # All rules passed — mark as clean
        if record.get("transaction_id"):
            self._seen_transaction_ids.add(record["transaction_id"])

        final = RuleResult(status="pass", rule_id="ALL_RULES_PASSED", confidence=1.0)
        audit_entries.append(AuditLogEntry(
            record_id=record.get("transaction_id", "unknown"),
            action=AuditAction.VALIDATED,
            layer=FlaggingLayer.RULES_ENGINE,
            detail="All deterministic rules passed",
            rule_id="ALL_RULES_PASSED",
            confidence_score=1.0,
        ))
        return final, audit_entries

    # ========================================================
    # INDIVIDUAL RULES
    # ========================================================

    def _check_required_fields(self, record: dict) -> RuleResult:
        """Rule R001: All required fields must be present and non-empty."""
        required = [
            "transaction_id", "merchant_id", "settlement_date",
            "gross_amount", "currency", "status"
        ]
        for field in required:
            value = record.get(field)
            if value is None or (isinstance(value, str) and value.strip() == ""):
                return RuleResult(
                    status="fail",
                    reason_code=QuarantineReasonCode.MISSING_FIELD,
                    reason_detail=f"Required field '{field}' is missing or empty",
                    rule_id="R001_REQUIRED_FIELDS",
                )
        return RuleResult(status="pass", rule_id="R001_REQUIRED_FIELDS")

    def _check_transaction_id_format(self, record: dict) -> RuleResult:
        """Rule R002: Transaction ID must be alphanumeric with allowed separators."""
        txn_id = record.get("transaction_id", "")
        if not re.match(r'^[a-zA-Z0-9_\-\.]{1,100}$', str(txn_id)):
            return RuleResult(
                status="fail",
                reason_code=QuarantineReasonCode.MISSING_FIELD,
                reason_detail=f"Transaction ID '{txn_id}' has invalid format",
                rule_id="R002_TXN_ID_FORMAT",
            )
        return RuleResult(status="pass", rule_id="R002_TXN_ID_FORMAT")

    def _check_duplicate_transaction_id(self, record: dict) -> RuleResult:
        """Rule R003: Transaction ID must be unique within the batch."""
        txn_id = record.get("transaction_id", "")
        if txn_id in self._seen_transaction_ids:
            return RuleResult(
                status="fail",
                reason_code=QuarantineReasonCode.DUPLICATE_ID,
                reason_detail=f"Duplicate transaction_id '{txn_id}' — first seen earlier in this batch",
                rule_id="R003_DUPLICATE_ID",
            )
        # Don't add to seen yet — only add after ALL rules pass
        return RuleResult(status="pass", rule_id="R003_DUPLICATE_ID")

    def _check_currency(self, record: dict) -> RuleResult:
        """Rule R004: Currency must be in the whitelist."""
        currency = str(record.get("currency", "")).upper().strip()
        if currency not in self._valid_currencies:
            return RuleResult(
                status="fail",
                reason_code=QuarantineReasonCode.INVALID_CURRENCY,
                reason_detail=f"Currency '{currency}' is not in whitelist: {self._valid_currencies}",
                rule_id="R004_CURRENCY_WHITELIST",
            )
        return RuleResult(status="pass", rule_id="R004_CURRENCY_WHITELIST")

    def _check_amounts_numeric(self, record: dict) -> RuleResult:
        """Rule R005: Amount fields must be valid numbers."""
        amount_fields = ["gross_amount", "fee", "tax", "net_amount"]
        for field in amount_fields:
            value = record.get(field)
            if value is None:
                continue  # fee/tax/net_amount may be optional for some records
            try:
                Decimal(str(value))
            except (InvalidOperation, ValueError, TypeError):
                return RuleResult(
                    status="fail",
                    reason_code=QuarantineReasonCode.IMPOSSIBLE_VALUE,
                    reason_detail=f"Field '{field}' value '{value}' is not a valid number",
                    rule_id="R005_NUMERIC_AMOUNTS",
                )
        return RuleResult(status="pass", rule_id="R005_NUMERIC_AMOUNTS")

    def _check_amounts_non_negative(self, record: dict) -> RuleResult:
        """Rule R006: Gross amount, fee, and tax must be non-negative."""
        for field in ["gross_amount", "fee", "tax"]:
            value = record.get(field)
            if value is None:
                continue
            try:
                if Decimal(str(value)) < 0:
                    return RuleResult(
                        status="fail",
                        reason_code=QuarantineReasonCode.IMPOSSIBLE_VALUE,
                        reason_detail=f"Field '{field}' is negative ({value}) — impossible for a settlement",
                        rule_id="R006_NON_NEGATIVE",
                    )
            except (InvalidOperation, ValueError):
                pass  # Already caught by R005
        return RuleResult(status="pass", rule_id="R006_NON_NEGATIVE")

    def _check_net_not_exceeding_gross(self, record: dict) -> RuleResult:
        """Rule R007: Net amount must not exceed gross amount."""
        try:
            gross = Decimal(str(record.get("gross_amount", 0)))
            net = Decimal(str(record.get("net_amount", 0)))
            if net > gross:
                return RuleResult(
                    status="fail",
                    reason_code=QuarantineReasonCode.IMPOSSIBLE_VALUE,
                    reason_detail=f"net_amount ({net}) exceeds gross_amount ({gross}) — impossible",
                    rule_id="R007_NET_LE_GROSS",
                )
        except (InvalidOperation, ValueError):
            pass  # Caught by R005
        return RuleResult(status="pass", rule_id="R007_NET_LE_GROSS")

    def _check_amount_arithmetic(self, record: dict) -> RuleResult:
        """Rule R008: net_amount should approximately equal gross - fee - tax - tds_194o."""
        try:
            if "net_amount" not in record or record.get("net_amount") is None:
                return RuleResult(status="pass", rule_id="R008_AMOUNT_ARITHMETIC")

            gross = Decimal(str(record.get("gross_amount", 0)))
            fee = Decimal(str(record.get("fee", 0)))
            tax = Decimal(str(record.get("tax", 0)))
            tds = Decimal(str(record.get("tds_194o") or record.get("tds_section_194o") or 0))
            net = Decimal(str(record.get("net_amount", 0)))

            expected_net = gross - fee - tax - tds
            delta = abs(net - expected_net)

            if delta > Decimal("1.00"):
                return RuleResult(
                    status="fail",
                    reason_code=QuarantineReasonCode.AMOUNT_MISMATCH,
                    reason_detail=(
                        f"Arithmetic mismatch: gross ({gross}) - fee ({fee}) - tax ({tax}) - tds ({tds}) = "
                        f"{expected_net}, but net_amount is {net} (delta: ₹{delta})"
                    ),
                    rule_id="R008_AMOUNT_ARITHMETIC",
                )
        except (InvalidOperation, ValueError):
            pass
        return RuleResult(status="pass", rule_id="R008_AMOUNT_ARITHMETIC")

    def _check_settlement_date(self, record: dict) -> RuleResult:
        """Rule R009: Settlement date must be a valid date, not in the far future."""
        date_str = record.get("settlement_date")
        if not date_str:
            return RuleResult(status="pass", rule_id="R009_DATE_VALID")  # Caught by R001 if required

        try:
            if isinstance(date_str, date):
                d = date_str
            else:
                s = str(date_str).strip()
                if "T" in s:
                    s = s.split("T")[0]
                # Try common date formats
                for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
                    try:
                        from datetime import datetime as dt
                        d = dt.strptime(s, fmt).date()
                        break
                    except ValueError:
                        continue
                else:
                    return RuleResult(
                        status="fail",
                        reason_code=QuarantineReasonCode.INVALID_DATE,
                        reason_detail=f"Settlement date '{date_str}' is not a recognized date format",
                        rule_id="R009_DATE_VALID",
                    )

            # Check not in far future (>30 days ahead)
            max_future = date.today() + timedelta(days=30)
            if d > max_future:
                return RuleResult(
                    status="fail",
                    reason_code=QuarantineReasonCode.INVALID_DATE,
                    reason_detail=f"Settlement date {d} is more than 30 days in the future",
                    rule_id="R009_DATE_VALID",
                )

            # Check not unreasonably old (>2 years)
            min_past = date.today() - timedelta(days=730)
            if d < min_past:
                return RuleResult(
                    status="fail",
                    reason_code=QuarantineReasonCode.INVALID_DATE,
                    reason_detail=f"Settlement date {d} is more than 2 years in the past",
                    rule_id="R009_DATE_VALID",
                )

        except Exception as e:
            return RuleResult(
                status="fail",
                reason_code=QuarantineReasonCode.INVALID_DATE,
                reason_detail=f"Cannot parse settlement date '{date_str}': {str(e)}",
                rule_id="R009_DATE_VALID",
            )

        return RuleResult(status="pass", rule_id="R009_DATE_VALID")

    def _check_payment_method(self, record: dict) -> RuleResult:
        """Rule R010: Payment method must be a known value (if provided)."""
        method = record.get("payment_method")
        if method is None or str(method).strip() == "":
            return RuleResult(status="pass", rule_id="R010_PAYMENT_METHOD")

        if str(method).upper().strip() not in self._valid_payment_methods:
            # Not a fatal failure — could be ambiguous naming
            return RuleResult(
                status="ambiguous",
                reason_code=QuarantineReasonCode.MALFORMED_NARRATION,
                reason_detail=f"Payment method '{method}' is not a standard value — needs LLM classification",
                rule_id="R010_PAYMENT_METHOD",
                confidence=0.5,
            )
        return RuleResult(status="pass", rule_id="R010_PAYMENT_METHOD")

    def _check_status(self, record: dict) -> RuleResult:
        """Rule R011: Record status must be a known value."""
        status = record.get("status")
        if status is None or str(status).strip() == "":
            return RuleResult(status="pass", rule_id="R011_STATUS")

        if str(status).lower().strip() not in self._valid_statuses:
            return RuleResult(
                status="ambiguous",
                reason_code=QuarantineReasonCode.MALFORMED_NARRATION,
                reason_detail=f"Status '{status}' is not a standard value — needs LLM interpretation",
                rule_id="R011_STATUS",
                confidence=0.5,
            )
        return RuleResult(status="pass", rule_id="R011_STATUS")

    def _check_narration_quality(self, record: dict) -> RuleResult:
        """Rule R012: Check if the narration is too garbled to be useful."""
        narration = record.get("narration", "")
        if not narration or not isinstance(narration, str):
            return RuleResult(status="pass", rule_id="R012_NARRATION_QUALITY")

        narration = narration.strip()

        # Check for garbled/encoding issues
        non_printable_ratio = sum(1 for c in narration if not c.isprintable()) / max(len(narration), 1)
        if non_printable_ratio > 0.3:
            return RuleResult(
                status="fail",
                reason_code=QuarantineReasonCode.MALFORMED_NARRATION,
                reason_detail=f"Narration is {non_printable_ratio:.0%} non-printable characters — likely encoding corruption",
                rule_id="R012_NARRATION_QUALITY",
            )

        # Check for suspiciously short narration with unstructured data elsewhere
        if len(narration) > 10 and not any(c.isdigit() for c in narration):
            # Pure text narration with no amounts/IDs — might need LLM to extract meaning
            return RuleResult(
                status="ambiguous",
                reason_code=QuarantineReasonCode.MALFORMED_NARRATION,
                reason_detail="Narration is unstructured text — may need LLM extraction to classify transaction type",
                rule_id="R012_NARRATION_QUALITY",
                confidence=0.6,
            )

        return RuleResult(status="pass", rule_id="R012_NARRATION_QUALITY")
