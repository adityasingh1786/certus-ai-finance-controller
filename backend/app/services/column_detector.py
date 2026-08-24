"""
AI Finance Controller — Dynamic Column Detector & Schema Normalizer

Eliminates brittle hardcoded column requirements.
Inspects arbitrary CSV headers using fuzzy alias matching and data-type
heuristics to automatically map any bank statement, gateway dump, or
ERP ledger into standardized reconciliation records.
"""

import re
from typing import Dict, List, Any, Optional
from datetime import datetime
from rapidfuzz import fuzz

# Canonical Field Alias Dictionary
CANONICAL_ALIASES: Dict[str, List[str]] = {
    "amount": [
        "amount", "net_amount", "gross_amount", "deposit_amount", "credit", "credit_amount",
        "net_credit", "gross_invoice_value", "total", "net_receivable", "txn_amount", "paid_amount"
    ],
    "gross_amount": [
        "gross_amount", "gross_invoice_value", "invoice_amount", "gross_total", "billed_amount"
    ],
    "fee": [
        "fee", "mdr", "gateway_fee", "convenience_fee", "service_charge", "charges", "commission"
    ],
    "tax": [
        "tax", "gst", "cgst", "sgst", "igst", "service_tax", "vat"
    ],
    "date": [
        "settlement_date", "date", "txn_date", "transaction_date", "value_date", "booking_date",
        "voucher_date", "created_at", "settled_at", "invoice_date", "payment_date"
    ],
    "reference": [
        "utr_number", "utr", "chq_ref_no", "cheque_number", "ref_no", "reference_no", "rrn",
        "transaction_id", "txn_id", "payment_id", "entity_id", "voucher_number", "voucher_no"
    ],
    "order_id": [
        "order_id", "razorpay_order_id", "merchant_order_id", "ord_id", "order_ref"
    ],
    "invoice_number": [
        "invoice_number", "invoice_no", "inv_no", "bill_number", "bill_no", "voucher_no"
    ],
    "merchant": [
        "merchant_name", "merchant_id", "merchant_legal_name", "ledger_name", "party_name",
        "customer_name", "vendor_name", "account_name"
    ],
    "narration": [
        "narration", "description", "remarks", "particulars", "transaction_details", "notes"
    ],
    "status": [
        "status", "txn_status", "payment_status", "state", "record_status"
    ],
}


def _clean_header(header: str) -> str:
    """Normalize header string for clean fuzzy matching."""
    if not header:
        return ""
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "_", header.strip().lower())
    return cleaned.strip("_")


def _is_probable_date(val: Any) -> bool:
    if not val or not isinstance(val, str):
        return False
    s = str(val).strip()
    if len(s) > 30 or len(s) < 6:
        return False
    # Check common date patterns
    if re.search(r"^\d{4}[-/]\d{1,2}[-/]\d{1,2}", s) or re.search(r"^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}", s):
        return True
    return False


def _is_probable_numeric_amount(val: Any) -> bool:
    if val is None:
        return False
    s = str(val).replace(",", "").replace("₹", "").replace("$", "").strip()
    try:
        float(s)
        return True
    except ValueError:
        return False


class ColumnDetector:
    """
    Analyzes raw records and infers column mappings with type verification.
    """

    def detect_mapping(self, sample_rows: List[Dict[str, Any]]) -> Dict[str, str]:
        """
        Given sample rows (list of dicts from CSV DictReader), produces a mapping from
        canonical field names -> actual raw column headers in the CSV.
        """
        if not sample_rows:
            return {}

        headers = list(sample_rows[0].keys())
        mapping: Dict[str, str] = {}
        assigned_headers = set()

        # Step 1: Match high-confidence canonical fields via alias list
        for canonical_name, aliases in CANONICAL_ALIASES.items():
            best_header = None
            best_score = 0.0

            for h in headers:
                if h in assigned_headers:
                    continue
                cleaned_h = _clean_header(h)

                # Direct exact alias hit
                if cleaned_h in aliases:
                    best_header = h
                    best_score = 100.0
                    break

                # Substring / partial match
                for alias in aliases:
                    score = fuzz.token_sort_ratio(cleaned_h, alias)
                    if cleaned_h == alias:
                        score = 100.0
                    elif alias in cleaned_h or cleaned_h in alias:
                        score = max(score, 88.0)

                    if score > best_score and score >= 75.0:
                        best_score = score
                        best_header = h

            if best_header and best_score >= 75.0:
                mapping[canonical_name] = best_header
                # Note: don't assign header to multiple fields except amount/net_amount
                if canonical_name not in ("amount", "gross_amount"):
                    assigned_headers.add(best_header)

        # Step 2: Data-type heuristic sanity check / fallback
        if "date" not in mapping:
            for h in headers:
                if h in assigned_headers:
                    continue
                # Check if values in column look like dates
                sample_vals = [r.get(h) for r in sample_rows[:5] if r.get(h)]
                if sample_vals and all(_is_probable_date(v) for v in sample_vals):
                    mapping["date"] = h
                    assigned_headers.add(h)
                    break

        if "amount" not in mapping:
            for h in headers:
                if h in assigned_headers:
                    continue
                sample_vals = [r.get(h) for r in sample_rows[:5] if r.get(h)]
                if sample_vals and all(_is_probable_numeric_amount(v) for v in sample_vals):
                    mapping["amount"] = h
                    assigned_headers.add(h)
                    break

        return mapping

    def normalize_records(self, raw_rows: List[Dict[str, Any]], source_label: str) -> List[Dict[str, Any]]:
        """
        Converts any list of raw CSV dicts into standard canonical reconciliation dicts.
        """
        if not raw_rows:
            return []

        mapping = self.detect_mapping(raw_rows)
        normalized: List[Dict[str, Any]] = []

        for idx, row in enumerate(raw_rows):
            # Extract standard canonical attributes
            amt_raw = row.get(mapping.get("amount", ""))
            gross_raw = row.get(mapping.get("gross_amount", "")) or amt_raw
            fee_raw = row.get(mapping.get("fee", "")) or 0
            tax_raw = row.get(mapping.get("tax", "")) or 0
            date_raw = row.get(mapping.get("date", "")) or ""
            ref_raw = row.get(mapping.get("reference", ""))
            order_raw = row.get(mapping.get("order_id", ""))
            invoice_raw = row.get(mapping.get("invoice_number", ""))
            merchant_raw = row.get(mapping.get("merchant", ""))
            narration_raw = row.get(mapping.get("narration", "")) or ""
            status_raw = row.get(mapping.get("status", "")) or "settled"

            # Clean amount strings
            def _clean_num(v, default=0.0):
                if v is None or v == "":
                    return default
                try:
                    return float(str(v).replace(",", "").replace("₹", "").replace("$", "").strip())
                except (ValueError, TypeError):
                    return default

            net_amt = _clean_num(amt_raw)
            gross_amt = _clean_num(gross_raw, default=net_amt)
            fee = _clean_num(fee_raw)
            tax = _clean_num(tax_raw)

            # Generate synthetic record ID if not provided in raw data
            txn_id = str(ref_raw).strip() if ref_raw else f"{source_label.upper()}-ROW-{idx+1}"

            # Check if reference is in UTR format
            utr_val = str(ref_raw).strip() if ref_raw else None

            normalized.append({
                "transaction_id": txn_id,
                "utr_number": utr_val,
                "net_amount": str(net_amt),
                "gross_amount": str(gross_amt),
                "deposit_amount": str(net_amt),  # For bank compatibility
                "gross_invoice_value": str(gross_amt),  # For ERP compatibility
                "fee": str(fee),
                "tax": str(tax),
                "settlement_date": str(date_raw).strip(),
                "order_id": str(order_raw).strip() if order_raw else None,
                "invoice_number": str(invoice_raw).strip() if invoice_raw else None,
                "merchant_name": str(merchant_raw).strip() if merchant_raw else None,
                "ledger_name": str(merchant_raw).strip() if merchant_raw else None,
                "narration": str(narration_raw).strip(),
                "status": str(status_raw).strip().lower(),
                "source": source_label,
            })

        return normalized


# Singleton instance
column_detector = ColumnDetector()
