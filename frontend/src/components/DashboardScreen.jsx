import React from 'react';
import {
  Layers,
  ShieldAlert,
  TrendingUp,
  Bot,
  Activity,
  ArrowRight,
  Zap,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardScreen({
  reconciliationData,
  cashPosition,
  quarantineRecords = [],
  onNavigateTab,
}) {
  const summary = reconciliationData?.summary || {
    total_records: 60,
    matched: 54,
    mismatched: 2,
    missing: 4,
    match_rate_percentage: '90.0%',
    avg_confidence: 0.984,
  };

  const currentBalance = cashPosition?.current_balance || 48290000;
  const pendingFloat = cashPosition?.pending_settlements_total || 3410500;
  const quarantinedVal = cashPosition?.quarantined_amount_total || 71780;

  const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 text-left">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">
            Financial Controller Executive Dashboard
          </h1>
          <p className="text-xs text-ink-muted mt-0.5 font-sans">
            Autonomous multi-rail reconciliation telemetry, working capital pipeline, and invariant gate status.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-ink-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-ink-primary font-medium">8,345 ops/s</span>
          <span>•</span>
          <span>55 Invariants Active</span>
        </div>
      </div>

      {/* 4-Stat Metric Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab && onNavigateTab('recon')}
          className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle hover:border-border-strong transition-fast cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>3-Way Match Rate</span>
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="font-mono text-xl font-bold text-ink-primary tabular-nums">
            {summary.match_rate_percentage}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">
            {summary.matched} of {summary.total_records} Verified
          </p>
        </div>

        <div
          onClick={() => onNavigateTab && onNavigateTab('treasury')}
          className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle hover:border-border-strong transition-fast cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>Liquid Bank Balance</span>
            <TrendingUp className="w-3.5 h-3.5 text-ink-secondary" />
          </div>
          <p className="font-mono text-xl font-bold text-ink-primary tabular-nums">
            {formatCurrency(currentBalance)}
          </p>
          <p className="text-[11px] text-ink-muted">HDFC / ICICI Verified</p>
        </div>

        <div
          onClick={() => onNavigateTab && onNavigateTab('treasury')}
          className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle hover:border-border-strong transition-fast cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>In-Transit Gateway Float</span>
            <Activity className="w-3.5 h-3.5 text-ink-secondary" />
          </div>
          <p className="font-mono text-xl font-bold text-ink-primary tabular-nums">
            {formatCurrency(pendingFloat)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">T+1 Clearing Transit</p>
        </div>

        <div
          onClick={() => onNavigateTab && onNavigateTab('quarantine')}
          className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle hover:border-border-strong transition-fast cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>Quarantined at Risk</span>
            <ShieldAlert className="w-3.5 h-3.5 text-sterling" />
          </div>
          <p className="font-mono text-xl font-bold text-sterling tabular-nums">
            {formatCurrency(quarantinedVal)}
          </p>
          <p className="text-[11px] text-sterling font-medium">
            {quarantineRecords.length} Exceptions Trapped
          </p>
        </div>
      </div>

      {/* Operational Modules Quick Jump */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => onNavigateTab && onNavigateTab('recon')}
          className="bg-surface border border-border-subtle rounded-lg p-5 shadow-subtle hover:border-border-strong transition-fast cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-md bg-page border border-border-subtle flex items-center justify-center text-ink-primary">
              <Layers className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink-primary transition-fast" />
          </div>
          <h3 className="font-display font-bold text-sm text-ink-primary">3-Way Match Matrix</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Inspect side-by-side reconciliation across Gateway IDs, Bank CMS UTR numbers, and ERP invoice general ledgers.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab && onNavigateTab('quarantine')}
          className="bg-surface border border-border-subtle rounded-lg p-5 shadow-subtle hover:border-border-strong transition-fast cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-md bg-page border border-border-subtle flex items-center justify-center text-ink-primary">
              <ShieldAlert className="w-4 h-4 text-sterling" />
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink-primary transition-fast" />
          </div>
          <h3 className="font-display font-bold text-sm text-ink-primary">Quarantine & Anomaly Recovery</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Forensic mathematical diagnosis of MDR rate hikes, missing UTR credits, and one-click dispute letter generation.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab && onNavigateTab('copilot')}
          className="bg-surface border border-border-subtle rounded-lg p-5 shadow-subtle hover:border-border-strong transition-fast cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-md bg-page border border-border-subtle flex items-center justify-center text-ink-primary">
              <Bot className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-ink-primary transition-fast" />
          </div>
          <h3 className="font-display font-bold text-sm text-ink-primary">Autonomous AI Copilot</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Query financial status with verifiable source citations and provable grounding against immutable SQLite state.
          </p>
        </div>
      </div>
    </div>
  );
}
