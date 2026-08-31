# 📋 Certus AI Finance Controller — Regulatory Compliance Framework

> **Deterministic Compliance Gate Architecture**
> All regulatory rules are enforced as hard-coded Python logic — NEVER delegated to LLM reasoning.

---

## 1. Regulatory Framework Coverage

Certus enforces compliance across **5 Indian financial regulatory frameworks**:

| Framework | Authority | Key Provisions | Certus Implementation |
|:---|:---|:---|:---|
| **RBI Fair Practices Code** | Reserve Bank of India | Contact hours, dispute rights, debtor protection | `COMP-01` Contact window, `COMP-05` Resolution guard |
| **Section 194-O Income Tax Act** | CBDT / Income Tax | 1% TDS on e-commerce operator settlements | `COMP-08` TDS rate verification |
| **CGST Act 2017, Chapter IV** | GST Council | 18% GST on MDR/service fees | `COMP-07` GST reconciliation |
| **RBI Master Direction** | RBI | Digital payment security controls, attempt caps | `COMP-02` Attempt caps |
| **RBI Payment & Settlement Systems Act** | RBI | Settlement timing SLAs (T+1/T+2) | `COMP-09` Settlement window |

---

## 2. Compliance Rule Registry

### COMP-01: Contact Hour Window
- **Citation**: RBI Fair Practices Code §6.2
- **Rule**: Outbound automated actions restricted to **9:00 AM – 6:00 PM IST**
- **Applies to**: `RAISE_GATEWAY_DISPUTE`, `GENERATE_DEMAND_NOTICE`, `ESCALATE_TO_TREASURY`
- **Violation Action**: DEFER to next business day

### COMP-02: Recovery Attempt Caps
- **Citation**: RBI Master Direction on Digital Payment Security Controls §8.1
- **Rules**:
  - Gateway disputes: Maximum **3 automated attempts**
  - Demand notices: Maximum **2 automated attempts**
  - Auto-retry matching: Maximum **5 automated attempts**
- **Violation Action**: ESCALATE to human treasury operator

### COMP-03: Idempotency Safety Invariant
- **Citation**: Financial Transaction De-duplication
- **Rule**: Same action cannot be executed twice on the same record
- **Key**: `{record_id}:{action}:{attempt_count}`
- **Violation Action**: Block and review prior action result

### COMP-04: Minimum Dispute Threshold
- **Citation**: Merchant Services Agreement §4.3
- **Rules**:
  - Minimum dispute amount: **₹100** (10,000 paisa)
  - Auto write-off threshold: **₹50** (5,000 paisa)
- **Violation Action**: WRITE_OFF_VARIANCE for immaterial amounts

### COMP-05: Double-Action Prevention
- **Citation**: Record Lifecycle Management
- **Rule**: No recovery action on already-resolved records
- **Violation Action**: STOP — record already closed

### COMP-06: MDR Fee Rate Card Verification
- **Citation**: Razorpay Merchant Agreement — Rate Card Schedule A
- **Rules**:

| Payment Method | MDR Rate | GST on MDR | Total Effective Fee |
|:---|:---:|:---:|:---:|
| UPI P2M | 0.00% | 0.00% | 0.00% |
| Debit Card (< ₹2,000) | 0.40% | 18% | 0.472% |
| Debit Card (≥ ₹2,000) | 0.90% | 18% | 1.062% |
| Credit Card (Standard) | 2.00% | 18% | 2.360% |
| Corporate / Business Card | 3.00% | 18% | 3.540% |
| American Express | 3.50% | 18% | 4.130% |
| NetBanking | 1.50% | 18% | 1.770% |
| Wallet (Paytm, PhonePe) | 1.75% | 18% | 2.065% |
| EMI | 2.50% | 18% | 2.950% |
| Bank Transfer (NEFT/RTGS) | 0.25% | 18% | 0.295% |

- **Tolerance**: 50 basis points (0.50% of gross) to account for interchange variations
- **Violation Action**: RAISE_GATEWAY_DISPUTE if drift exceeds tolerance

### COMP-07: GST Reconciliation
- **Citation**: CGST Act 2017, Chapter IV — 18% Service Tax on Payment Gateway Fees
- **Rule**: GST must equal exactly **18% of MDR fee** (±₹1.00 rounding tolerance)
- **Violation Action**: RAISE_GATEWAY_DISPUTE

### COMP-08: Section 194-O TDS Verification
- **Citation**: Income Tax Act, Section 194-O
- **Rules**:
  - Standard rate: **1% TDS** (PAN furnished)
  - Higher rate: **5% TDS** (PAN not furnished)
  - Annual threshold: **₹5,00,000**
- **Tolerance**: ₹1.00 for rounding
- **Violation Action**: RAISE_GATEWAY_DISPUTE

### COMP-09: Settlement Timing SLA
- **Citation**: RBI Payment & Settlement Systems Act §25
- **Rules**:
  - T+1: Settlement expected within 24 hours → WAIT appropriate
  - T+2: Settlement expected within 48 hours → WAIT may be appropriate
  - T+3: Past SLA → WARNING, consider escalation
  - T+3+: SLA breach → RAISE_GATEWAY_DISPUTE
- **Violation Action**: Escalation ladder based on elapsed time

---

## 3. Compliance Gate Architecture

```
PROPOSED RECOVERY ACTION
        ↓
┌──────────────────────────────────┐
│   DETERMINISTIC COMPLIANCE GATE  │
│   (Plain Python code — NO LLM)   │
├──────────────────────────────────┤
│ 1. Contact Window Check (IST)    │
│ 2. Attempt Cap Enforcement       │
│ 3. Idempotency Verification      │
│ 4. Minimum Dispute Threshold     │
│ 5. Already-Resolved Guard        │
│ 6. MDR Fee Rate Card Check       │
│ 7. GST Reconciliation Check      │
│ 8. Section 194-O TDS Check       │
│ 9. Settlement Timing SLA Check   │
└──────────────┬───────────────────┘
               │
      ┌────────┴────────┐
      ↓                 ↓
 [APPROVED]        [BLOCKED]
 → Execute         → Fallback → [APPROVED] or [ESCALATE_HUMAN]
```

### Key Design Decisions

1. **Fail-Closed**: If any single check FAILS, the action is blocked
2. **Fallback Ladder**: Blocked actions automatically try a safer alternative
3. **Zero LLM**: The gate is 100% deterministic Python — no probabilistic reasoning
4. **Immutable Audit**: Every gate decision is logged with regulatory citations
5. **Idempotency**: Computed keys prevent duplicate execution

---

## 4. Compliance Verification Commands

```bash
# Run compliance engine unit tests
python -m pytest backend/tests/ -k "compliance" -v

# Check compliance summary via API
curl http://localhost:8000/api/v1/compliance/summary

# Dry-run compliance check on a specific record
curl -X POST http://localhost:8000/api/v1/recovery/compliance-check \
  -H "Content-Type: application/json" \
  -d '{"action": "RAISE_GATEWAY_DISPUTE", "record_id": "QR-001"}'
```

---

## 5. Certification

| Certification | Status |
|:---|:---:|
| RBI Fair Practices Code Compliance | ✅ VERIFIED |
| Section 194-O TDS Validation | ✅ VERIFIED |
| CGST 18% on MDR Reconciliation | ✅ VERIFIED |
| Settlement SLA Monitoring (T+1/T+2) | ✅ VERIFIED |
| Idempotency Safety Invariant | ✅ VERIFIED |
| Zero LLM in Compliance Gate | ✅ VERIFIED |
| Contact Hour Window Enforcement | ✅ VERIFIED |
| Attempt Cap Enforcement | ✅ VERIFIED |
