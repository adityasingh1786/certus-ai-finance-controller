import React, { useState } from "react";
import {
  TrendingUp, AlertTriangle, DollarSign, Activity,
  Sparkles, ArrowRight, CheckCircle2, XCircle, Clock, Copy
} from "lucide-react";
import BaselineComparisonWidget from "./BaselineComparisonWidget";

const statusBadge = {
  Mismatched: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", dot: "#E8384F" },
  Matched:    { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", dot: "#10B981" },
  Duplicate:  { bg: "#EEF2FF", text: "#3730A3", border: "#C7D2FE", dot: "#6366F1" },
  Missing:    { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B" },
};

function StatusPill({ status }) {
  const s = statusBadge[status] || statusBadge.Matched;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

const KPI_CARDS = [
  {
    label: "Reconciliation Rate",
    value: "98.4%",
    delta: "+0.2%",
    deltaUp: true,
    bar: true,
    barFill: 98.4,
    accent: null,
  },
  {
    label: "Open Exceptions",
    value: "142",
    sub: "/ 12,450 records",
    note: "Requires immediate review",
    noteBad: true,
    badge: "Mismatched",
    accent: "#E8384F",
  },
  {
    label: "Total Processed Volume",
    value: "$4.2B",
    sub2: [{ label: "Inflow", val: "$2.15B" }, { label: "Outflow", val: "$2.05B" }],
    accent: null,
  },
];

const BATCHES = [
  { id: "BCH-88291", route: "Stripe → JPM Operating", status: "Mismatched", volume: "$12,450.00", rate: "94.2%", rateGood: false },
  { id: "BCH-88290", route: "Adyen → BofA Merchant",  status: "Matched",    volume: "$8,210.50",  rate: "100%", rateGood: true },
  { id: "BCH-88289", route: "Internal Ledger → Custody A", status: "Matched", volume: "$450,000.00", rate: "100%", rateGood: true },
  { id: "BCH-88288", route: "PayPal → JPM Operating",  status: "Duplicate",  volume: "$3,105.20",  rate: "99.1%", rateGood: true },
];

export default function DashboardScreen() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-ink-muted mt-1 font-sans">Overview of reconciliation status and recent activity.</p>
        </div>
        <span className="font-mono text-xs text-ink-muted bg-surface-subtle border border-border-subtle px-3 py-1.5 rounded-md">
          Last updated: 10:42 AM PST
        </span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recon Rate */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider font-sans">Reconciliation Rate</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display font-bold text-4xl tracking-tight text-ink-primary">98.4%</span>
            <span className="text-xs font-semibold text-emerald-600 mb-1.5 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +0.2%
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-surface-subtle overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: "98.4%" }} />
          </div>
        </div>

        {/* Open Exceptions */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background: "#E8384F" }} />
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider font-sans">Open Exceptions</p>
            <StatusPill status="Mismatched" />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display font-bold text-4xl tracking-tight" style={{ color: "#E8384F" }}>142</span>
            <span className="text-sm text-ink-muted mb-1.5 font-mono">/ 12,450 records</span>
          </div>
          <p className="text-xs text-ink-muted mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" style={{ color: "#E8384F" }} />
            Requires immediate review
          </p>
        </div>

        {/* Volume */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider font-sans">Total Processed Volume</p>
          <div className="mt-3">
            <span className="font-display font-bold text-4xl tracking-tight text-ink-primary">$4.2B</span>
          </div>
          <div className="mt-3 flex gap-6">
            {[{ l: "Inflow", v: "$2.15B" }, { l: "Outflow", v: "$2.05B" }].map((x) => (
              <div key={x.l}>
                <p className="text-xs text-ink-muted font-sans">{x.l}</p>
                <p className="font-mono font-semibold text-sm text-ink-primary">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight Summary */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card"
        style={{ borderLeft: "3px solid #E8384F" }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" style={{ color: "#6366F1" }} />
          <span className="font-display font-semibold text-sm text-ink-primary">AI Insight Summary</span>
        </div>
        <p className="text-sm text-ink-secondary font-sans leading-relaxed">
          Anomaly detected in Q3 cross-border settlements. 45 exceptions originate from European banking
          partners due to a known timezone shift in SWIFT reporting. AI recommends applying rule{" "}
          <code className="font-mono text-xs bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle text-ink-primary">EU-SWIFT-TZ</code>{" "}
          to auto-resolve 80% of these discrepancies.
        </p>
        <button className="mt-3 px-4 py-1.5 text-sm font-medium border border-border-strong rounded-lg hover:border-ink-secondary hover:text-ink-primary text-ink-secondary transition-all duration-150">
          Review Suggested Rules
        </button>
      </div>

      {/* Naive Baseline vs Certus AI Benchmark */}
      <BaselineComparisonWidget />

      {/* Recent Batches Table */}
      <div className="bg-surface border border-border-subtle rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border-subtle">
          <h2 className="font-display font-semibold text-base text-ink-primary">Recent Reconciliation Batches</h2>
          <button className="text-sm font-semibold hover:underline" style={{ color: "#E8384F" }}>View All</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-surface-subtle">
              {["Batch ID", "Source / Destination", "Status", "Volume", "Match Rate"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {BATCHES.map((b) => (
              <tr key={b.id} className="hover:bg-surface-subtle/60 transition-colors cursor-pointer group">
                <td className="px-5 py-4 font-mono text-sm font-semibold text-ink-primary">{b.id}</td>
                <td className="px-5 py-4 text-sm text-ink-secondary font-sans">{b.route}</td>
                <td className="px-5 py-4"><StatusPill status={b.status} /></td>
                <td className="px-5 py-4 font-mono text-sm text-ink-primary">{b.volume}</td>
                <td className="px-5 py-4 font-mono text-sm font-semibold" style={{ color: b.rateGood ? "#065F46" : "#E8384F" }}>{b.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
