import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function AnomalySimulatorWidget({ onLaunchDashboard }) {
  const [activeScenarioKey, setActiveScenarioKey] = useState('nominal');

  const SCENARIOS = {
    nominal: {
      id: 'nominal',
      name: '01 / Nominal 3-Way Match',
      badge: 'CONSENSUS VERIFIED',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      status: 'MATCHED',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      confidence: 0.984,
      variancePaisa: '₹0.00 (Exact 0.00 Paisa Variance)',
      streams: {
        gateway: { title: 'Razorpay Gateway', ref: 'pay_Lw92K182', gross: '₹14,500.00', net: '₹14,210.00', fee: '₹290.00 (2.0%)' },
        bank: { title: 'HDFC Corporate CMS', ref: 'UTR90128391823', credit: '₹14,210.00', date: 'T+0 Clearance' },
        erp: { title: 'Tally Prime Ledger', ref: 'INV-2026-0891', debit: '₹14,500.00', voucher: 'Sales Journal #401' },
      },
      reason: 'Perfect multi-rail consensus: Paisa constraint exact, 16-digit bank UTR verified (0.98), invoice token matched (0.95). 55/55 Invariants passed.',
    },
    mdrDrift: {
      id: 'mdrDrift',
      name: '02 / Inject 1.5% MDR Fee Drift',
      badge: 'FAIL-CLOSED ISOLATION',
      badgeColor: 'bg-rose-50 text-sterling border-rose-200',
      status: 'QUARANTINED',
      statusColor: 'text-sterling bg-rose-50 border-rose-200',
      confidence: 0.45,
      variancePaisa: '+₹217.50 (21750 Paisa Variance)',
      streams: {
        gateway: { title: 'Razorpay Gateway', ref: 'pay_M812A901', gross: '₹14,500.00', net: '₹14,210.00', fee: '₹290.00 (2.0%)' },
        bank: { title: 'HDFC Corporate CMS', ref: 'UTR44910283910', credit: '₹13,992.50', feeDed: '₹507.50 (3.5% Rate Drift)' },
        erp: { title: 'Tally Prime Ledger', ref: 'INV-2026-0902', debit: '₹14,500.00', voucher: 'Sales Journal #402' },
      },
      reason: 'INV_RULE_04 VIOLATION: Bank deducted 3.50% fee rate vs contracted 2.00% (+18% GST). Discrepancy of 21,750 paisa (+₹217.50) trapped into Fail-Closed Quarantine.',
    },
    missingUtr: {
      id: 'missingUtr',
      name: '03 / Drop Bank CMS UTR',
      badge: 'FLOAT UNRESOLVED',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      status: 'QUARANTINED',
      statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
      confidence: 0.30,
      variancePaisa: '₹28,322.00 (In-Flight Transit Missing)',
      streams: {
        gateway: { title: 'Razorpay Gateway', ref: 'pay_X4410291', gross: '₹28,900.00', net: '₹28,322.00', fee: '₹578.00 (2.0%)' },
        bank: { title: 'HDFC Corporate CMS', ref: 'MISSING_UTR', credit: '— (No Deposit Line Found)', date: 'T+3 Window Expired' },
        erp: { title: 'Tally Prime Ledger', ref: 'INV-2026-0774', debit: '₹28,900.00', voucher: 'Sales Journal #403' },
      },
      reason: 'INV_RULE_12 VIOLATION: Payment captured on Gateway and debited in ERP, but zero corresponding 16-digit UTR credit appeared in bank CMS settlement batch.',
    },
    duplicate: {
      id: 'duplicate',
      name: '04 / Duplicate ERP Voucher',
      badge: 'DUPLICATE TRAPPED',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      status: 'QUARANTINED',
      statusColor: 'text-purple-800 bg-purple-50 border-purple-200',
      confidence: 0.25,
      variancePaisa: '₹8,450.00 (Double Journal Entry)',
      streams: {
        gateway: { title: 'Razorpay Gateway', ref: 'pay_D1102931', gross: '₹8,450.00', net: '₹8,281.00', fee: '₹169.00 (2.0%)' },
        bank: { title: 'HDFC Corporate CMS', ref: 'UTR11928301923', credit: '₹8,281.00', date: 'Single Deposit' },
        erp: { title: 'Tally Prime Ledger', ref: 'INV-2026-0941', debit: '₹8,450.00 (DUPLICATE #2)', voucher: 'Voucher #404 & #405' },
      },
      reason: 'INV_RULE_02 VIOLATION: Duplicate voucher posted in general ledger against single settlement credit. Isolated from accounting balance.',
    },
  };

  const current = SCENARIOS[activeScenarioKey];

  return (
    <div className="w-full rounded-lg p-6 bg-surface border border-border-subtle shadow-subtle relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono text-ink-secondary bg-page border border-border-subtle mb-1.5">
            <Zap className="w-3 h-3 text-ink-secondary" />
            <span>INTERACTIVE INVARIANT STRESS-TESTER</span>
          </div>
          <h3 className="text-lg font-display font-bold text-ink-primary tracking-tight">
            Live Anomaly Injection & Resolution Engine
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Select any condition below to inject financial anomalies and observe mathematical invariant isolation in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-mono border flex items-center gap-1.5 bg-page border-border-subtle text-ink-secondary">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>55 Rules Armed</span>
          </span>
        </div>
      </div>

      {/* 4 Interactive Scenario Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-5">
        {Object.values(SCENARIOS).map((sc) => {
          const isSelected = activeScenarioKey === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioKey(sc.id)}
              className={`p-3 rounded-md text-left transition-fast border flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-ink-primary text-white border-ink-primary shadow-subtle'
                  : 'bg-page hover:bg-surface text-ink-secondary border-border-subtle hover:border-border-strong'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${
                  isSelected ? 'bg-white/10 text-white border-white/20' : 'bg-surface text-ink-secondary border-border-subtle'
                }`}>
                  {sc.id === 'nominal' ? 'NOMINAL' : 'ANOMALY'}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  sc.id === 'nominal' ? 'bg-emerald-400' : 'bg-rose-400'
                }`} />
              </div>

              <span className="text-xs font-medium leading-tight">
                {sc.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live 3-Stream Mathematical Diff Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {/* Gateway Stream */}
        <div className="p-3.5 rounded-md bg-page border border-border-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase">RAIL 1: GATEWAY</span>
            <span className="text-[10px] font-mono text-ink-secondary font-medium">Razorpay</span>
          </div>
          <p className="text-xs font-mono font-medium text-ink-primary">{current.streams.gateway.ref}</p>
          <p className="text-base font-mono font-bold text-ink-primary">{current.streams.gateway.gross}</p>
          <p className="text-[11px] text-ink-muted font-mono">Fee: {current.streams.gateway.fee}</p>
        </div>

        {/* Bank Statement Stream */}
        <div className="p-3.5 rounded-md bg-page border border-border-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase">RAIL 2: BANK CMS</span>
            <span className="text-[10px] font-mono text-ink-secondary font-medium">HDFC Bank</span>
          </div>
          <p className="text-xs font-mono font-medium text-ink-primary">{current.streams.bank.ref}</p>
          <p className="text-base font-mono font-bold text-ink-primary">{current.streams.bank.credit}</p>
          <p className="text-[11px] text-ink-muted font-mono">{current.streams.bank.feeDed || current.streams.bank.date}</p>
        </div>

        {/* ERP Ledger Stream */}
        <div className="p-3.5 rounded-md bg-page border border-border-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase">RAIL 3: ERP LEDGER</span>
            <span className="text-[10px] font-mono text-ink-secondary font-medium">Tally Prime</span>
          </div>
          <p className="text-xs font-mono font-medium text-ink-primary">{current.streams.erp.ref}</p>
          <p className="text-base font-mono font-bold text-ink-primary">{current.streams.erp.debit}</p>
          <p className="text-[11px] text-ink-muted font-mono">{current.streams.erp.voucher}</p>
        </div>
      </div>

      {/* Forensic Verdict & Invariant Breakdown Footer */}
      <div className="p-4 rounded-md bg-surface border border-border-subtle shadow-subtle space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${current.statusColor}`}>
              VERDICT: {current.status}
            </span>
            <span className="text-xs font-mono text-ink-secondary">
              Variance: <strong className="text-ink-primary">{current.variancePaisa}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-ink-muted">Composite Confidence:</span>
            <span className="text-sm font-bold text-ink-primary">
              {Math.round(current.confidence * 100)}%
            </span>
          </div>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed font-sans pt-2 border-t border-border-subtle">
          <strong className="text-ink-primary font-medium">Compiler Proof:</strong> {current.reason}
        </p>
      </div>
    </div>
  );
}
