"""
AI Finance Controller — 20 Enterprise Synthetic Dataset Registry & 4-Channel Generator

Provides 20 vast, hyper-realistic, enterprise financial scenarios across 4 channels:
  1. Channel 1: Razorpay Gateway Instant Capture / Settlement Stream
  2. Channel 2: Bank Statements (HDFC, ICICI, SBI, Axis, Kotak CMS/NEFT/RTGS)
  3. Channel 3: ERP General Ledgers (SAP S/4HANA, Tally Prime, Zoho Books, NetSuite)
  4. Channel 4: Audit & Quarantine Exception Stream (Pre-isolated Layer 1 traps)
"""

import random
from datetime import date, timedelta
from decimal import Decimal
from typing import Dict, List, Any, Optional

SCENARIO_CATALOG: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "D2C Fashion & Apparel — Festive Flash Sale",
        "sector": "E-Commerce & Retail",
        "primary_bank": "HDFC Bank CMS",
        "erp_system": "Tally Prime 4.0",
        "description": "High-volume UPI & credit card sales spike with standard 2.0% MDR + 18% GST deductions.",
        "avg_ticket_size": 2499.00,
        "anomaly_types": ["MDR fee deviation > 50 bps", "Negative amount refund trap", "Missing bank settlement credit"],
    },
    {
        "id": 2,
        "name": "B2B Enterprise Cloud SaaS — Annual Contract Billing",
        "sector": "Software & Technology",
        "primary_bank": "ICICI Bank Corporate NEFT",
        "erp_system": "SAP S/4HANA Finance",
        "description": "High-AOV milestone invoicing with Section 194-O TDS deductions (1.0%) and Net 30 payment terms.",
        "avg_ticket_size": 185000.00,
        "anomaly_types": ["TDS 194-O deduction mismatch", "Fuzzy legal entity name variation", "Future timestamp voucher"],
    },
    {
        "id": 3,
        "name": "Quick Commerce 10-Min Delivery — High-Frequency Batches",
        "sector": "Instant Grocery & Dark Stores",
        "primary_bank": "Axis Bank Instant IMPS",
        "erp_system": "Zoho Books Enterprise",
        "description": "Ultra-high velocity micro-transactions (₹80–₹650) aggregated into hourly settlement batches.",
        "avg_ticket_size": 340.00,
        "anomaly_types": ["Micro-rounding MDR leakage", "Duplicate settlement webhook ID", "T+0 instant settlement split"],
    },
    {
        "id": 4,
        "name": "FinTech Digital Lending NBFC — Daily Loan EMI Disbursals",
        "sector": "Financial Services & Credit",
        "primary_bank": "SBI e-NACH Auto-Debit",
        "erp_system": "Oracle NetSuite Financials",
        "description": "Automated daily loan repayment debits, borrower bounce penalties, and co-lending partner splits.",
        "avg_ticket_size": 8500.00,
        "anomaly_types": ["Duplicate borrower payout attempt", "Unlisted cryptocurrency asset symbol", "Invalid e-mandate UTR"],
    },
    {
        "id": 5,
        "name": "Hospital Network & Diagnostics — TPA Insurance Co-Pay",
        "sector": "Healthcare & Life Sciences",
        "primary_bank": "Kotak Mahindra Bank CMS",
        "erp_system": "SAP Business One",
        "description": "Patient insurance co-pay splits, diagnostic billing, and third-party administrator (TPA) withholdings.",
        "avg_ticket_size": 42000.00,
        "anomaly_types": ["TPA withholding variance > 5%", "Net settlement exceeding gross invoice", "Unregistered lab merchant"],
    },
    {
        "id": 6,
        "name": "EdTech Subscription Platform — Annual Learning Pass",
        "sector": "Education & Online Learning",
        "primary_bank": "HDFC SmartHub",
        "erp_system": "Zoho Books",
        "description": "Semester recurring subscriptions, student EMI plans, and pro-rata withdrawal refund processing.",
        "avg_ticket_size": 24000.00,
        "anomaly_types": ["Pro-rata refund double deduction", "Expired card token authorization", "Missing ERP student invoice"],
    },
    {
        "id": 7,
        "name": "FoodTech Restaurant Marketplace — Multi-Vendor Commission",
        "sector": "Food Delivery & Hospitality",
        "primary_bank": "ICICI E-Collect Virtual",
        "erp_system": "Tally Prime",
        "description": "3-Way revenue split between end customer payments, restaurant net disbursements, and platform commissions.",
        "avg_ticket_size": 520.00,
        "anomaly_types": ["Restaurant take-rate discrepancy", "Midnight order temporal boundary lag", "Duplicate order ID"],
    },
    {
        "id": 8,
        "name": "Ride-Hailing & Mobility Fleet — Driver Wallet Cashouts",
        "sector": "Urban Mobility & Transport",
        "primary_bank": "Axis Bank FastPay",
        "erp_system": "Oracle NetSuite",
        "description": "Real-time driver earnings disbursements, fuel surcharge deductions, and FASTag highway toll reconciliation.",
        "avg_ticket_size": 310.00,
        "anomaly_types": ["Driver payout duplicate batch", "Negative wallet balance settlement", "Bank UTR narration truncated"],
    },
    {
        "id": 9,
        "name": "Cross-Border IT Services Export — FIRC Inward Remittances",
        "sector": "Global Consulting & Export",
        "primary_bank": "Citibank India FX Desk",
        "erp_system": "SAP S/4HANA",
        "description": "Multi-currency wire transfers (USD/EUR to INR) with Foreign Inward Remittance Certificate (FIRC) tracking.",
        "avg_ticket_size": 450000.00,
        "anomaly_types": ["FX conversion spread mismatch", "Unverified Swift MT103 reference", "Section 194-J TDS withholding"],
    },
    {
        "id": 10,
        "name": "Luxury Hotel & Resort Chain — Pre-Auth & Check-Out",
        "sector": "Hospitality & Tourism",
        "primary_bank": "Standard Chartered CMS",
        "erp_system": "Micros Opera / SAP",
        "description": "Two-stage card pre-authorization hold at check-in matched against final consumption checkout invoice.",
        "avg_ticket_size": 38000.00,
        "anomaly_types": ["Uncaptured pre-auth hold variance", "Incidentals fee discrepancy", "Room upgrade tax rate mismatch"],
    },
    {
        "id": 11,
        "name": "Automotive EV Dealership — Vehicle Booking Advances",
        "sector": "Automotive & Clean Energy",
        "primary_bank": "IndusInd Bank CMS",
        "erp_system": "SAP S/4HANA Auto",
        "description": "High-value online vehicle booking token advances (₹50,000) matched to regional dealer delivery challans.",
        "avg_ticket_size": 50000.00,
        "anomaly_types": ["Chassis allocation ID missing", "Cancellation refund fee dispute", "Bank UTR checksum invalid"],
    },
    {
        "id": 12,
        "name": "Freight Logistics & Courier Hub — Cash-on-Delivery (COD)",
        "sector": "Supply Chain & Logistics",
        "primary_bank": "HDFC Bank E-Net",
        "erp_system": "Tally Prime Enterprise",
        "description": "Delivery executive Cash-on-Delivery (COD) cash deposit batching and demurrage storage fee adjustments.",
        "avg_ticket_size": 1850.00,
        "anomaly_types": ["COD short-deposit discrepancy", "Waybill number character transposition", "Missing delivery voucher"],
    },
    {
        "id": 13,
        "name": "Solar Renewable IPP — Government Green Subsidies",
        "sector": "Energy & Infrastructure",
        "primary_bank": "SBI Power CMS",
        "erp_system": "SAP S/4HANA",
        "description": "State DISCOM net-metering grid feed-in revenue and Ministry of New & Renewable Energy (MNRE) subsidies.",
        "avg_ticket_size": 1250000.00,
        "anomaly_types": ["Subsidy credit timing lag > 14 days", "TDS under Section 194-C (2%)", "Inter-state GST IGST variance"],
    },
    {
        "id": 14,
        "name": "Gaming & Esports Platform — In-App Virtual Currency",
        "sector": "Gaming & Entertainment",
        "primary_bank": "Yes Bank Smart Collect",
        "erp_system": "Zoho Books",
        "description": "High-velocity micro-coin bundles (₹99–₹2,999) with automated chargeback and card-testing velocity traps.",
        "avg_ticket_size": 499.00,
        "anomaly_types": ["Chargeback velocity alert", "Invalid payment currency code", "Micro-refund duplicate trigger"],
    },
    {
        "id": 15,
        "name": "Real Estate Developer — RERA Designated Escrow Pool",
        "sector": "Real Estate & Construction",
        "primary_bank": "HDFC Bank RERA Escrow",
        "erp_system": "SAP Real Estate Management",
        "description": "Homebuyer milestone installment payments routed 70% to RERA project escrow and 30% to operational accounts.",
        "avg_ticket_size": 850000.00,
        "anomaly_types": ["RERA 70/30 split ratio violation", "Buyer PAN number mismatch", "Delayed bank credit narration"],
    },
    {
        "id": 16,
        "name": "Pharmaceuticals Wholesale — Drug Batch & E-Way Bills",
        "sector": "Healthcare & Pharma Distribution",
        "primary_bank": "ICICI Bank Trade Online",
        "erp_system": "Tally Prime Pharma",
        "description": "Wholesale medicine distributor invoice settlement, expiry credit notes, and GST E-Way bill reconciliations.",
        "avg_ticket_size": 95000.00,
        "anomaly_types": ["Expiry credit note deduction error", "GST 12% vs 18% slab discrepancy", "Unverified stockist code"],
    },
    {
        "id": 17,
        "name": "Telecom & Fiber Broadband — Bulk Postpaid Mandates",
        "sector": "Telecommunications & ISP",
        "primary_bank": "SBI Corporate Bulk CMS",
        "erp_system": "Oracle NetSuite Telco",
        "description": "Monthly postpaid subscriber bulk bill presentment, recurring e-mandates, and failed debit retry sweeps.",
        "avg_ticket_size": 1199.00,
        "anomaly_types": ["Mandate retry duplicate charge", "Telecom service tax surcharge leak", "Inactive subscriber credit"],
    },
    {
        "id": 18,
        "name": "Omnichannel Retail Supermarket — POS Terminal Swipes",
        "sector": "Brick-and-Mortar & Grocery",
        "primary_bank": "Axis Bank PineLabs Collect",
        "erp_system": "SAP Retail S/4HANA",
        "description": "Physical in-store POS terminal card swipes batch-reconciled against central warehouse ERP inventory ledgers.",
        "avg_ticket_size": 3200.00,
        "anomaly_types": ["POS batch closeout cutoff lag", "Card brand interchange rate delta", "Cashier terminal ID mismatch"],
    },
    {
        "id": 19,
        "name": "OTT Media Streaming Network — Recurring Card Mandates",
        "sector": "Digital Streaming & Media",
        "primary_bank": "HDFC Bank SI Hub",
        "erp_system": "Zoho Books Global",
        "description": "Monthly and annual recurring auto-debit subscriptions with churn recovery and credit card dispute workflows.",
        "avg_ticket_size": 799.00,
        "anomaly_types": ["Cancelled mandate unauthorized charge", "Negative ledger balance", "Bank settlement batch missing"],
    },
    {
        "id": 20,
        "name": "Supply Chain Invoice Factoring — Early Payment Discounting",
        "sector": "Trade Finance & Working Capital",
        "primary_bank": "Kotak Trade Net",
        "erp_system": "SAP S/4HANA Treasury",
        "description": "Tier-1 auto component supplier reverse factoring with early payment cash discount arbitrage (2/10 Net 30).",
        "avg_ticket_size": 650000.00,
        "anomaly_types": ["Early payment discount formula breach", "Vendor double assignment notice", "TDS Section 194-Q flag"],
    },
]


def get_scenario_manifest(scenario_id: int) -> Dict[str, Any]:
    """Retrieve metadata for a specific scenario by ID (1..20)."""
    for s in SCENARIO_CATALOG:
        if s["id"] == scenario_id:
            return s
    return SCENARIO_CATALOG[0]


def generate_vast_4_channel_dataset(scenario_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Generates a vast, hyper-realistic 4-channel financial dataset (60+ records)
    for the selected scenario (or a randomly chosen one from the 20).
    """
    if scenario_id is None or scenario_id < 1 or scenario_id > 20:
        scenario_id = random.randint(1, 20)

    manifest = get_scenario_manifest(scenario_id)
    today = date.today()

    gateway_records = []
    bank_records = []
    erp_records = []
    quarantine_audit_records = []

    # Deterministic seed per scenario for reproducibility and stability
    rnd = random.Random(scenario_id * 1000 + 42)

    total_records = 60
    base_price = Decimal(str(manifest["avg_ticket_size"]))

    # Generate 54 clean records + 4 deliberate Layer 1 anomalies + 2 fuzzy edge cases
    for i in range(1, total_records + 1):
        price_variation = Decimal(str(rnd.uniform(0.75, 1.45)))
        gross = (base_price * price_variation).quantize(Decimal("0.01"))
        
        # MDR Fee standard 2.0% + 18% GST on fee
        fee_pct = Decimal("0.02")
        fee = (gross * fee_pct).quantize(Decimal("0.01"))
        tax = (fee * Decimal("0.18")).quantize(Decimal("0.01"))
        
        # TDS 1% for B2B scenarios, 0% for retail
        is_b2b = manifest["sector"] in ["Software & Technology", "Financial Services & Credit", "Trade Finance & Working Capital", "Energy & Infrastructure"]
        tds = (gross * Decimal("0.01")).quantize(Decimal("0.01")) if is_b2b else Decimal("0.00")
        net = gross - fee - tax - tds

        txn_date = today - timedelta(days=rnd.randint(0, 3))
        bank_date = txn_date + timedelta(days=1)
        
        payment_id = f"pay_{manifest['sector'][:3].upper()}{scenario_id:02d}_{i:04d}_{rnd.randint(1000, 9999)}"
        order_id = f"order_EXP_{scenario_id:02d}_{i:04d}"
        invoice_no = f"INV-{today.year}-{scenario_id:02d}{i:04d}"
        utr_no = f"UTR{scenario_id:02d}{today.strftime('%Y%m%d')}{i:05d}{rnd.randint(100, 999)}"
        merchant_name = f"{manifest['name'].split('—')[0].strip()} Entities Ltd"

        # --- Injected Anomalies (4 deliberate Layer 1 traps) ---
        if i == 14:
            # Anomaly 1: IMPOSSIBLE_VALUE (Negative Amount)
            gross = Decimal("-5000.00")
            net = Decimal("-5000.00")
            quarantine_audit_records.append({
                "record_id": f"QR_ANOMALY_01_{scenario_id}",
                "transaction_id": payment_id,
                "reason_code": "IMPOSSIBLE_VALUE",
                "reason_detail": f"Settlement amount cannot be negative ({gross} INR) for standard capture.",
                "flagged_by": "Layer 1 Deterministic Rules Engine",
                "amount": str(gross),
                "channel": "Channel 1 (Gateway)",
            })
        elif i == 28:
            # Anomaly 2: INVALID_CURRENCY (Unsupported Token)
            currency_code = "BTC"
            quarantine_audit_records.append({
                "record_id": f"QR_ANOMALY_02_{scenario_id}",
                "transaction_id": payment_id,
                "reason_code": "INVALID_CURRENCY",
                "reason_detail": f"Currency code 'BTC' is not in whitelisted settlement currencies (INR, USD, EUR, GBP).",
                "flagged_by": "Layer 1 Deterministic Rules Engine",
                "amount": str(gross),
                "channel": "Channel 1 (Gateway)",
            })
        elif i == 39:
            # Anomaly 3: DUPLICATE_ID (Repeated Payment ID)
            payment_id = f"pay_{manifest['sector'][:3].upper()}{scenario_id:02d}_0001_DUP"
            quarantine_audit_records.append({
                "record_id": f"QR_ANOMALY_03_{scenario_id}",
                "transaction_id": payment_id,
                "reason_code": "DUPLICATE_ID",
                "reason_detail": f"Payment ID {payment_id} already recorded in active settlement batch.",
                "flagged_by": "Layer 1 Deterministic Rules Engine",
                "amount": str(gross),
                "channel": "Channel 1 (Gateway)",
            })
        elif i == 47:
            # Anomaly 4: MATHEMATICAL_INCONSISTENCY (Net > Gross)
            net = gross + Decimal("1500.00")
            quarantine_audit_records.append({
                "record_id": f"QR_ANOMALY_04_{scenario_id}",
                "transaction_id": payment_id,
                "reason_code": "MATHEMATICAL_INCONSISTENCY",
                "reason_detail": f"Net settlement amount (₹{net}) cannot exceed gross invoice value (₹{gross}).",
                "flagged_by": "Layer 1 Deterministic Rules Engine",
                "amount": str(net),
                "channel": "Channel 2 (Bank Statement)",
            })

        # Channel 1: Razorpay Gateway Record
        gateway_records.append({
            "transaction_id": payment_id,
            "payment_id": payment_id,
            "order_id": order_id,
            "invoice_number": invoice_no,
            "utr_number": utr_no,
            "gross_amount": str(gross),
            "fee": str(fee),
            "tax": str(tax),
            "tds_194o": str(tds),
            "net_amount": str(net),
            "currency": "INR",
            "method": rnd.choice(["upi", "card", "netbanking", "nach"]),
            "settled_at": txn_date.isoformat(),
            "settlement_date": txn_date.isoformat(),
            "status": "settled" if i not in (14, 28, 39, 47) else "quarantined",
            "merchant_name": merchant_name,
        })

        # Channel 2: Bank Statement Record
        narration_sample = f"CMS/{utr_no}/RAZORPAYSETTLE/{manifest['primary_bank'].split()[0].upper()}"
        bank_records.append({
            "transaction_id": f"BANK-TXN-{scenario_id:02d}-{i:04d}",
            "utr_number": utr_no,
            "chq_ref_no": utr_no,
            "booking_date": bank_date.isoformat(),
            "value_date": bank_date.isoformat(),
            "settlement_date": bank_date.isoformat(),
            "narration": narration_sample,
            "deposit_amount": str(net),
            "net_amount": str(net),
            "bank_name": manifest["primary_bank"],
            "currency": "INR",
        })

        # Channel 3: ERP General Ledger Record
        erp_records.append({
            "transaction_id": f"ERP-VOUCHER-{scenario_id:02d}-{i:04d}",
            "voucher_number": invoice_no,
            "order_id": order_id,
            "payment_id": payment_id,
            "voucher_date": txn_date.isoformat(),
            "settlement_date": txn_date.isoformat(),
            "merchant_legal_name": merchant_name if i != 53 else f"{merchant_name} (India)", # Fuzzy match on #53
            "gross_invoice_value": str(gross),
            "gross_amount": str(gross),
            "gst_rate": "18.00%",
            "tax_deducted_at_source": str(tds),
            "accounting_system": manifest["erp_system"],
            "currency": "INR",
        })

    return {
        "scenario_id": scenario_id,
        "scenario_name": manifest["name"],
        "sector": manifest["sector"],
        "primary_bank": manifest["primary_bank"],
        "erp_system": manifest["erp_system"],
        "description": manifest["description"],
        "record_counts": {
            "channel_1_gateway": len(gateway_records),
            "channel_2_bank": len(bank_records),
            "channel_3_erp": len(erp_records),
            "channel_4_quarantine": len(quarantine_audit_records),
            "total_records": total_records,
        },
        "gateway_records": gateway_records,
        "bank_records": bank_records,
        "erp_records": erp_records,
        "quarantine_records": quarantine_audit_records,
    }
