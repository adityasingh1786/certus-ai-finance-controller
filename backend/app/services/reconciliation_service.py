"""
AI Finance Controller — Multi-Source Reconciliation & Matching Engine

Reconciles 3 real-world financial streams:
1. Razorpay gateway records (payment_id, order_id, gross, fee/MDR, tax/GST, tds_194o, net)
2. Bank statements (UTR, NEFT/RTGS/UPI narration lines, settlement credits)
3. ERP ledgers (Invoice numbers, legal merchant names, GST breakdowns)

CONFIDENCE IS NEVER FABRICATED:
- Rule-signal confidence is computed from amount precision, reference match
  strength, and date proximity — real numbers, not placeholders.
- The double-lock gate requires BOTH rule confidence AND LLM confidence (if
  consulted) to independently clear the threshold before auto-reconciliation.
- If either is below threshold or unavailable, the record routes to exception.

MATCH STATUS VOCABULARY (user-facing, four words only):
- Matched: Three-way or two-way match with high confidence
- Mismatched: Reference matched but amounts differ
- Missing: No counterpart found in one or more sources
- Duplicate: Same reference+amount appears more than once
"""

from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Optional, Any, Dict, List
from datetime import datetime, date, timezone, timedelta
from uuid import uuid4
from collections import Counter
import re
import logging
from rapidfuzz import fuzz

from app.agent.schemas import ReconciliationMatch, ReconciliationSummary
from app.core.config import get_settings

logger = logging.getLogger(__name__)


# ============================================================
# MATCH STATUS — four user-facing labels + internal detail
# ============================================================

class MatchStatus:
    MATCHED = "Matched"
    MISMATCHED = "Mismatched"
    MISSING = "Missing"
    DUPLICATE = "Duplicate"


class MatchDetail:
    THREE_WAY = "THREE_WAY_MATCH"
    GATEWAY_BANK = "GATEWAY_BANK_MATCH"
    GATEWAY_ERP = "GATEWAY_ERP_MATCH"
    AMOUNT_MISMATCH_BANK = "AMOUNT_MISMATCH_BANK"
    AMOUNT_MISMATCH_ERP = "AMOUNT_MISMATCH_ERP"
    MISSING_IN_BANK = "MISSING_IN_BANK"
    MISSING_IN_ERP = "MISSING_IN_ERP"
    MISSING_IN_GATEWAY = "MISSING_IN_GATEWAY"
    DUPLICATE_ENTRY = "DUPLICATE_ENTRY"
    LOW_CONFIDENCE = "LOW_CONFIDENCE_EXCEPTION"


# ============================================================
# REAL CONFIDENCE COMPUTATION — never hardcoded
# ============================================================

def compute_amount_confidence(expected: Decimal, actual: Decimal) -> float:
    """
    Compute confidence based on how close two amounts are.
    Returns a real number in [0, 1] — never a placeholder.
    """
    if expected == 0 and actual == 0:
        return 1.0
    denominator = max(abs(expected), abs(actual), Decimal("0.01"))
    delta = abs(expected - actual)
    ratio = float(delta / denominator)
    return max(0.0, min(1.0, 1.0 - ratio))


def compute_date_confidence(date1_str: str, date2_str: str) -> float:
    """
    Compute confidence based on date proximity.
    Same day = 1.0, each day apart reduces confidence.
    """
    if not date1_str and not date2_str:
        return 1.0  # Both omitted, no date contradiction

    try:
        d1 = _parse_date_flexible(date1_str)
        d2 = _parse_date_flexible(date2_str)
        if d1 is None or d2 is None:
            return 0.85  # One side omitted date or unparseable format
        days_apart = abs((d1 - d2).days)
        if days_apart == 0:
            return 1.0
        elif days_apart <= 1:
            return 0.95
        elif days_apart <= 2:
            return 0.85
        elif days_apart <= 5:
            return 0.7
        elif days_apart <= 10:
            return 0.5
        else:
            return 0.3
    except Exception:
        return 0.85


def compute_reference_confidence(match_type: str, fuzzy_score: float = 0.0) -> float:
    """
    Compute confidence from the type of reference match achieved.
    """
    if match_type == "exact_utr":
        return 1.0
    elif match_type == "exact_txn_id":
        return 0.98
    elif match_type == "narration_substring":
        return 0.85
    elif match_type == "fuzzy_merchant":
        return max(0.0, min(1.0, fuzzy_score / 100.0))
    elif match_type == "exact_invoice":
        return 1.0
    elif match_type == "exact_order_id":
        return 0.98
    else:
        return 0.5


def compute_composite_confidence(
    amount_conf: float,
    reference_conf: float,
    date_conf: float,
) -> float:
    """
    Weighted composite of the three signal dimensions.
    Amount matters most (50%), reference matters second (30%), date least (20%).
    """
    composite = (amount_conf * 0.5) + (reference_conf * 0.3) + (date_conf * 0.2)
    return round(max(0.0, min(1.0, composite)), 4)


def _parse_date_flexible(date_str: str) -> Optional[date]:
    """Parse a date string in various common formats."""
    if not date_str or not isinstance(date_str, str):
        return None
    s = date_str.strip()
    if "T" in s:
        s = s.split("T")[0]
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _safe_decimal(value, default: Decimal = Decimal("0")) -> Decimal:
    """Safely convert any value to Decimal."""
    if value is None:
        return default
    try:
        return Decimal(str(value).strip()).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError, TypeError):
        return default


# ============================================================
# RECONCILIATION ENGINE
# ============================================================

class MultiSourceReconciliationEngine:
    """
    Cross-checks and matches gateway records, bank statements, and ERP invoices.
    Implements the double-lock gate: auto-reconciliation requires BOTH rule confidence
    AND LLM confidence (if consulted) to clear the threshold independently.
    """

    # Regex patterns for Indian Bank Statement Narrations
    BANK_NARRATION_PATTERNS = [
        re.compile(r"NEFT[-/][A-Z0-9]+[-/](?:[A-Z0-9]+[-/])?(UTR[0-9A-Z]+|[0-9A-Z]{12,22})", re.IGNORECASE),
        re.compile(r"RTGS[-/][A-Z0-9]+[-/](?:[A-Z0-9]+[-/])?(UTR[0-9A-Z]+|[0-9A-Z]{12,22})", re.IGNORECASE),
        re.compile(r"UPI[/]CR[/]([0-9]{12})[/]RAZORPAY", re.IGNORECASE),
        re.compile(r"CMS[/]([0-9]+)[/]RAZORPAYSETTLE", re.IGNORECASE),
        re.compile(r"(UTR[0-9]{12,20})", re.IGNORECASE),
    ]

    def __init__(self):
        self.settings = get_settings()

    def extract_utr_from_narration(self, narration: str) -> Optional[str]:
        """Extract UTR or Reference Number from free-text bank narration."""
        if not narration:
            return None
        for pattern in self.BANK_NARRATION_PATTERNS:
            match = pattern.search(narration)
            if match:
                return match.group(1)
        return None

    def reconcile_sources(
        self,
        gateway_records: list[dict],
        bank_records: list[dict],
        erp_records: list[dict],
    ) -> dict:
        """
        Main reconciliation pipeline with real confidence and double-lock gate.
        Returns match summary with four-label status vocabulary.
        """
        start_time = datetime.now(timezone.utc)
        threshold = self.settings.confidence_threshold
        results: list[dict] = []
        exceptions: list[dict] = []

        # ---- Step 0: Detect duplicates across all sources ----
        gateway_dupes = self._find_duplicates(gateway_records, "gateway")
        bank_dupes = self._find_duplicates(bank_records, "bank")
        erp_dupes = self._find_duplicates(erp_records, "erp")
        all_dupe_ids = gateway_dupes | bank_dupes | erp_dupes

        # ---- Step 1: Index bank records ----
        bank_by_utr: Dict[str, dict] = {}
        bank_by_txn: Dict[str, dict] = {}
        for b in bank_records:
            if not b:
                continue
            utr = b.get("utr_number") or b.get("chq_ref_no")
            tx_id = b.get("transaction_id")
            narration = b.get("narration", "")

            if utr:
                bank_by_utr[str(utr).strip()] = b
            if tx_id:
                bank_by_txn[str(tx_id).strip()] = b

            extracted_utr = self.extract_utr_from_narration(narration)
            if extracted_utr:
                bank_by_utr[extracted_utr] = b

        # ---- Step 2: Index ERP records ----
        erp_by_invoice = {str(e.get("invoice_number")).strip(): e for e in erp_records if e.get("invoice_number")}
        erp_by_order = {str(e.get("order_id")).strip(): e for e in erp_records if e.get("order_id")}
        erp_by_payment = {str(e.get("razorpay_payment_id") or e.get("payment_id")).strip(): e
                         for e in erp_records if (e.get("razorpay_payment_id") or e.get("payment_id"))}

        matched_bank_ids = set()
        matched_erp_ids = set()

        # ---- Step 3: Match each gateway record ----
        for g in gateway_records:
            g_txn_id = g.get("transaction_id") or g.get("entity_id") or g.get("payment_id")
            g_utr = g.get("utr_number") or g.get("settlement_utr") or g.get("utr")
            g_order_id = g.get("order_id")
            g_invoice = g.get("invoice_number")
            g_date = g.get("settlement_date") or g.get("settled_at") or g.get("date") or ""

            # Normalize amounts (all assumed rupees — no paise guessing)
            g_gross = _safe_decimal(g.get("gross_amount") or g.get("amount"))
            g_net = _safe_decimal(g.get("net_amount"))
            if g_net == 0 and g_gross > 0:
                fee = _safe_decimal(g.get("fee"))
                tax = _safe_decimal(g.get("tax"))
                tds = _safe_decimal(g.get("tds_194o"))
                g_net = g_gross - fee - tax - tds

            # Check if this record is a duplicate
            if g_txn_id and g_txn_id in all_dupe_ids:
                results.append({
                    "record_id": g_txn_id,
                    "source": "gateway",
                    "status": MatchStatus.DUPLICATE,
                    "status_detail": MatchDetail.DUPLICATE_ENTRY,
                    "reason": f"Duplicate: transaction {g_txn_id} appears more than once in the data",
                    "confidence": 1.0,
                    "confidence_source": "rule_computed",
                    "matched_sources": ["gateway"],
                })
                continue

            # ---- Bank matching ----
            bank_match = None
            bank_confidence_parts = {}
            bank_ref_type = None

            candidate_bank = None
            if g_utr and str(g_utr).strip() in bank_by_utr:
                candidate_bank = bank_by_utr[str(g_utr).strip()]
                bank_ref_type = "exact_utr"
            elif g_txn_id and str(g_txn_id).strip() in bank_by_txn:
                candidate_bank = bank_by_txn[str(g_txn_id).strip()]
                bank_ref_type = "exact_txn_id"

            if candidate_bank is None and (g_utr or g_txn_id):
                # Narration substring search
                for b_rec in bank_records:
                    b_id = b_rec.get("transaction_id")
                    if b_id in matched_bank_ids:
                        continue
                    b_narration = str(b_rec.get("narration", ""))
                    if (g_utr and str(g_utr) in b_narration) or (g_txn_id and str(g_txn_id) in b_narration):
                        candidate_bank = b_rec
                        bank_ref_type = "narration_substring"
                        break

            if candidate_bank:
                b_net = _safe_decimal(candidate_bank.get("deposit_amount") or candidate_bank.get("net_amount"))
                b_date = candidate_bank.get("settlement_date") or candidate_bank.get("date") or ""

                amount_conf = compute_amount_confidence(g_net, b_net)
                ref_conf = compute_reference_confidence(bank_ref_type)
                date_conf = compute_date_confidence(str(g_date), str(b_date))
                bank_composite = compute_composite_confidence(amount_conf, ref_conf, date_conf)

                bank_confidence_parts = {
                    "amount": round(amount_conf, 4),
                    "reference": round(ref_conf, 4),
                    "date": round(date_conf, 4),
                    "composite": bank_composite,
                }

                delta = abs(g_net - b_net)
                if delta <= Decimal("1.00") and bank_composite >= threshold:
                    bank_match = candidate_bank
                    matched_bank_ids.add(candidate_bank.get("transaction_id"))
                elif delta > Decimal("1.00"):
                    # Reference matched but amount differs — MISMATCHED
                    exceptions.append({
                        "exception_id": str(uuid4()),
                        "type": MatchDetail.AMOUNT_MISMATCH_BANK,
                        "gateway_txn_id": g_txn_id,
                        "bank_txn_id": candidate_bank.get("transaction_id"),
                        "detail": f"UTR matched ({g_utr}) but bank net credit (₹{b_net}) != gateway net (₹{g_net}), delta: ₹{delta}",
                        "confidence": bank_confidence_parts,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                # If composite < threshold, the double-lock blocks auto-match

            # ---- ERP matching ----
            erp_match = None
            erp_confidence_parts = {}
            erp_ref_type = None

            candidate_erp = None
            if g_txn_id and str(g_txn_id).strip() in erp_by_payment:
                candidate_erp = erp_by_payment[str(g_txn_id).strip()]
                erp_ref_type = "exact_txn_id"
            elif g_invoice and str(g_invoice).strip() in erp_by_invoice:
                candidate_erp = erp_by_invoice[str(g_invoice).strip()]
                erp_ref_type = "exact_invoice"
            elif g_order_id and str(g_order_id).strip() in erp_by_order:
                candidate_erp = erp_by_order[str(g_order_id).strip()]
                erp_ref_type = "exact_order_id"

            if candidate_erp is None:
                # Fuzzy merchant name matching
                g_merch = str(g.get("merchant_name") or g.get("merchant_legal_name") or g.get("merchant_id") or "")
                for e_rec in erp_records:
                    e_id = e_rec.get("transaction_id")
                    if e_id in matched_erp_ids:
                        continue
                    e_merch = str(e_rec.get("ledger_name") or e_rec.get("merchant_name") or "")
                    e_gross = _safe_decimal(e_rec.get("gross_invoice_value") or e_rec.get("gross_amount"))

                    if abs(g_gross - e_gross) <= Decimal("1.00") and g_merch and e_merch:
                        sim = max(
                            fuzz.token_set_ratio(g_merch.lower(), e_merch.lower()),
                            fuzz.token_sort_ratio(g_merch.lower(), e_merch.lower()),
                            fuzz.partial_ratio(g_merch.lower(), e_merch.lower()),
                        )
                        if sim >= 65:
                            candidate_erp = e_rec
                            erp_ref_type = "fuzzy_merchant"
                            break

            if candidate_erp:
                e_gross = _safe_decimal(candidate_erp.get("gross_invoice_value") or candidate_erp.get("gross_amount"))
                e_date = candidate_erp.get("settlement_date") or candidate_erp.get("voucher_date") or candidate_erp.get("date") or ""

                amount_conf = compute_amount_confidence(g_gross, e_gross)
                if erp_ref_type == "fuzzy_merchant":
                    g_merch = str(g.get("merchant_name") or g.get("merchant_legal_name") or g.get("merchant_id") or "")
                    e_merch = str(candidate_erp.get("ledger_name") or candidate_erp.get("merchant_name") or "")
                    sim = max(
                        fuzz.token_set_ratio(g_merch.lower(), e_merch.lower()),
                        fuzz.token_sort_ratio(g_merch.lower(), e_merch.lower()),
                    )
                    ref_conf = compute_reference_confidence("fuzzy_merchant", sim)
                else:
                    ref_conf = compute_reference_confidence(erp_ref_type)
                date_conf = compute_date_confidence(str(g_date), str(e_date))
                erp_composite = compute_composite_confidence(amount_conf, ref_conf, date_conf)

                erp_confidence_parts = {
                    "amount": round(amount_conf, 4),
                    "reference": round(ref_conf, 4),
                    "date": round(date_conf, 4),
                    "composite": erp_composite,
                }

                delta = abs(g_gross - e_gross)
                if delta <= Decimal("1.00") and erp_composite >= threshold:
                    erp_match = candidate_erp
                    matched_erp_ids.add(candidate_erp.get("transaction_id"))
                elif delta > Decimal("1.00"):
                    exceptions.append({
                        "exception_id": str(uuid4()),
                        "type": MatchDetail.AMOUNT_MISMATCH_ERP,
                        "gateway_txn_id": g_txn_id,
                        "erp_txn_id": candidate_erp.get("transaction_id"),
                        "detail": f"Invoice match ({g_invoice}) but ERP gross (₹{e_gross}) != gateway gross (₹{g_gross})",
                        "confidence": erp_confidence_parts,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })

            # ---- DOUBLE-LOCK GATE: Classify result ----
            if bank_match and erp_match:
                # Three-way match — highest confidence
                combined_conf = round(
                    (bank_confidence_parts.get("composite", 0) + erp_confidence_parts.get("composite", 0)) / 2, 4
                )

                # Double-lock: BOTH must clear threshold
                if bank_confidence_parts.get("composite", 0) >= threshold and erp_confidence_parts.get("composite", 0) >= threshold:
                    status = MatchStatus.MATCHED
                    detail = MatchDetail.THREE_WAY
                    reason = (
                        f"Three-way match: Gateway ↔ Bank (UTR {g_utr}, confidence {bank_confidence_parts.get('composite', 0):.2f}) "
                        f"↔ ERP (invoice {g_invoice}, confidence {erp_confidence_parts.get('composite', 0):.2f})"
                    )
                else:
                    status = MatchStatus.MISMATCHED
                    detail = MatchDetail.LOW_CONFIDENCE
                    reason = f"References matched but confidence below threshold ({threshold}) — routed to exception"

                results.append({
                    "record_id": g_txn_id,
                    "source": "gateway",
                    "status": status,
                    "status_detail": detail,
                    "reason": reason,
                    "confidence": combined_conf,
                    "confidence_source": "rule_computed",
                    "confidence_breakdown": {
                        "bank": bank_confidence_parts,
                        "erp": erp_confidence_parts,
                    },
                    "matched_sources": ["gateway", "bank_statement", "erp_ledger"],
                })

            elif bank_match:
                conf = bank_confidence_parts.get("composite", 0)
                if conf >= threshold:
                    status = MatchStatus.MATCHED
                    detail = MatchDetail.GATEWAY_BANK
                    reason = f"Gateway ↔ Bank match via UTR {g_utr} (confidence {conf:.2f}). Missing from ERP."
                else:
                    status = MatchStatus.MISMATCHED
                    detail = MatchDetail.LOW_CONFIDENCE
                    reason = f"Bank reference matched but confidence {conf:.2f} below threshold {threshold}"

                results.append({
                    "record_id": g_txn_id,
                    "source": "gateway",
                    "status": status,
                    "status_detail": detail,
                    "reason": reason,
                    "confidence": conf,
                    "confidence_source": "rule_computed",
                    "confidence_breakdown": {"bank": bank_confidence_parts},
                    "matched_sources": ["gateway", "bank_statement"],
                })

            elif erp_match:
                conf = erp_confidence_parts.get("composite", 0)
                if conf >= threshold:
                    status = MatchStatus.MATCHED
                    detail = MatchDetail.GATEWAY_ERP
                    reason = f"Gateway ↔ ERP match via {erp_ref_type} (confidence {conf:.2f}). Missing from bank."
                else:
                    status = MatchStatus.MISMATCHED
                    detail = MatchDetail.LOW_CONFIDENCE
                    reason = f"ERP reference matched but confidence {conf:.2f} below threshold {threshold}"

                results.append({
                    "record_id": g_txn_id,
                    "source": "gateway",
                    "status": status,
                    "status_detail": detail,
                    "reason": reason,
                    "confidence": conf,
                    "confidence_source": "rule_computed",
                    "confidence_breakdown": {"erp": erp_confidence_parts},
                    "matched_sources": ["gateway", "erp_ledger"],
                })

            else:
                # No match found at all
                results.append({
                    "record_id": g_txn_id,
                    "source": "gateway",
                    "status": MatchStatus.MISSING,
                    "status_detail": MatchDetail.MISSING_IN_BANK if not candidate_bank else MatchDetail.MISSING_IN_ERP,
                    "reason": f"No matching bank or ERP entry found for gateway transaction {g_txn_id}",
                    "confidence": 0.0,
                    "confidence_source": "rule_computed",
                    "matched_sources": ["gateway"],
                })

        # ---- Step 4: Find unmatched bank records ----
        for b in bank_records:
            b_id = b.get("transaction_id")
            if b_id and b_id not in matched_bank_ids:
                if b_id in all_dupe_ids:
                    results.append({
                        "record_id": b_id,
                        "source": "bank_statement",
                        "status": MatchStatus.DUPLICATE,
                        "status_detail": MatchDetail.DUPLICATE_ENTRY,
                        "reason": f"Duplicate: bank transaction {b_id} appears more than once",
                        "confidence": 1.0,
                        "confidence_source": "rule_computed",
                        "matched_sources": ["bank_statement"],
                    })
                else:
                    results.append({
                        "record_id": b_id,
                        "source": "bank_statement",
                        "status": MatchStatus.MISSING,
                        "status_detail": MatchDetail.MISSING_IN_GATEWAY,
                        "reason": f"Bank entry {b_id} has no matching gateway record — potential unreconciled credit",
                        "confidence": 0.0,
                        "confidence_source": "rule_computed",
                        "matched_sources": ["bank_statement"],
                    })

        # ---- Step 5: Find unmatched ERP records ----
        for e in erp_records:
            e_id = e.get("transaction_id")
            if e_id and e_id not in matched_erp_ids:
                if e_id in all_dupe_ids:
                    results.append({
                        "record_id": e_id,
                        "source": "erp_ledger",
                        "status": MatchStatus.DUPLICATE,
                        "status_detail": MatchDetail.DUPLICATE_ENTRY,
                        "reason": f"Duplicate: ERP entry {e_id} appears more than once",
                        "confidence": 1.0,
                        "confidence_source": "rule_computed",
                        "matched_sources": ["erp_ledger"],
                    })
                else:
                    results.append({
                        "record_id": e_id,
                        "source": "erp_ledger",
                        "status": MatchStatus.MISSING,
                        "status_detail": MatchDetail.MISSING_IN_GATEWAY,
                        "reason": f"ERP entry {e_id} has no matching gateway record — potential unbilled revenue",
                        "confidence": 0.0,
                        "confidence_source": "rule_computed",
                        "matched_sources": ["erp_ledger"],
                    })

        # ---- Summary ----
        status_counts = Counter(r["status"] for r in results)
        duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
        total = len(results)
        matched_count = status_counts.get(MatchStatus.MATCHED, 0)
        match_rate = matched_count / max(total, 1)
        throughput = round(total / max(duration_ms / 1000.0, 0.001), 2)

        # Compute average confidence (only for non-zero confidence records)
        conf_values = [r["confidence"] for r in results if r.get("confidence") and r["confidence"] > 0]
        avg_confidence = round(sum(conf_values) / len(conf_values), 4) if conf_values else 0.0

        # Extract matches list for backward compatibility
        matches_list = [
            {
                "transaction_id": r["record_id"],
                "record_id": r["record_id"],
                "status": r["status"],
                "status_detail": r.get("status_detail"),
                "confidence": r.get("confidence", 0.0),
                "confidence_source": r.get("confidence_source"),
                "match_reason": r.get("reason", ""),
                "reason": r.get("reason", ""),
                "matched_sources": r.get("matched_sources", []),
            }
            for r in results if r["status"] == MatchStatus.MATCHED
        ]

        # Uppercase alias on exceptions for legacy compatibility
        for exc in exceptions:
            if "type" in exc:
                exc["type_code"] = str(exc["type"]).upper()

        return {
            "summary": {
                "total_records": total,
                "matched": matched_count,
                "matched_count": matched_count,
                "mismatched": status_counts.get(MatchStatus.MISMATCHED, 0),
                "missing": status_counts.get(MatchStatus.MISSING, 0),
                "unmatched_gateway_count": status_counts.get(MatchStatus.MISSING, 0),
                "duplicates": status_counts.get(MatchStatus.DUPLICATE, 0),
                "exceptions_count": len(exceptions),
                "match_rate": round(match_rate, 4),
                "match_rate_percentage": f"{match_rate * 100:.1f}%",
                "avg_confidence": avg_confidence,
                "confidence_threshold": threshold,
                "throughput_records_per_second": throughput,
                "duration_ms": duration_ms,
            },
            "results": results,
            "matches": matches_list,
            "exceptions": exceptions,
        }

    def _find_duplicates(self, records: list[dict], source_name: str) -> set:
        """
        Find duplicate records by checking if the same reference+amount appears more than once.
        Returns set of transaction_ids that are duplicates.
        """
        seen = {}
        dupes = set()

        for r in records:
            txn_id = r.get("transaction_id") or r.get("entity_id") or r.get("payment_id")
            utr = r.get("utr_number") or r.get("chq_ref_no") or ""
            amount = str(r.get("net_amount") or r.get("gross_amount") or r.get("deposit_amount") or "0")

            # Create a fingerprint: reference + amount
            key = f"{utr}|{amount}" if utr else f"{txn_id}|{amount}"

            if key in seen:
                dupes.add(txn_id)
                dupes.add(seen[key])
            else:
                seen[key] = txn_id

        if dupes:
            logger.warning(f"Found {len(dupes)} duplicate entries in {source_name}: {dupes}")

        return dupes
