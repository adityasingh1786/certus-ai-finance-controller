"""
AI Finance Controller — 20 Enterprise Synthetic Dataset Registry & 4-Channel Generator

Provides 20 vast, hyper-realistic, enterprise financial scenarios across 4 channels:
  1. Channel 1: Razorpay Gateway Instant Capture / Settlement Stream (Native 20-col format)
  2. Channel 2: Bank Statements (HDFC, ICICI, SBI, Axis, Kotak CMS/NEFT/RTGS)
  3. Channel 3: ERP General Ledgers (SAP S/4HANA, Tally Prime, Zoho Books, NetSuite)
  4. Channel 4: Audit & Quarantine Exception Stream (Pre-isolated Layer 1 traps)

STANDARDIZED TAXONOMY:
  - Dataset 01 (Code: 01) to Dataset 20 (Code: 20)
  - Clean IDs: TXN-DS{ID:02d}-####, INV-DS{ID:02d}-####, UTR-DS{ID:02d}-YYYYMMDD-####, QR-DS{ID:02d}-###
"""

import random
from datetime import date, timedelta
from decimal import Decimal
from typing import Dict, List, Any, Optional

SCENARIO_CATALOG: List[Dict[str, Any]] = [
    {
        "id": 1,
        "code": "01",
        "name": "Dataset 1 (Code: 01) — D2C Fashion & Apparel Festive Flash Sale",
        "short_name": "D2C Fashion Flash Sale",
        "sector": "E-Commerce & Retail",
        "primary_bank": "HDFC Bank CMS",
        "erp_system": "Tally Prime 4.0",
        "description": "High-volume UPI & credit card sales spike with standard 2.0% MDR + 18% GST deductions.",
        "avg_ticket_size": 2499.00,
        "anomaly_types": ["MDR fee deviation > 50 bps", "Negative amount refund trap", "Missing bank settlement credit"],
    },
    {
        "id": 2,
        "code": "02",
        "name": "Dataset 2 (Code: 02) — B2B Enterprise SaaS Annual Contract Billing",
        "short_name": "B2B Enterprise SaaS",
        "sector": "Software & Technology",
        "primary_bank": "ICICI Corporate NEFT",
        "erp_system": "SAP S/4HANA Finance",
        "description": "High-AOV milestone invoicing with Section 194-O TDS deductions (1.0%) and Net 30 payment terms.",
        "avg_ticket_size": 185000.00,
        "anomaly_types": ["TDS 194-O deduction mismatch", "Fuzzy legal entity name variation", "Future timestamp voucher"],
    },
    {
        "id": 3,
        "code": "03",
        "name": "Dataset 3 (Code: 03) — Quick Commerce 10-Min Delivery Hourly Batches",
        "short_name": "Quick Commerce Delivery",
        "sector": "Instant Grocery",
        "primary_bank": "Axis Instant IMPS",
        "erp_system": "Zoho Books Enterprise",
        "description": "Ultra-high velocity micro-transactions (₹80–₹650) aggregated into hourly settlement batches.",
        "avg_ticket_size": 340.00,
        "anomaly_types": ["Micro-rounding MDR leakage", "Duplicate settlement webhook ID", "T+0 instant settlement split"],
    },
    {
        "id": 4,
        "code": "04",
        "name": "Dataset 4 (Code: 04) — FinTech NBFC Daily Loan EMI Auto-Debits",
        "short_name": "FinTech NBFC Lending",
        "sector": "Financial Services",
        "primary_bank": "SBI e-NACH Auto-Debit",
        "erp_system": "Oracle NetSuite",
        "description": "Automated daily loan repayment debits, borrower bounce penalties, and co-lending partner splits.",
        "avg_ticket_size": 8500.00,
        "anomaly_types": ["Duplicate borrower payout attempt", "Unlisted cryptocurrency asset symbol", "Invalid e-mandate UTR"],
    },
    {
        "id": 5,
        "code": "05",
        "name": "Dataset 5 (Code: 05) — Hospital Diagnostics & TPA Insurance Co-Pay",
        "short_name": "Hospital Network & TPA",
        "sector": "Healthcare",
        "primary_bank": "Kotak Mahindra CMS",
        "erp_system": "SAP Business One",
        "description": "Patient insurance co-pay splits, diagnostic billing, and third-party administrator (TPA) withholdings.",
        "avg_ticket_size": 42000.00,
        "anomaly_types": ["TPA withholding variance > 5%", "Net settlement exceeding gross invoice", "Unregistered lab merchant"],
    },
    {
        "id": 6,
        "code": "06",
        "name": "Dataset 6 (Code: 06) — EdTech Subscription Learning Pass Renewals",
        "short_name": "EdTech Platform Subs",
        "sector": "Education",
        "primary_bank": "HDFC SmartHub",
        "erp_system": "Zoho Books",
        "description": "Semester recurring subscriptions, student EMI plans, and pro-rata withdrawal refund processing.",
        "avg_ticket_size": 24000.00,
        "anomaly_types": ["Pro-rata refund double deduction", "Expired card token authorization", "Missing ERP student invoice"],
    },
    {
        "id": 7,
        "code": "07",
        "name": "Dataset 7 (Code: 07) — FoodTech Marketplace Multi-Vendor Commission",
        "short_name": "FoodTech Marketplace",
        "sector": "Food Delivery",
        "primary_bank": "ICICI Bank CMS",
        "erp_system": "Tally Prime 4.0",
        "description": "3-Way revenue split between end customer payments, restaurant net disbursements, and platform commissions.",
        "avg_ticket_size": 520.00,
        "anomaly_types": ["Restaurant take-rate discrepancy", "Midnight order temporal boundary lag", "Duplicate order ID"],
    },
    {
        "id": 8,
        "code": "08",
        "name": "Dataset 8 (Code: 08) — Mobility Fleet Driver Wallet Instant Cashouts",
        "short_name": "Ride-Hailing & Fleet",
        "sector": "Urban Mobility",
        "primary_bank": "Axis Bank Corporate",
        "erp_system": "Custom Postgres GL",
        "description": "Real-time driver earnings disbursements, fuel surcharge deductions, and FASTag highway toll reconciliation.",
        "avg_ticket_size": 310.00,
        "anomaly_types": ["Driver payout duplicate batch", "Negative wallet balance settlement", "Bank UTR narration truncated"],
    },
    {
        "id": 9,
        "code": "09",
        "name": "Dataset 9 (Code: 09) — Cross-Border IT Export FIRC Remittances",
        "short_name": "Cross-Border IT Export",
        "sector": "Global Export",
        "primary_bank": "Citibank N.A. FIRC",
        "erp_system": "Oracle Fusion Cloud",
        "description": "Multi-currency inward remittances (USD/EUR) with Foreign Inward Remittance Certificate (FIRC) validation.",
        "avg_ticket_size": 485000.00,
        "anomaly_types": ["FX conversion spread mismatch > 15 bps", "Missing FIRC certificate number", "Nostro-Vostro clearance lag"],
    },
    {
        "id": 10,
        "code": "10",
        "name": "Dataset 10 (Code: 10) — Luxury Hospitality Pre-Auth & Folio Checkout",
        "short_name": "Luxury Hotel & Resort",
        "sector": "Hospitality",
        "primary_bank": "HDFC Bank CMS",
        "erp_system": "Opera Cloud ERP",
        "description": "Room booking pre-authorizations, minibar incremental charges, and delayed checkout deposit captures.",
        "avg_ticket_size": 38000.00,
        "anomaly_types": ["Pre-auth vs final capture variance", "Split guest folio unallocated credit", "Delayed card terminal closeout"],
    },
    {
        "id": 11,
        "code": "11",
        "name": "Dataset 11 (Code: 11) — Automotive EV Dealership Vehicle Booking Advances",
        "short_name": "Automotive EV Dealership",
        "sector": "Automotive",
        "primary_bank": "SBI Corporate Banking",
        "erp_system": "SAP S/4HANA Auto",
        "description": "High-value advance booking tokens (₹25k–₹1L), subsidized FAME-II government incentives, and RTO tax escrows.",
        "avg_ticket_size": 75000.00,
        "anomaly_types": ["Booking cancellation refund penalty", "FAME-II subsidy lag > 30 days", "Chassis allocation voucher mismatch"],
    },
    {
        "id": 12,
        "code": "12",
        "name": "Dataset 12 (Code: 12) — Freight Logistics Cash-on-Delivery Hub Remittance",
        "short_name": "Freight Logistics COD",
        "sector": "Logistics",
        "primary_bank": "ICICI Bank CMS",
        "erp_system": "Tally Prime Logistics",
        "description": "Delivery courier physical cash collection, delivery boy app reconciliation, and merchant COD remittances.",
        "avg_ticket_size": 1850.00,
        "anomaly_types": ["COD cash handover physical shortage", "Courier freight charge dispute", "Waybill tracking ID collision"],
    },
    {
        "id": 13,
        "code": "13",
        "name": "Dataset 13 (Code: 13) — Solar Renewable IPP State DISCOM Feed-In Subsidies",
        "short_name": "Solar Clean Energy",
        "sector": "Clean Energy",
        "primary_bank": "Power Finance Corp",
        "erp_system": "SAP S/4HANA Energy",
        "description": "State DISCOM net-metering grid feed-in revenue and Ministry of New & Renewable Energy (MNRE) subsidies.",
        "avg_ticket_size": 1250000.00,
        "anomaly_types": ["Subsidy credit timing lag > 14 days", "TDS under Section 194-C (2%)", "Inter-state GST IGST variance"],
    },
    {
        "id": 14,
        "code": "14",
        "name": "Dataset 14 (Code: 14) — Gaming & Esports Virtual Currency In-App Tokens",
        "short_name": "Gaming Virtual Currency",
        "sector": "Gaming",
        "primary_bank": "Yes Bank Smart Collect",
        "erp_system": "Custom Postgres Ledger",
        "description": "High-velocity micro-coin bundles (₹99–₹2,999) with automated chargeback and card-testing velocity traps.",
        "avg_ticket_size": 499.00,
        "anomaly_types": ["Chargeback velocity alert", "Invalid payment currency code", "Micro-refund duplicate trigger"],
    },
    {
        "id": 15,
        "code": "15",
        "name": "Dataset 15 (Code: 15) — Real Estate RERA Designated Project Escrow Pool",
        "short_name": "Real Estate RERA Escrow",
        "sector": "Real Estate",
        "primary_bank": "HDFC Bank Escrow",
        "erp_system": "NetSuite Real Estate",
        "description": "Homebuyer milestone installment payments routed 70% to RERA project escrow and 30% to operational accounts.",
        "avg_ticket_size": 850000.00,
        "anomaly_types": ["RERA 70/30 split ratio violation", "Buyer PAN number mismatch", "Delayed bank credit narration"],
    },
    {
        "id": 16,
        "code": "16",
        "name": "Dataset 16 (Code: 16) — Pharmaceuticals Wholesale Drug Batch & E-Way Bills",
        "short_name": "Pharma Wholesale",
        "sector": "Pharmaceuticals",
        "primary_bank": "Kotak Mahindra Bank",
        "erp_system": "SAP S/4HANA Pharma",
        "description": "Wholesale medicine distributor invoice settlement, expiry credit notes, and GST E-Way bill reconciliations.",
        "avg_ticket_size": 95000.00,
        "anomaly_types": ["Expiry credit note deduction error", "GST 12% vs 18% slab discrepancy", "Unverified stockist code"],
    },
    {
        "id": 17,
        "code": "17",
        "name": "Dataset 17 (Code: 17) — Telecom Broadband Bulk Postpaid Mandate Sweeps",
        "short_name": "Telecom Bulk Mandates",
        "sector": "Telecom",
        "primary_bank": "SBI Bulk CMS",
        "erp_system": "Oracle BRM Telco",
        "description": "Monthly postpaid subscriber bulk bill presentment, recurring e-mandates, and failed debit retry sweeps.",
        "avg_ticket_size": 1199.00,
        "anomaly_types": ["Mandate retry duplicate charge", "Telecom service tax surcharge leak", "Inactive subscriber credit"],
    },
    {
        "id": 18,
        "code": "18",
        "name": "Dataset 18 (Code: 18) — Omnichannel Supermarket In-Store POS Card Swipes",
        "short_name": "Omnichannel Retail POS",
        "sector": "Retail POS",
        "primary_bank": "Axis PineLabs Collect",
        "erp_system": "SAP Retail S/4HANA",
        "description": "Physical in-store POS terminal card swipes batch-reconciled against central warehouse ERP inventory ledgers.",
        "avg_ticket_size": 3200.00,
        "anomaly_types": ["POS batch closeout cutoff lag", "Card brand interchange rate delta", "Cashier terminal ID mismatch"],
    },
    {
        "id": 19,
        "code": "19",
        "name": "Dataset 19 (Code: 19) — OTT Media Streaming Recurring Auto-Debit Mandates",
        "short_name": "OTT Media Streaming",
        "sector": "Media Streaming",
        "primary_bank": "HDFC Bank SI Hub",
        "erp_system": "Chargebee GL",
        "description": "Monthly and annual recurring auto-debit subscriptions with churn recovery and credit card dispute workflows.",
        "avg_ticket_size": 799.00,
        "anomaly_types": ["Cancelled mandate unauthorized charge", "Negative ledger balance", "Bank settlement batch missing"],
    },
    {
        "id": 20,
        "code": "20",
        "name": "Dataset 20 (Code: 20) — Supply Chain Reverse Factoring Early Discounting",
        "short_name": "Supply Chain Factoring",
        "sector": "Trade Finance",
        "primary_bank": "ICICI TReDS Platform",
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
    Generates a vast, hyper-realistic 4-channel financial dataset (60 records)
    with clean, standardized ID taxonomy:
      TXN-DS{ID:02d}-####, INV-DS{ID:02d}-####, UTR-DS{ID:02d}-YYYYMMDD-####, QR-DS{ID:02d}-###
    """
    if scenario_id is None or scenario_id < 1 or scenario_id > 20:
        scenario_id = 1

    manifest = get_scenario_manifest(scenario_id)
    today = date.today()

    gateway_records = []
    bank_records = []
    erp_records = []
    quarantine_audit_records = []

    # Deterministic seed per scenario for 100% reproducibility across all hubs
    rnd = random.Random(scenario_id * 1000 + 42)

    total_records = 60
    base_price = Decimal(str(manifest["avg_ticket_size"]))
    sc_prefix = f"DS{scenario_id:02d}"

    # Generate 54 clean records + 4 deliberate Layer 1 anomalies + 2 fuzzy edge cases
    for i in range(1, total_records + 1):
        price_variation = Decimal(str(rnd.uniform(0.75, 1.45)))
        gross = (base_price * price_variation).quantize(Decimal("0.01"))

        # MDR Fee standard 2.0% + 18% GST on fee
        fee_pct = Decimal("0.02")
        fee = (gross * fee_pct).quantize(Decimal("0.01"))
        tax = (fee * Decimal("0.18")).quantize(Decimal("0.01"))

        # TDS 1% for B2B scenarios, 0% for retail
        is_b2b = manifest["sector"] in ["Software & Technology", "Financial Services", "Trade Finance", "Clean Energy"]
        tds = (gross * Decimal("0.01")).quantize(Decimal("0.01")) if is_b2b else Decimal("0.00")
        net = gross - fee - tax - tds

        txn_date = today - timedelta(days=rnd.randint(0, 3))
        bank_date = txn_date + timedelta(days=1)

        payment_id = f"pay_{sc_prefix}_{i:04d}"
        txn_id = f"TXN-{sc_prefix}-{i:04d}"
        order_id = f"order_{sc_prefix}_{i:04d}"
        invoice_no = f"INV-{sc_prefix}-{i:04d}"
        utr_no = f"UTR-{sc_prefix}-{today.strftime('%Y%m%d')}-{i:04d}"
        merchant_name = f"{manifest['short_name']} Entities Ltd"

        # --- Injected Anomalies (4 deliberate Layer 1 traps with exact clean IDs) ---
        if i == 14:
            # Anomaly 1: UNAUTHORIZED_MDR (Fee deviation)
            fee_deviant = (gross * Decimal("0.025")).quantize(Decimal("0.01"))  # 2.5% instead of 2.0%
            fee_delta = fee_deviant - fee
            quarantine_audit_records.append({
                "record_id": f"QR-{sc_prefix}-001",
                "transaction_id": txn_id,
                "reason_code": "UNAUTHORIZED_MDR",
                "reason_detail": f"Bank deduction fee rate is 2.50% (expected 2.0% + 18% GST). Delta of ₹{fee_delta} exceeds 50 bps tolerance.",
                "flagged_by": "Layer 1 Deterministic Rules Engine",
                "gross_amount": float(gross),
                "discrepancy_amount": float(fee_delta),
                "channel": "Channel 1 (Gateway ↔ Bank)",
                "is_resolved": False,
            })
        elif i == 28:
            # Anomaly 2: MISSING_UTR
            quarantine_audit_records.append({
                "record_id": f"QR-{sc_prefix}-002",
                "transaction_id": txn_id,
                "reason_code": "MISSING_UTR",
                "reason_detail": f"Gateway payment completed, but 16-digit Bank UTR is absent in {manifest['primary_bank']} settlement batch.",
                "flagged_by": "Bank Ingest Pipeline",
                "gross_amount": float(gross),
                "discrepancy_amount": float(gross),
                "channel": "Channel 2 (Bank CMS)",
                "is_resolved": False,
            })
        elif i == 39:
            # Anomaly 3: ERP_UNPOSTED
            quarantine_audit_records.append({
                "record_id": f"QR-{sc_prefix}-003",
                "transaction_id": txn_id,
                "reason_code": "ERP_UNPOSTED",
                "reason_detail": f"Sales invoice posted under draft status without matching general ledger journal credit voucher in {manifest['erp_system']}.",
                "flagged_by": "ERP Connector",
                "gross_amount": float(gross),
                "discrepancy_amount": float(gross),
                "channel": "Channel 3 (ERP General Ledger)",
                "is_resolved": False,
            })
        elif i == 47:
            # Anomaly 4: NET_GT_GROSS
            net_inflated = gross + Decimal("1500.00")
            quarantine_audit_records.append({
                "record_id": f"QR-{sc_prefix}-004",
                "transaction_id": txn_id,
                "reason_code": "NET_GT_GROSS",
                "reason_detail": f"Net settlement credit received (₹{net_inflated}) exceeds gross invoice value (₹{gross}). Trapped fail-closed.",
                "flagged_by": "Deterministic Invariant Gate",
                "gross_amount": float(gross),
                "discrepancy_amount": 1500.0,
                "channel": "Channel 1 (Gateway)",
                "is_resolved": False,
            })

        # Build Channel 1: Razorpay Gateway Settlement Record (Official 20-col schema)
        gateway_records.append({
            "entity_id": payment_id,
            "transaction_id": txn_id,
            "order_id": order_id,
            "amount": float(gross),
            "fee": float(fee),
            "tax": float(tax),
            "tds": float(tds),
            "net": float(net),
            "currency": "INR",
            "status": "captured",
            "method": "upi" if i % 2 == 0 else "card",
            "created_at": txn_date.isoformat(),
            "settlement_id": f"setl_{sc_prefix}_{i:04d}",
            "settlement_utr": utr_no if i != 28 else "",
            "merchant_name": merchant_name,
        })

        # Build Channel 2: Bank Statement (CMS / NEFT / RTGS)
        bank_records.append({
            "bank_reference": utr_no if i != 28 else f"REF-UNASSIGNED-{sc_prefix}-{i:04d}",
            "transaction_id": txn_id,
            "deposit_date": bank_date.isoformat(),
            "bank_name": manifest["primary_bank"],
            "account_number": f"9182{scenario_id:02d}819283",
            "credit_amount": float(net) if i != 47 else float(gross + Decimal("1500.00")),
            "debit_amount": 0.0,
            "narration": f"CMS/RAZORPAY SETL/{payment_id}/{utr_no}/{merchant_name}",
            "clearing_status": "CLEARED" if i != 28 else "PENDING_UTR",
        })

        # Build Channel 3: ERP General Ledger Voucher
        erp_records.append({
            "invoice_number": invoice_no,
            "transaction_id": txn_id,
            "voucher_type": "Sales Invoice",
            "posting_date": txn_date.isoformat(),
            "erp_system": manifest["erp_system"],
            "gross_revenue": float(gross),
            "tax_ledger": "Output GST 18%",
            "customer_name": f"Customer {sc_prefix}-{i:04d}",
            "ledger_status": "POSTED" if i != 39 else "DRAFT_UNPOSTED",
        })

    return {
        "scenario": manifest,
        "scenario_id": scenario_id,
        "scenario_name": manifest["name"],
        "sector": manifest["sector"],
        "primary_bank": manifest["primary_bank"],
        "erp_system": manifest["erp_system"],
        "gateway_records": gateway_records,
        "bank_records": bank_records,
        "erp_records": erp_records,
        "quarantine_audit_records": quarantine_audit_records,
        "total_records": total_records,
        "as_of_date": today.isoformat(),
    }
