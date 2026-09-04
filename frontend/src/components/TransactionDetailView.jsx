import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Zap,
  Building,
  Database,
  ArrowRight,
} from 'lucide-react';

export default function TransactionDetailView({
  transaction,
  onBack,
  onOpenDisputeNotice,
}) {
  const [copiedId, setCopiedId] = useState(false);
  const [selectedAction, setSelectedAction] = useState('dispute');
  const [isResolved, setIsResolved] = useState(false);

  const txn = transaction || {
    id: 'TXN-0002',
    timestamp: '2026-09-04 14:22:04 IST',
    gateway_id: 'pay_82Xy991029',
    gateway_gross: '₹14,500.00',
    gateway_fee: '₹415.00 (2.50% Billed)',
    bank_utr: 'UTR-9140281092',
    bank_credit: '₹14,137.50',
    bank_name: 'HDFC Corporate CMS',
    erp_invoice: 'INV-1093',
    erp_amount: '₹14,500.00',
    erp_status: 'Draft Voucher Booked',
    discrepancy_type: 'MDR_FEE_DRIFT',
    variance_paisa: 7250,
    variance_formatted: '+₹72.50 Overcharge',
    confidence: 0.642,
    status: 'Mismatched',
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md bg-page hover:bg-surface border border-border-subtle text-ink-secondary hover:text-ink-primary transition-fast"
            title="Back to Reconciliation Matrix"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-ink-primary tracking-tight">
                Transaction Inspector: {txn.id}
              </h1>
              <button
                onClick={() => handleCopy(txn.id)}
                className="p-1 rounded text-ink-muted hover:text-ink-primary"
                title="Copy Transaction ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-status-flagged-bg text-status-flagged-text border border-status-flagged-border">
                {txn.status}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5 font-sans">
              Captured: <strong className="font-mono text-ink-secondary">{txn.timestamp}</strong> • Anomaly: <strong className="text-sterling">{txn.variance_formatted}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDisputeNotice && (
            <button
              onClick={() => onOpenDisputeNotice(txn)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-ink-primary hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle transition-fast"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Dispute Demand Letter</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Rail Side-by-Side Data Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rail 1: Gateway */}
        <div className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase">Rail 1: Gateway</span>
            <span className="text-[10px] font-mono text-ink-secondary font-medium">Razorpay Instant</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div>
              <span className="text-ink-muted text-[11px] block">Payment ID</span>
              <span className="font-bold text-ink-primary">{txn.gateway_id}</span>
            </div>
            <div>
              <span className="text-ink-muted text-[11px] block">Gross Capture</span>
              <span className="font-bold text-base text-ink-primary">{txn.gateway_gross}</span>
            </div>
            <div>
              <span className="text-ink-muted text-[11px] block">Billed Fee (with 18% GST)</span>
              <span className="text-sterling font-semibold">{txn.gateway_fee}</span>
            </div>
          </div>
        </div>

        {/* Rail 2: Bank CMS */}
        <div className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase">Rail 2: Bank Statement</span>
            <span className="text-[10px] font-mono text-ink-secondary font-medium">{txn.bank_name}</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div>
              <span className="text-ink-muted text-[11px] block">Bank Reference UTR</span>
              <span className="font-bold text-ink-primary">{txn.bank_utr}</span>
            </div>
            <div>
              <span className="text-ink-muted text-[11px] block">Net Credit Deposit</span>
              <span className="font-bold text-base text-emerald-700">{txn.bank_credit}</span>
            </div>
            <div>
              <span className="text-ink-muted text-[11px] block">Clearing SLA</span>
              <span className="text-emerald-800">T+1 Settlement Cleared</span>
            </div>
          </div>
        </div>

        {/* Rail 3: ERP General Ledger */}
        <div className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase">Rail 3: ERP Ledger</span>
            <span className="text-[10px] font-mono text-ink-secondary font-medium">Tally Prime 4.0</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div>
              <span className="text-ink-muted text-[11px] block">Invoice Voucher Number</span>
              <span className="font-bold text-ink-primary">{txn.erp_invoice}</span>
            </div>
            <div>
              <span className="text-ink-muted text-[11px] block">Booked Receivable</span>
              <span className="font-bold text-base text-ink-primary">{txn.erp_amount}</span>
            </div>
            <div>
              <span className="text-ink-muted text-[11px] block">Posting Status</span>
              <span className="text-ink-secondary">{txn.erp_status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integer Paisa Mathematical Proof Box */}
      <div className="bg-surface border border-border-subtle rounded-lg p-5 shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <h3 className="font-display font-bold text-sm text-ink-primary">
            Exact Integer Paisa Variance Proof (Zero Float Drift)
          </h3>
          <span className="text-xs font-mono text-ink-muted">Compiler Rule: INV_RULE_04</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-md bg-page border border-border-subtle">
            <span className="text-ink-muted text-[10px] uppercase block">Gross Invoice Paisa</span>
            <p className="text-sm font-bold text-ink-primary mt-1">1,450,000 p</p>
            <p className="text-[10px] text-ink-muted mt-0.5">₹14,500.00 exact</p>
          </div>

          <div className="p-3 rounded-md bg-page border border-border-subtle">
            <span className="text-ink-muted text-[10px] uppercase block">Contracted MDR (2.00% + 18%)</span>
            <p className="text-sm font-bold text-ink-primary mt-1">34,250 p</p>
            <p className="text-[10px] text-ink-muted mt-0.5">₹342.50 effective fee</p>
          </div>

          <div className="p-3 rounded-md bg-page border border-border-subtle">
            <span className="text-ink-muted text-[10px] uppercase block">Billed MDR (2.50% + 18%)</span>
            <p className="text-sm font-bold text-sterling mt-1">41,500 p</p>
            <p className="text-[10px] text-sterling mt-0.5">₹415.00 deducted</p>
          </div>

          <div className="p-3 rounded-md bg-status-flagged-bg border border-status-flagged-border">
            <span className="text-status-flagged-text text-[10px] font-semibold uppercase block">Net Paisa Discrepancy</span>
            <p className="text-sm font-bold text-status-flagged-text mt-1">+7,250 p</p>
            <p className="text-[10px] text-status-flagged-text mt-0.5">+₹72.50 Overcharge</p>
          </div>
        </div>
      </div>

      {/* Autonomous Remediation Playbook */}
      <div className="bg-surface border border-border-subtle rounded-lg p-5 shadow-subtle space-y-4">
        <h3 className="font-display font-bold text-sm text-ink-primary">
          Autonomous Remediation & Controller Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            onClick={() => setSelectedAction('dispute')}
            className={`p-3.5 rounded-md border text-xs cursor-pointer transition-fast flex items-start gap-3 ${
              selectedAction === 'dispute'
                ? 'bg-page border-border-strong shadow-subtle'
                : 'border-border-subtle hover:bg-page'
            }`}
          >
            <input
              type="radio"
              name="action"
              checked={selectedAction === 'dispute'}
              onChange={() => setSelectedAction('dispute')}
              className="mt-0.5"
            />
            <div>
              <p className="font-semibold text-ink-primary">Issue Razorpay MDR Dispute Letter</p>
              <p className="text-ink-muted text-[11px] mt-0.5">
                Generates formal claim referencing payment ID {txn.gateway_id} demanding ₹72.50 refund under 72h SLA.
              </p>
            </div>
          </label>

          <label
            onClick={() => setSelectedAction('journal')}
            className={`p-3.5 rounded-md border text-xs cursor-pointer transition-fast flex items-start gap-3 ${
              selectedAction === 'journal'
                ? 'bg-page border-border-strong shadow-subtle'
                : 'border-border-subtle hover:bg-page'
            }`}
          >
            <input
              type="radio"
              name="action"
              checked={selectedAction === 'journal'}
              onChange={() => setSelectedAction('journal')}
              className="mt-0.5"
            />
            <div>
              <p className="font-semibold text-ink-primary">Post Balanced Journal Voucher in ERP</p>
              <p className="text-ink-muted text-[11px] mt-0.5">
                Debits Bank Charges Variance account and credits Gateway Clearing to balance the general ledger.
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Idempotency: QR-001-MDR:DISPUTE:01</span>
          </span>

          <button
            onClick={() => setIsResolved(true)}
            className="px-4 py-2 rounded-md bg-ink-primary hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle transition-fast"
          >
            {isResolved ? 'Remediation Executed ✓' : 'Authorize Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
