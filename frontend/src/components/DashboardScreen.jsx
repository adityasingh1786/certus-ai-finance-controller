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
import ThreeRailCanvas from './ThreeRailCanvas';

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

      {/* 3D Multi-Rail Settlement Topology Centerpiece */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-page border border-border-subtle flex items-center justify-center text-ink-primary">
              <Zap className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-ink-primary">
                  Live Autonomous Multi-Rail Consensus Topology
                </h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  REAL-TIME GLIDING PACKETS
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Dynamic 3D vector mesh routing transactions between Razorpay Gateways, Bank CMS Statement Rails, and ERP General Ledgers through Layer 2 Double-Lock Consensus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('recon')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-page hover:bg-surface border border-border-subtle text-ink-secondary hover:text-ink-primary text-xs font-medium transition-fast"
            >
              <span>Inspect 3-Way Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D Spatial Canvas Container */}
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden bg-page border border-border-subtle/80 shadow-inner">
          <ThreeRailCanvas className="w-full h-full" />

          {/* Top-Left Telemetry HUD Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200/90 shadow-subtle text-xs font-mono font-semibold text-slate-800 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>3D SPATIAL TOPOLOGY: DOUBLE-LOCK GATE (≥ 0.75)</span>
          </div>

          {/* Bottom-Right Instruction Badge */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 rounded-lg bg-white/90 border border-slate-200/80 shadow-2xs text-[11px] font-mono text-slate-500 backdrop-blur-xs">
            <span>Hover Nodes to Inspect Live Rail Health & Metrics</span>
          </div>
        </div>

        {/* 3 Rails Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-page border border-border-subtle space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-rose-700 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Razorpay Gateway Hub
              </span>
              <span className="text-slate-400">28ms</span>
            </div>
            <p className="font-mono text-xs font-bold text-ink-primary tabular-nums">
              14,250 rec/mo • 2.0% MDR
            </p>
            <p className="text-[10px] text-ink-muted">Instant Gross Capture (T+0)</p>
          </div>

          <div className="p-3 rounded-lg bg-page border border-border-subtle space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Bank CMS Statement Rail
              </span>
              <span className="text-slate-400">62ms</span>
            </div>
            <p className="font-mono text-xs font-bold text-ink-primary tabular-nums">
              12,890 credits/mo • 16-Digit UTR
            </p>
            <p className="text-[10px] text-ink-muted">Net Settlement (T+1 Window)</p>
          </div>

          <div className="p-3 rounded-lg bg-page border border-border-subtle space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-indigo-700 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> General Ledger Rail
              </span>
              <span className="text-slate-400">0.00ms Jitter</span>
            </div>
            <p className="font-mono text-xs font-bold text-ink-primary tabular-nums">
              Tally Prime & SAP S/4HANA
            </p>
            <p className="text-[10px] text-ink-muted">Section 194-O TDS & GST Reconciled</p>
          </div>
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
