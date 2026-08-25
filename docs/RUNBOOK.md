# 📘 Certus AI Finance Controller — Controller Incident Runbook

This runbook outlines standard operating procedures (SOPs) for financial controllers, treasury operators, and compliance leads when investigating discrepancies and quarantine exceptions.

---

## 📋 Standard Operating Procedures Index

- **SOP-01**: Handling Payment Gateway MDR Fee Deviations (`UNAUTHORIZED_MDR`)
- **SOP-02**: Resolving Bank Settlement Inflow Missing UTR References (`MISSING_UTR`)
- **SOP-03**: Reconciling Unposted ERP Sales Journal Vouchers (`ERP_UNPOSTED`)
- **SOP-04**: Handling Net Credit Exceeding Gross Settlement (`NET_GT_GROSS`)

---

### SOP-01: Payment Gateway MDR Fee Deviations
* **Trigger Code**: `UNAUTHORIZED_MDR` / Rule #08
* **Symptom**: Net settlement credited to corporate bank account is lower than the contracted rate card calculation ($2.0\% + 18\%\text{ GST}$).
* **Diagnostic Procedure**:
  1. Open **Tab 2 (Quarantine & Exceptions)** and locate the flagged record ID (e.g. `QR-001-MDR`).
  2. Inspect the **Fee Variance Breakdown**:
     - $\text{Expected Fee} = \text{Gross} \times 0.02 \times 1.18$
     - $\text{Actual Fee} = \text{Gross} - \text{Net Bank Credit}$
  3. If the fee delta is due to an authorized international card surcharge or AMEX interchange rate:
     - Click **Review & Resolve** ➔ Select **Write-Off Gateway MDR Fee Variance**.
     - Allocate the variance to General Ledger Account `#5021 (Gateway Processing Expense)`.
  4. If the fee delta is unauthorized by the contract:
     - Click **Open Dispute Ticket** to export the audited settlement batch memo for Razorpay merchant support.

---

### SOP-02: Missing Banking UTR Checksums
* **Trigger Code**: `MISSING_UTR` / Rule #14
* **Symptom**: Razorpay gateway status is `captured`, but no 16-digit or 22-digit UTR reference exists in the bank CMS statement.
* **Diagnostic Procedure**:
  1. Check if the transaction timestamp falls within the active T+1 settlement window.
  2. Search the bank statement narration lines using **Tab 4 (Autonomous Copilot)**:
     - Prompt: *"Verify bank UTR references for all transactions above ₹10,000"*.
  3. Once the CMS statement is updated by the bank at end-of-day cutoff (23:30 IST):
     - Click **Accept & Force Reconcile Override** with the confirmed CMS reference.

---

### SOP-03: Unposted ERP Sales Journal Vouchers
* **Trigger Code**: `ERP_UNPOSTED` / Rule #22
* **Symptom**: Payment received and matched across gateway and bank, but ERP invoice is in `draft` state with zero general ledger credit.
* **Diagnostic Procedure**:
  1. Open **Tab 2 (Quarantine & Exceptions)** ➔ Select `ERP_UNPOSTED` filter.
  2. Verify that customer tax ID and GST state code match the invoice header.
  3. Click **Review & Resolve** ➔ Select **Approve ERP Journal Posting** to trigger automated clearing in Tally / SAP.

---

### SOP-04: Net Settlement Exceeding Gross Amount
* **Trigger Code**: `NET_GT_GROSS` / Rule #01
* **Symptom**: Bank credit is greater than the invoiced gross amount (trapped by fail-closed invariant gate).
* **Diagnostic Procedure**:
  1. **DO NOT AUTO-RECONCILE**. This indicates a batch consolidation or duplicate refund reversal.
  2. Inspect the settlement batch narration for multi-order grouping.
  3. Decompose the combined credit into individual order lines before manual sign-off.
