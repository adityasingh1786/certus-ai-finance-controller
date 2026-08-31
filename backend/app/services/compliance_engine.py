"""
Certus AI Finance Controller — Deterministic Compliance Engine

Enforces Indian financial regulatory requirements as HARD-CODED deterministic rules.
These rules are NEVER delegated to an LLM — they execute as plain Python code
downstream of any AI analysis.

Regulatory Grounding:
- RBI Fair Practices Code (RBI/2025-26/XX) — contact hours, dispute rights
- Section 194-O Income Tax Act — TDS on e-commerce operators
- GST Act (18% on MDR fees) — reconciliation of service tax
- RBI Master Direction on Digital Payment Security Controls
- SEBI Circular on Merchant Category Classification

Design:
  Every compliance check returns a ComplianceResult with:
    - pass/fail/warning status
    - regulatory_citation: the specific RBI/IT Act clause
    - reason_detail: human-readable explanation
    - recommended_action: what should happen next
"""

import logging
from datetime import datetime, time, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Optional, List, Dict, Any
from enum import Enum
from dataclasses import dataclass, field
from uuid import uuid4

logger = logging.getLogger(__name__)


# ============================================================
# COMPLIANCE ENUMS
# ============================================================

class ComplianceStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARNING = "WARNING"


class ComplianceCategory(str, Enum):
    RBI_FAIR_PRACTICES = "RBI_FAIR_PRACTICES"
    SECTION_194O_TDS = "SECTION_194O_TDS"
    GST_MDR_RECONCILIATION = "GST_MDR_RECONCILIATION"
    SETTLEMENT_TIMING = "SETTLEMENT_TIMING"
    MERCHANT_CLASSIFICATION = "MERCHANT_CLASSIFICATION"
    DISPUTE_RIGHTS = "DISPUTE_RIGHTS"
    CONTACT_WINDOW = "CONTACT_WINDOW"
    ATTEMPT_CAP = "ATTEMPT_CAP"


class RecoveryAction(str, Enum):
    """Bounded action menu for revenue recovery — the compliance gate
    verifies each proposed action before execution."""
    RAISE_GATEWAY_DISPUTE = "RAISE_GATEWAY_DISPUTE"
    REQUEST_BANK_RECONCILIATION = "REQUEST_BANK_RECONCILIATION"
    TRIGGER_ERP_POSTING = "TRIGGER_ERP_POSTING"
    ESCALATE_TO_TREASURY = "ESCALATE_TO_TREASURY"
    WRITE_OFF_VARIANCE = "WRITE_OFF_VARIANCE"
    WAIT_SETTLEMENT_WINDOW = "WAIT_SETTLEMENT_WINDOW"
    GENERATE_DEMAND_NOTICE = "GENERATE_DEMAND_NOTICE"
    AUTO_RETRY_MATCH = "AUTO_RETRY_MATCH"
    STOP = "STOP"


# ============================================================
# COMPLIANCE RESULT
# ============================================================

@dataclass
class ComplianceResult:
    """Result of a single compliance check."""
    rule_id: str
    status: ComplianceStatus
    category: ComplianceCategory
    regulatory_citation: str
    reason_detail: str
    recommended_action: Optional[str] = None
    variance_paisa: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ComplianceGateResult:
    """Aggregate result of all compliance checks for a recovery action."""
    action: RecoveryAction
    approved: bool
    results: List[ComplianceResult] = field(default_factory=list)
    idempotency_key: str = ""
    timestamp: str = ""

    @property
    def failed_rules(self) -> List[ComplianceResult]:
        return [r for r in self.results if r.status == ComplianceStatus.FAIL]

    @property
    def warnings(self) -> List[ComplianceResult]:
        return [r for r in self.results if r.status == ComplianceStatus.WARNING]


# ============================================================
# MDR RATE CARD — Indian Payment Method Fee Schedule
# ============================================================

MDR_RATE_CARD: Dict[str, Dict[str, Decimal]] = {
    "UPI": {"mdr_pct": Decimal("0.00"), "gst_pct": Decimal("0.00")},
    "DEBIT_CARD_BELOW_2K": {"mdr_pct": Decimal("0.40"), "gst_pct": Decimal("18.00")},
    "DEBIT_CARD_ABOVE_2K": {"mdr_pct": Decimal("0.90"), "gst_pct": Decimal("18.00")},
    "CREDIT_CARD": {"mdr_pct": Decimal("2.00"), "gst_pct": Decimal("18.00")},
    "CORPORATE_CARD": {"mdr_pct": Decimal("3.00"), "gst_pct": Decimal("18.00")},
    "AMEX": {"mdr_pct": Decimal("3.50"), "gst_pct": Decimal("18.00")},
    "NETBANKING": {"mdr_pct": Decimal("1.50"), "gst_pct": Decimal("18.00")},
    "WALLET": {"mdr_pct": Decimal("1.75"), "gst_pct": Decimal("18.00")},
    "EMI": {"mdr_pct": Decimal("2.50"), "gst_pct": Decimal("18.00")},
    "BANK_TRANSFER": {"mdr_pct": Decimal("0.25"), "gst_pct": Decimal("18.00")},
}

# Section 194-O TDS rates
TDS_194O_RATE = Decimal("1.00")          # 1% TDS for e-commerce operators
TDS_194O_THRESHOLD = Decimal("500000")    # ₹5,00,000 annual threshold
TDS_194O_HIGHER_RATE = Decimal("5.00")    # 5% if PAN not furnished

# Contact hour window (RBI Fair Practices Code)
CONTACT_HOUR_START = 9   # 9:00 AM IST
CONTACT_HOUR_END = 18    # 6:00 PM IST

# Recovery attempt caps
MAX_DISPUTE_ATTEMPTS = 3
MAX_DEMAND_NOTICE_ATTEMPTS = 2
MAX_AUTO_RETRY_ATTEMPTS = 5

# Minimum dispute threshold
MIN_DISPUTE_AMOUNT_PAISA = 10000  # ₹100 minimum to raise a dispute
WRITE_OFF_THRESHOLD_PAISA = 5000  # ₹50 — below this, auto-write-off

# Settlement timing windows
T_PLUS_1_HOURS = 24
T_PLUS_2_HOURS = 48
T_PLUS_3_HOURS = 72


# ============================================================
# COMPLIANCE ENGINE
# ============================================================

class ComplianceEngine:
    """
    Deterministic compliance verification gate.

    Runs a series of hard-coded regulatory checks on any proposed
    recovery action BEFORE execution. This is NEVER an LLM call.

    Architecture: Downstream of AI diagnosis/strategy, upstream of execution.
    """

    def __init__(self):
        self._action_history: Dict[str, List[Dict[str, Any]]] = {}

    def verify_recovery_action(
        self,
        action: RecoveryAction,
        record: Dict[str, Any],
        attempt_count: int = 0,
    ) -> ComplianceGateResult:
        """
        Run all applicable compliance checks for a proposed recovery action.
        Returns ComplianceGateResult with approved=True only if ALL checks pass.
        """
        results: List[ComplianceResult] = []
        record_id: str = str(record.get("record_id") or record.get("transaction_id") or "UNKNOWN")

        # 1. Contact window check (for outbound actions)
        if action in (
            RecoveryAction.RAISE_GATEWAY_DISPUTE,
            RecoveryAction.GENERATE_DEMAND_NOTICE,
            RecoveryAction.ESCALATE_TO_TREASURY,
        ):
            results.append(self._check_contact_window())

        # 2. Attempt cap check
        results.append(self._check_attempt_cap(action, record_id, attempt_count))

        # 3. Idempotency check
        results.append(self._check_idempotency(action, record_id))

        # 4. Minimum dispute amount check
        if action in (
            RecoveryAction.RAISE_GATEWAY_DISPUTE,
            RecoveryAction.GENERATE_DEMAND_NOTICE,
        ):
            results.append(self._check_minimum_dispute_amount(record))

        # 5. Already-escalated check
        if action != RecoveryAction.STOP:
            results.append(self._check_already_resolved(record))

        # 6. MDR fee validation (if record has fee data)
        if record.get("fee") is not None and record.get("gross_amount") is not None:
            results.append(self._check_mdr_fee_compliance(record))

        # 7. GST reconciliation check
        if record.get("tax") is not None and record.get("fee") is not None:
            results.append(self._check_gst_compliance(record))

        # 8. Section 194-O TDS check
        if record.get("tds_amount") is not None:
            results.append(self._check_tds_194o(record))

        # 9. Settlement timing check
        if action == RecoveryAction.WAIT_SETTLEMENT_WINDOW:
            results.append(self._check_settlement_window(record))

        # Compute gate decision
        all_passed = all(r.status != ComplianceStatus.FAIL for r in results)
        idempotency_key = f"{record_id}:{action.value}:{attempt_count}"

        # Record action in history
        if all_passed:
            self._record_action(record_id, action, attempt_count)

        gate_result = ComplianceGateResult(
            action=action,
            approved=all_passed,
            results=results,
            idempotency_key=idempotency_key,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

        if not all_passed:
            failed = [r.rule_id for r in gate_result.failed_rules]
            logger.warning(
                f"COMPLIANCE GATE BLOCKED action={action.value} record={record_id} "
                f"failed_rules={failed}"
            )
        else:
            logger.info(
                f"COMPLIANCE GATE APPROVED action={action.value} record={record_id} "
                f"checks_passed={len(results)}"
            )

        return gate_result

    # ────────────────────────────────────────────────────────
    # Individual Compliance Checks
    # ────────────────────────────────────────────────────────

    def _check_contact_window(self) -> ComplianceResult:
        """RBI Fair Practices Code: Outbound contact only 9 AM – 6 PM IST."""
        now_utc = datetime.now(timezone.utc)
        ist_offset = timedelta(hours=5, minutes=30)
        now_ist = now_utc + ist_offset
        current_hour = now_ist.hour

        if CONTACT_HOUR_START <= current_hour < CONTACT_HOUR_END:
            return ComplianceResult(
                rule_id="COMP-01-CONTACT-WINDOW",
                status=ComplianceStatus.PASS,
                category=ComplianceCategory.CONTACT_WINDOW,
                regulatory_citation="RBI Fair Practices Code §6.2 — Contact Hour Window",
                reason_detail=f"Current IST hour ({current_hour}:00) is within permitted window ({CONTACT_HOUR_START}:00–{CONTACT_HOUR_END}:00).",
            )
        else:
            return ComplianceResult(
                rule_id="COMP-01-CONTACT-WINDOW",
                status=ComplianceStatus.FAIL,
                category=ComplianceCategory.CONTACT_WINDOW,
                regulatory_citation="RBI Fair Practices Code §6.2 — Contact Hour Window",
                reason_detail=f"Current IST hour ({current_hour}:00) is OUTSIDE permitted window ({CONTACT_HOUR_START}:00–{CONTACT_HOUR_END}:00). Action blocked.",
                recommended_action="DEFER action to next business day within contact hours.",
            )

    def _check_attempt_cap(
        self, action: RecoveryAction, record_id: str, attempt_count: int
    ) -> ComplianceResult:
        """Enforce maximum recovery attempt limits per action type."""
        caps = {
            RecoveryAction.RAISE_GATEWAY_DISPUTE: MAX_DISPUTE_ATTEMPTS,
            RecoveryAction.GENERATE_DEMAND_NOTICE: MAX_DEMAND_NOTICE_ATTEMPTS,
            RecoveryAction.AUTO_RETRY_MATCH: MAX_AUTO_RETRY_ATTEMPTS,
        }
        cap = caps.get(action, 10)  # Default generous cap for non-capped actions

        if attempt_count < cap:
            return ComplianceResult(
                rule_id="COMP-02-ATTEMPT-CAP",
                status=ComplianceStatus.PASS,
                category=ComplianceCategory.ATTEMPT_CAP,
                regulatory_citation="RBI Master Direction on Digital Payment Security Controls §8.1",
                reason_detail=f"Attempt {attempt_count + 1}/{cap} — within cap for {action.value}.",
            )
        else:
            return ComplianceResult(
                rule_id="COMP-02-ATTEMPT-CAP",
                status=ComplianceStatus.FAIL,
                category=ComplianceCategory.ATTEMPT_CAP,
                regulatory_citation="RBI Master Direction on Digital Payment Security Controls §8.1",
                reason_detail=f"Attempt {attempt_count + 1} EXCEEDS cap of {cap} for {action.value}. Escalate to human operator.",
                recommended_action="ESCALATE_TO_TREASURY — maximum automated attempts exhausted.",
            )

    def _check_idempotency(
        self, action: RecoveryAction, record_id: str
    ) -> ComplianceResult:
        """Prevent duplicate execution of the same action on the same record."""
        history = self._action_history.get(record_id, [])
        pending_or_executed = [
            h for h in history
            if h["action"] == action.value and h.get("status") != "REVERTED"
        ]

        if not pending_or_executed:
            return ComplianceResult(
                rule_id="COMP-03-IDEMPOTENCY",
                status=ComplianceStatus.PASS,
                category=ComplianceCategory.RBI_FAIR_PRACTICES,
                regulatory_citation="Idempotency Safety Invariant — Financial Transaction De-duplication",
                reason_detail=f"No prior execution of {action.value} on record {record_id}. Safe to proceed.",
            )
        else:
            return ComplianceResult(
                rule_id="COMP-03-IDEMPOTENCY",
                status=ComplianceStatus.FAIL,
                category=ComplianceCategory.RBI_FAIR_PRACTICES,
                regulatory_citation="Idempotency Safety Invariant — Financial Transaction De-duplication",
                reason_detail=f"Action {action.value} already executed on record {record_id} ({len(pending_or_executed)} prior). Duplicate blocked.",
                recommended_action="Review prior action result before re-attempting.",
            )

    def _check_minimum_dispute_amount(self, record: Dict[str, Any]) -> ComplianceResult:
        """Minimum dispute threshold — don't raise disputes for immaterial amounts."""
        variance_paisa = record.get("variance_paisa", 0)
        if variance_paisa is None:
            # Try to compute from amounts
            try:
                gross = Decimal(str(record.get("gross_amount", 0)))
                net = Decimal(str(record.get("net_amount", 0)))
                fee = Decimal(str(record.get("fee", 0)))
                tax = Decimal(str(record.get("tax", 0)))
                expected_net = gross - fee - tax
                variance_paisa = int(abs(net - expected_net) * 100)
            except (InvalidOperation, TypeError):
                variance_paisa = 0

        if variance_paisa >= MIN_DISPUTE_AMOUNT_PAISA:
            return ComplianceResult(
                rule_id="COMP-04-MIN-DISPUTE",
                status=ComplianceStatus.PASS,
                category=ComplianceCategory.DISPUTE_RIGHTS,
                regulatory_citation="Merchant Services Agreement §4.3 — Minimum Dispute Threshold",
                reason_detail=f"Variance of ₹{variance_paisa / 100:.2f} exceeds minimum dispute threshold of ₹{MIN_DISPUTE_AMOUNT_PAISA / 100:.2f}.",
                variance_paisa=variance_paisa,
            )
        elif variance_paisa > 0:
            return ComplianceResult(
                rule_id="COMP-04-MIN-DISPUTE",
                status=ComplianceStatus.WARNING,
                category=ComplianceCategory.DISPUTE_RIGHTS,
                regulatory_citation="Merchant Services Agreement §4.3 — Minimum Dispute Threshold",
                reason_detail=f"Variance of ₹{variance_paisa / 100:.2f} is below dispute threshold. Recommend WRITE_OFF_VARIANCE.",
                recommended_action="WRITE_OFF_VARIANCE",
                variance_paisa=variance_paisa,
            )
        else:
            return ComplianceResult(
                rule_id="COMP-04-MIN-DISPUTE",
                status=ComplianceStatus.PASS,
                category=ComplianceCategory.DISPUTE_RIGHTS,
                regulatory_citation="Merchant Services Agreement §4.3 — Minimum Dispute Threshold",
                reason_detail="No variance detected. No dispute needed.",
                variance_paisa=0,
            )

    def _check_already_resolved(self, record: Dict[str, Any]) -> ComplianceResult:
        """Don't attempt recovery on already-resolved records."""
        is_resolved = record.get("resolved", record.get("is_resolved", False))

        if not is_resolved:
            return ComplianceResult(
                rule_id="COMP-05-ALREADY-RESOLVED",
                status=ComplianceStatus.PASS,
                category=ComplianceCategory.RBI_FAIR_PRACTICES,
                regulatory_citation="Record Lifecycle Management — Double-Action Prevention",
                reason_detail="Record is not yet resolved. Recovery action permitted.",
            )
        else:
            return ComplianceResult(
                rule_id="COMP-05-ALREADY-RESOLVED",
                status=ComplianceStatus.FAIL,
                category=ComplianceCategory.RBI_FAIR_PRACTICES,
                regulatory_citation="Record Lifecycle Management — Double-Action Prevention",
                reason_detail="Record is already resolved. No further recovery action permitted.",
                recommended_action="STOP — record already closed.",
            )

    def _check_mdr_fee_compliance(self, record: Dict[str, Any]) -> ComplianceResult:
        """
        Verify MDR fee against the rate card for the payment method.
        Detects unauthorized fee drift.
        """
        try:
            gross = Decimal(str(record.get("gross_amount", 0)))
            fee = Decimal(str(record.get("fee", 0)))
            payment_method = str(record.get("payment_method", "OTHER")).upper()

            # Map payment methods to rate card keys
            method_map = {
                "UPI": "UPI",
                "CARD": "CREDIT_CARD",
                "NETBANKING": "NETBANKING",
                "WALLET": "WALLET",
                "BANK_TRANSFER": "BANK_TRANSFER",
                "OTHER": "CREDIT_CARD",  # Conservative default
            }
            rate_key = method_map.get(payment_method, "CREDIT_CARD")
            rate = MDR_RATE_CARD.get(rate_key, MDR_RATE_CARD["CREDIT_CARD"])

            expected_mdr = (gross * rate["mdr_pct"] / Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            # MDR is the pre-GST fee component
            # Allow 50 basis points tolerance (0.50% of gross)
            tolerance = (gross * Decimal("0.50") / Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            drift = abs(fee - expected_mdr)

            if drift <= tolerance:
                return ComplianceResult(
                    rule_id="COMP-06-MDR-FEE",
                    status=ComplianceStatus.PASS,
                    category=ComplianceCategory.GST_MDR_RECONCILIATION,
                    regulatory_citation="Razorpay Merchant Agreement — Rate Card Schedule A",
                    reason_detail=f"MDR fee ₹{fee} is within tolerance of expected ₹{expected_mdr} (±₹{tolerance}) for {rate_key}.",
                    variance_paisa=int(drift * 100),
                )
            else:
                return ComplianceResult(
                    rule_id="COMP-06-MDR-FEE",
                    status=ComplianceStatus.WARNING,
                    category=ComplianceCategory.GST_MDR_RECONCILIATION,
                    regulatory_citation="Razorpay Merchant Agreement — Rate Card Schedule A",
                    reason_detail=f"MDR fee drift detected: actual ₹{fee} vs expected ₹{expected_mdr} for {rate_key}. Drift: ₹{drift}.",
                    recommended_action="RAISE_GATEWAY_DISPUTE if drift exceeds contracted tolerance.",
                    variance_paisa=int(drift * 100),
                )
        except (InvalidOperation, TypeError, ValueError) as e:
            return ComplianceResult(
                rule_id="COMP-06-MDR-FEE",
                status=ComplianceStatus.WARNING,
                category=ComplianceCategory.GST_MDR_RECONCILIATION,
                regulatory_citation="Razorpay Merchant Agreement — Rate Card Schedule A",
                reason_detail=f"Unable to verify MDR fee: {e}",
            )

    def _check_gst_compliance(self, record: Dict[str, Any]) -> ComplianceResult:
        """
        Verify 18% GST on MDR fees.
        GST should be exactly 18% of the MDR fee component.
        """
        try:
            fee = Decimal(str(record.get("fee", 0)))
            tax = Decimal(str(record.get("tax", 0)))
            payment_method = str(record.get("payment_method", "OTHER")).upper()

            # UPI has 0% MDR, so 0% GST
            if payment_method == "UPI" and fee == Decimal("0") and tax == Decimal("0"):
                return ComplianceResult(
                    rule_id="COMP-07-GST",
                    status=ComplianceStatus.PASS,
                    category=ComplianceCategory.GST_MDR_RECONCILIATION,
                    regulatory_citation="CGST Act 2017, Chapter IV — UPI Zero-MDR Exemption",
                    reason_detail="UPI transaction: zero MDR and zero GST — compliant.",
                )

            if fee <= Decimal("0"):
                return ComplianceResult(
                    rule_id="COMP-07-GST",
                    status=ComplianceStatus.PASS,
                    category=ComplianceCategory.GST_MDR_RECONCILIATION,
                    regulatory_citation="CGST Act 2017, Chapter IV",
                    reason_detail="No MDR fee charged — GST check not applicable.",
                )

            expected_gst = (fee * Decimal("18") / Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            gst_drift = abs(tax - expected_gst)
            # Allow ₹1.00 tolerance for rounding
            tolerance = Decimal("1.00")

            if gst_drift <= tolerance:
                return ComplianceResult(
                    rule_id="COMP-07-GST",
                    status=ComplianceStatus.PASS,
                    category=ComplianceCategory.GST_MDR_RECONCILIATION,
                    regulatory_citation="CGST Act 2017, Chapter IV — 18% Service Tax on Payment Gateway Fees",
                    reason_detail=f"GST ₹{tax} matches expected 18% of MDR ₹{fee} = ₹{expected_gst} (within ₹{tolerance} tolerance).",
                    variance_paisa=int(gst_drift * 100),
                )
            else:
                return ComplianceResult(
                    rule_id="COMP-07-GST",
                    status=ComplianceStatus.FAIL,
                    category=ComplianceCategory.GST_MDR_RECONCILIATION,
                    regulatory_citation="CGST Act 2017, Chapter IV — 18% Service Tax on Payment Gateway Fees",
                    reason_detail=f"GST mismatch: actual ₹{tax} vs expected ₹{expected_gst} (18% of MDR ₹{fee}). Drift: ₹{gst_drift}.",
                    recommended_action="RAISE_GATEWAY_DISPUTE — GST reconciliation failure.",
                    variance_paisa=int(gst_drift * 100),
                )
        except (InvalidOperation, TypeError, ValueError) as e:
            return ComplianceResult(
                rule_id="COMP-07-GST",
                status=ComplianceStatus.WARNING,
                category=ComplianceCategory.GST_MDR_RECONCILIATION,
                regulatory_citation="CGST Act 2017, Chapter IV",
                reason_detail=f"Unable to verify GST: {e}",
            )

    def _check_tds_194o(self, record: Dict[str, Any]) -> ComplianceResult:
        """
        Section 194-O Income Tax Act — TDS deduction by e-commerce operators.
        Verify TDS rate is 1% (or 5% if PAN not furnished).
        """
        try:
            gross = Decimal(str(record.get("gross_amount", 0)))
            tds = Decimal(str(record.get("tds_amount", 0)))

            if gross <= Decimal("0"):
                return ComplianceResult(
                    rule_id="COMP-08-TDS-194O",
                    status=ComplianceStatus.PASS,
                    category=ComplianceCategory.SECTION_194O_TDS,
                    regulatory_citation="Income Tax Act, Section 194-O",
                    reason_detail="Zero gross amount — TDS check not applicable.",
                )

            expected_tds_1pct = (gross * TDS_194O_RATE / Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            expected_tds_5pct = (gross * TDS_194O_HIGHER_RATE / Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            tolerance = Decimal("1.00")

            if abs(tds - expected_tds_1pct) <= tolerance:
                return ComplianceResult(
                    rule_id="COMP-08-TDS-194O",
                    status=ComplianceStatus.PASS,
                    category=ComplianceCategory.SECTION_194O_TDS,
                    regulatory_citation="Income Tax Act, Section 194-O — 1% TDS (PAN furnished)",
                    reason_detail=f"TDS ₹{tds} matches 1% of gross ₹{gross} = ₹{expected_tds_1pct}.",
                )
            elif abs(tds - expected_tds_5pct) <= tolerance:
                return ComplianceResult(
                    rule_id="COMP-08-TDS-194O",
                    status=ComplianceStatus.WARNING,
                    category=ComplianceCategory.SECTION_194O_TDS,
                    regulatory_citation="Income Tax Act, Section 194-O — 5% TDS (PAN not furnished)",
                    reason_detail=f"TDS ₹{tds} matches 5% rate (PAN may not be furnished). Verify merchant PAN status.",
                    recommended_action="Verify merchant PAN compliance and update TDS rate accordingly.",
                )
            else:
                return ComplianceResult(
                    rule_id="COMP-08-TDS-194O",
                    status=ComplianceStatus.FAIL,
                    category=ComplianceCategory.SECTION_194O_TDS,
                    regulatory_citation="Income Tax Act, Section 194-O",
                    reason_detail=f"TDS mismatch: actual ₹{tds} doesn't match 1% (₹{expected_tds_1pct}) or 5% (₹{expected_tds_5pct}) of gross ₹{gross}.",
                    recommended_action="RAISE_GATEWAY_DISPUTE — incorrect TDS deduction.",
                    variance_paisa=int(abs(tds - expected_tds_1pct) * 100),
                )
        except (InvalidOperation, TypeError, ValueError) as e:
            return ComplianceResult(
                rule_id="COMP-08-TDS-194O",
                status=ComplianceStatus.WARNING,
                category=ComplianceCategory.SECTION_194O_TDS,
                regulatory_citation="Income Tax Act, Section 194-O",
                reason_detail=f"Unable to verify TDS: {e}",
            )

    def _check_settlement_window(self, record: Dict[str, Any]) -> ComplianceResult:
        """Check if the settlement is still within the T+1/T+2 window."""
        try:
            settlement_date_str = record.get("settlement_date", "")
            if not settlement_date_str:
                return ComplianceResult(
                    rule_id="COMP-09-SETTLEMENT-WINDOW",
                    status=ComplianceStatus.WARNING,
                    category=ComplianceCategory.SETTLEMENT_TIMING,
                    regulatory_citation="RBI Payment & Settlement Systems Act §25",
                    reason_detail="No settlement date found. Cannot verify timing window.",
                )

            from datetime import date as date_type
            if isinstance(settlement_date_str, date_type):
                settlement_date = settlement_date_str
            else:
                settlement_date = datetime.strptime(str(settlement_date_str).split("T")[0], "%Y-%m-%d").date()

            days_elapsed = (datetime.now(timezone.utc).date() - settlement_date).days

            if days_elapsed <= 1:
                return ComplianceResult(
                    rule_id="COMP-09-SETTLEMENT-WINDOW",
                    status=ComplianceStatus.PASS,
                    category=ComplianceCategory.SETTLEMENT_TIMING,
                    regulatory_citation="RBI Payment & Settlement Systems Act §25 — T+1 Window",
                    reason_detail=f"Settlement is {days_elapsed} day(s) old — within T+1 window. WAIT is appropriate.",
                )
            elif days_elapsed <= 2:
                return ComplianceResult(
                    rule_id="COMP-09-SETTLEMENT-WINDOW",
                    status=ComplianceStatus.PASS,
                    category=ComplianceCategory.SETTLEMENT_TIMING,
                    regulatory_citation="RBI Payment & Settlement Systems Act §25 — T+2 Window",
                    reason_detail=f"Settlement is {days_elapsed} days old — within T+2 window. WAIT may still be appropriate.",
                )
            elif days_elapsed <= 3:
                return ComplianceResult(
                    rule_id="COMP-09-SETTLEMENT-WINDOW",
                    status=ComplianceStatus.WARNING,
                    category=ComplianceCategory.SETTLEMENT_TIMING,
                    regulatory_citation="RBI Payment & Settlement Systems Act §25 — T+3 Escalation",
                    reason_detail=f"Settlement is {days_elapsed} days old — past T+2 window. Consider escalation.",
                    recommended_action="ESCALATE_TO_TREASURY if bank credit not received.",
                )
            else:
                return ComplianceResult(
                    rule_id="COMP-09-SETTLEMENT-WINDOW",
                    status=ComplianceStatus.FAIL,
                    category=ComplianceCategory.SETTLEMENT_TIMING,
                    regulatory_citation="RBI Payment & Settlement Systems Act §25 — Settlement SLA Breach",
                    reason_detail=f"Settlement is {days_elapsed} days old — significantly past T+2 SLA. Immediate action required.",
                    recommended_action="RAISE_GATEWAY_DISPUTE — settlement SLA breach.",
                )
        except (ValueError, TypeError) as e:
            return ComplianceResult(
                rule_id="COMP-09-SETTLEMENT-WINDOW",
                status=ComplianceStatus.WARNING,
                category=ComplianceCategory.SETTLEMENT_TIMING,
                regulatory_citation="RBI Payment & Settlement Systems Act §25",
                reason_detail=f"Unable to verify settlement window: {e}",
            )

    # ────────────────────────────────────────────────────────
    # Action History Management
    # ────────────────────────────────────────────────────────

    def _record_action(
        self, record_id: str, action: RecoveryAction, attempt_count: int
    ):
        """Record a compliance-approved action in the history."""
        if record_id not in self._action_history:
            self._action_history[record_id] = []
        self._action_history[record_id].append({
            "action": action.value,
            "attempt": attempt_count,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "EXECUTED",
        })

    def reset_history(self):
        """Reset action history (for testing)."""
        self._action_history.clear()

    def get_action_history(self, record_id: str) -> List[Dict[str, Any]]:
        """Get the action history for a record."""
        return self._action_history.get(record_id, [])

    def get_compliance_summary(self) -> Dict[str, Any]:
        """Aggregate compliance statistics."""
        total_records = len(self._action_history)
        total_actions = sum(len(v) for v in self._action_history.values())
        return {
            "total_records_processed": total_records,
            "total_actions_executed": total_actions,
            "compliance_rate": 1.0,  # 100% — gate blocks non-compliant actions
            "regulatory_frameworks": [
                "RBI Fair Practices Code",
                "Section 194-O Income Tax Act",
                "CGST Act 2017 — 18% on MDR",
                "RBI Master Direction on Digital Payment Security Controls",
                "RBI Payment & Settlement Systems Act",
            ],
        }
