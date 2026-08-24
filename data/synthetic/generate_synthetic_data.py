"""
AI Finance Controller — Synthetic Data Generator

Generates 50-70 realistic settlement records with:
- Realistic messy narration text (inconsistent casing, abbreviations, typos)
- Three data sources: gateway, bank statement, ERP ledger
- 10-15% deliberately injected anomalies with private ground-truth labels
- Fixed random seed for 100% reproducible demo runs

Usage:
    python -m data.synthetic.generate_synthetic_data
"""

import csv
import json
import random
import os
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

# Fixed seed — NEVER regenerate randomly before presenting
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

# Output paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = BASE_DIR
CLEAN_CSV = os.path.join(OUTPUT_DIR, "clean_records.csv")
ANOMALIES_CSV = os.path.join(OUTPUT_DIR, "injected_anomalies.csv")
GROUND_TRUTH_CSV = os.path.join(OUTPUT_DIR, "ground_truth_labels.csv")  # GITIGNORED
BANK_STATEMENT_CSV = os.path.join(OUTPUT_DIR, "bank_statement.csv")
ERP_LEDGER_CSV = os.path.join(OUTPUT_DIR, "erp_ledger.csv")
GATEWAY_CSV = os.path.join(OUTPUT_DIR, "gateway_records.csv")
FULL_BATCH_CSV = os.path.join(OUTPUT_DIR, "full_batch.csv")

# Merchant pool
MERCHANTS = [
    {"id": "MRCH001", "name": "TechStore India Pvt Ltd", "category": "electronics"},
    {"id": "MRCH002", "name": "FreshMart Groceries", "category": "grocery"},
    {"id": "MRCH003", "name": "CloudSoft Solutions", "category": "saas"},
    {"id": "MRCH004", "name": "Metro Cab Services", "category": "transport"},
    {"id": "MRCH005", "name": "BookWorm Online", "category": "retail"},
    {"id": "MRCH006", "name": "HealthFirst Pharma", "category": "healthcare"},
    {"id": "MRCH007", "name": "QuickBite Restaurants", "category": "food"},
    {"id": "MRCH008", "name": "EduLearn Academy", "category": "education"},
    {"id": "MRCH009", "name": "GreenEnergy Solar", "category": "utilities"},
    {"id": "MRCH010", "name": "FashionHub Trends", "category": "apparel"},
]

PAYMENT_METHODS = ["UPI", "CARD", "NETBANKING", "WALLET", "BANK_TRANSFER"]

# Realistic messy narration templates (the way real processors write them)
NARRATION_TEMPLATES = [
    "STTLMNT/{merchant_code}/PY-{pay_id}/{date_compact} NET AMT {net_amt}",
    "Settlement - {merchant_name} - Ref#{pay_id} dt {date_slash}",
    "Razorpay sttlmnt {pay_id} for {merchant_name} INR {gross_amt} less fee {fee_amt}",
    "NEFT/RTGS Cr - {utr} - {merchant_name} - {date_compact}",
    "Pymnt settlement batch #{batch_num} {merchant_code} {net_amt}",
    "IMPS-{utr}-{merchant_name}-SETTLE-{date_compact}",
    "setlmnt #{pay_id} merch:{merchant_code} gross:{gross_amt} net:{net_amt} {payment_method}",
    "{merchant_name} / inv #{invoice} / settled {date_slash} / ₹{net_amt}",
    "CR {utr} RZP SETTLEMENT {merchant_code} {date_compact} INR{net_amt}",
    "Online Pymnt - {payment_method} - {merchant_name} - Order:{order_id}",
    "stlmnt {merchant_code}/{pay_id} amt={gross_amt} fee={fee_amt} tax={tax_amt} net={net_amt}",
    "bank credit utr:{utr} razorpay settlement {date_slash} {net_amt}",
]

# Messy variations for realism
MESSY_MODIFIERS = [
    lambda s: s.upper(),
    lambda s: s.lower(),
    lambda s: s.replace("settlement", "settlment"),  # typo
    lambda s: s.replace("Settlement", "Setlmnt"),
    lambda s: s.replace("payment", "pymnt"),
    lambda s: s.replace("amount", "amt"),
    lambda s: s,  # no change
    lambda s: s,  # no change (weighted towards clean)
]


def generate_utr() -> str:
    """Generate a realistic UTR number."""
    bank_codes = ["UTIB", "HDFC", "ICIC", "SBIN", "BARB", "KKBK"]
    return f"{random.choice(bank_codes)}{random.randint(10000000000, 99999999999)}"


def generate_payment_id() -> str:
    return f"pay_{uuid4().hex[:14]}"


def generate_order_id() -> str:
    return f"order_{uuid4().hex[:12]}"


def generate_invoice_number() -> str:
    prefix = random.choice(["INV", "BILL", "REC", "SI"])
    return f"{prefix}-{random.randint(1000, 9999)}-{random.randint(100, 999)}"


def generate_clean_record(idx: int, base_date: date) -> dict:
    """Generate a single clean, valid settlement record."""
    merchant = random.choice(MERCHANTS)
    payment_method = random.choice(PAYMENT_METHODS)

    # Generate amounts
    gross = Decimal(str(random.randint(100, 50000))) + Decimal(str(random.randint(0, 99))) / 100
    fee_rate = Decimal(str(random.choice(["0.02", "0.025", "0.03", "0.018"])))
    fee = (gross * fee_rate).quantize(Decimal("0.01"), ROUND_HALF_UP)
    tax_rate = Decimal("0.18")  # GST
    tax = (fee * tax_rate).quantize(Decimal("0.01"), ROUND_HALF_UP)
    net = gross - fee - tax

    # Settlement date (within the last 30 days)
    days_back = random.randint(0, 28)
    settlement_date = base_date - timedelta(days=days_back)

    # Status
    status_weights = [("settled", 0.80), ("pending", 0.15), ("refunded", 0.03), ("partially_refunded", 0.02)]
    status = random.choices(
        [s for s, _ in status_weights],
        weights=[w for _, w in status_weights],
    )[0]

    # Generate cross-reference IDs
    pay_id = generate_payment_id()
    order_id = generate_order_id()
    utr = generate_utr()
    invoice = generate_invoice_number()

    # Generate narration
    template = random.choice(NARRATION_TEMPLATES)
    narration = template.format(
        merchant_code=merchant["id"],
        merchant_name=merchant["name"],
        pay_id=pay_id,
        order_id=order_id,
        utr=utr,
        invoice=invoice,
        date_compact=settlement_date.strftime("%d%m%y"),
        date_slash=settlement_date.strftime("%d/%m/%Y"),
        gross_amt=str(gross),
        net_amt=str(net),
        fee_amt=str(fee),
        tax_amt=str(tax),
        payment_method=payment_method,
        batch_num=random.randint(100, 999),
    )

    # Apply messy modifier for realism
    modifier = random.choice(MESSY_MODIFIERS)
    narration = modifier(narration)

    return {
        "transaction_id": f"TXN-{idx:04d}-{uuid4().hex[:6]}",
        "merchant_id": merchant["id"],
        "merchant_name": merchant["name"],
        "settlement_date": settlement_date.isoformat(),
        "gross_amount": str(gross),
        "fee": str(fee),
        "tax": str(tax),
        "net_amount": str(net),
        "currency": "INR",
        "payment_method": payment_method,
        "status": status,
        "narration": narration,
        "source": "razorpay_gateway",
        "utr_number": utr,
        "payment_id": pay_id,
        "order_id": order_id,
        "invoice_number": invoice,
    }


def inject_anomaly(record: dict, anomaly_type: str) -> tuple[dict, dict]:
    """
    Deliberately corrupt a record. Returns (corrupted_record, ground_truth_label).
    """
    label = {
        "transaction_id": record["transaction_id"],
        "anomaly_type": anomaly_type,
        "original_values": {},
        "expected_detection": True,
    }

    if anomaly_type == "missing_field":
        # Remove settlement_date
        field = random.choice(["settlement_date", "merchant_id", "gross_amount"])
        label["original_values"][field] = record[field]
        record[field] = ""
        label["detail"] = f"Removed required field '{field}'"

    elif anomaly_type == "duplicate_id":
        # Will be a duplicate of a previous record
        label["detail"] = f"Duplicate transaction_id: {record['transaction_id']}"

    elif anomaly_type == "invalid_currency":
        label["original_values"]["currency"] = record["currency"]
        record["currency"] = random.choice(["XYZ", "INRR", "US$", "₹", ""])
        label["detail"] = f"Invalid currency: {record['currency']}"

    elif anomaly_type == "negative_amount":
        label["original_values"]["gross_amount"] = record["gross_amount"]
        record["gross_amount"] = str(-abs(Decimal(record["gross_amount"])))
        label["detail"] = f"Negative gross_amount: {record['gross_amount']}"

    elif anomaly_type == "net_exceeds_gross":
        label["original_values"]["net_amount"] = record["net_amount"]
        gross = Decimal(record["gross_amount"])
        record["net_amount"] = str(gross + Decimal("500"))
        label["detail"] = f"net_amount ({record['net_amount']}) > gross_amount ({record['gross_amount']})"

    elif anomaly_type == "future_date":
        label["original_values"]["settlement_date"] = record["settlement_date"]
        future = date.today() + timedelta(days=random.randint(60, 365))
        record["settlement_date"] = future.isoformat()
        label["detail"] = f"Settlement date in far future: {record['settlement_date']}"

    elif anomaly_type == "malformed_narration":
        label["original_values"]["narration"] = record["narration"]
        # Garble with encoding issues
        garbled = "".join(
            c if random.random() > 0.3 else chr(random.randint(0x2000, 0x2FFF))
            for c in record["narration"][:30]
        )
        record["narration"] = garbled + "€¥¶§..."
        label["detail"] = "Garbled narration with encoding corruption"

    elif anomaly_type == "amount_mismatch":
        # Fee + tax + net doesn't equal gross
        label["original_values"]["fee"] = record["fee"]
        record["fee"] = str(Decimal(record["fee"]) + Decimal("999.99"))
        label["detail"] = f"Arithmetic mismatch: fee inflated by ₹999.99"

    return record, label


def generate_bank_statement_record(gateway_record: dict) -> dict:
    """
    Generate a corresponding bank statement record for multi-source reconciliation.
    Introduces realistic mismatches: timing delays, net-of-fee amounts, different references.
    """
    # Bank statement arrives 1-2 days later
    try:
        orig_date = date.fromisoformat(gateway_record["settlement_date"])
        bank_date = orig_date + timedelta(days=random.choice([1, 1, 2, 2, 3]))
    except (ValueError, TypeError):
        bank_date = date.today()

    return {
        "transaction_id": f"BANK-{gateway_record['utr_number']}",
        "merchant_id": gateway_record["merchant_id"],
        "settlement_date": bank_date.isoformat(),
        "gross_amount": gateway_record["net_amount"],  # Bank sees net amount
        "fee": "0",
        "tax": "0",
        "net_amount": gateway_record["net_amount"],
        "currency": "INR",
        "payment_method": "BANK_TRANSFER",
        "status": "settled",
        "narration": f"CR {gateway_record['utr_number']} RAZORPAY SETTLEMENT {bank_date.strftime('%d%m%y')} INR{gateway_record['net_amount']}",
        "source": "bank_statement",
        "utr_number": gateway_record["utr_number"],
        "payment_id": "",
        "order_id": "",
        "invoice_number": "",
    }


def generate_erp_record(gateway_record: dict) -> dict:
    """
    Generate a corresponding ERP record for multi-source reconciliation.
    Uses invoice numbers instead of payment IDs, sometimes has re-keying errors.
    """
    return {
        "transaction_id": f"ERP-{gateway_record['invoice_number']}",
        "merchant_id": gateway_record["merchant_id"],
        "merchant_name": gateway_record.get("merchant_name", ""),
        "settlement_date": gateway_record["settlement_date"],
        "gross_amount": gateway_record["gross_amount"],
        "fee": gateway_record["fee"],
        "tax": gateway_record["tax"],
        "net_amount": gateway_record["net_amount"],
        "currency": "INR",
        "payment_method": gateway_record["payment_method"],
        "status": gateway_record["status"],
        "narration": f"Received payment from {gateway_record.get('merchant_name', 'N/A')} Invoice #{gateway_record['invoice_number']}",
        "source": "erp_ledger",
        "utr_number": "",
        "payment_id": "",
        "order_id": gateway_record["order_id"],
        "invoice_number": gateway_record["invoice_number"],
    }


def generate_full_dataset():
    """Generate the complete synthetic dataset."""
    print("🔧 Generating synthetic dataset with seed={RANDOM_SEED}...")

    base_date = date.today()
    total_records = 60
    anomaly_rate = 0.12  # 12%
    num_anomalies = max(6, int(total_records * anomaly_rate))
    num_clean = total_records - num_anomalies

    # Generate clean records
    clean_records = []
    for i in range(num_clean):
        record = generate_clean_record(i, base_date)
        clean_records.append(record)

    # Generate anomalous records
    anomaly_types = [
        "missing_field",
        "duplicate_id",
        "invalid_currency",
        "negative_amount",
        "net_exceeds_gross",
        "future_date",
        "malformed_narration",
        "amount_mismatch",
    ]

    anomaly_records = []
    ground_truth = []

    for i in range(num_anomalies):
        base_record = generate_clean_record(num_clean + i, base_date)
        anomaly_type = anomaly_types[i % len(anomaly_types)]

        # Special handling for duplicates
        if anomaly_type == "duplicate_id" and clean_records:
            base_record["transaction_id"] = clean_records[random.randint(0, len(clean_records) - 1)]["transaction_id"]

        corrupted, label = inject_anomaly(base_record, anomaly_type)
        anomaly_records.append(corrupted)
        ground_truth.append(label)

    # Shuffle clean + anomalous together
    all_records = clean_records + anomaly_records
    random.shuffle(all_records)

    # Generate multi-source records (bank statements + ERP)
    bank_records = []
    erp_records = []
    for record in clean_records[:30]:  # Generate matching records for first 30
        if random.random() > 0.2:  # 80% have bank statement match
            bank_records.append(generate_bank_statement_record(record))
        if random.random() > 0.3:  # 70% have ERP match
            erp_records.append(generate_erp_record(record))

    # Write CSV files
    fieldnames = [
        "transaction_id", "merchant_id", "settlement_date", "gross_amount",
        "fee", "tax", "net_amount", "currency", "payment_method", "status",
        "narration", "source", "utr_number", "payment_id", "order_id", "invoice_number",
    ]

    # Full batch (gateway records with anomalies)
    _write_csv(FULL_BATCH_CSV, fieldnames, all_records)
    print(f"   ✅ Full batch: {len(all_records)} records → {FULL_BATCH_CSV}")

    # Clean records only
    _write_csv(CLEAN_CSV, fieldnames, clean_records)
    print(f"   ✅ Clean records: {len(clean_records)} → {CLEAN_CSV}")

    # Anomaly records only
    _write_csv(ANOMALIES_CSV, fieldnames, anomaly_records)
    print(f"   ✅ Anomaly records: {len(anomaly_records)} → {ANOMALIES_CSV}")

    # Bank statements
    _write_csv(BANK_STATEMENT_CSV, fieldnames, bank_records)
    print(f"   ✅ Bank statements: {len(bank_records)} → {BANK_STATEMENT_CSV}")

    # ERP ledger
    erp_fieldnames = fieldnames + ["merchant_name"]
    _write_csv(ERP_LEDGER_CSV, erp_fieldnames, erp_records)
    print(f"   ✅ ERP ledger: {len(erp_records)} → {ERP_LEDGER_CSV}")

    # Gateway records
    _write_csv(GATEWAY_CSV, fieldnames, clean_records + anomaly_records)
    print(f"   ✅ Gateway records: {len(clean_records) + len(anomaly_records)} → {GATEWAY_CSV}")

    # Ground truth labels (GITIGNORED — never commit the answer key)
    gt_fieldnames = ["transaction_id", "anomaly_type", "detail", "expected_detection"]
    gt_rows = [{
        "transaction_id": g["transaction_id"],
        "anomaly_type": g["anomaly_type"],
        "detail": g["detail"],
        "expected_detection": g["expected_detection"],
    } for g in ground_truth]
    _write_csv(GROUND_TRUTH_CSV, gt_fieldnames, gt_rows)
    print(f"   🔒 Ground truth labels: {len(gt_rows)} → {GROUND_TRUTH_CSV} (GITIGNORED)")

    # Summary
    print(f"\n📊 Dataset Summary:")
    print(f"   Total records in batch: {len(all_records)}")
    print(f"   Clean: {len(clean_records)} ({len(clean_records)/len(all_records)*100:.0f}%)")
    print(f"   Anomalous: {len(anomaly_records)} ({len(anomaly_records)/len(all_records)*100:.0f}%)")
    print(f"   Bank statement matches: {len(bank_records)}")
    print(f"   ERP ledger matches: {len(erp_records)}")
    print(f"\n   🎯 Demo claim: 'We injected {len(anomaly_records)} broken records into a batch of {len(all_records)}'")


def _write_csv(path: str, fieldnames: list, records: list):
    """Write records to CSV file."""
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)


if __name__ == "__main__":
    generate_full_dataset()
