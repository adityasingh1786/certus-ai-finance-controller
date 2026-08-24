import React, { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Download, Sparkles } from "lucide-react";

const VARIANCE_DATA = [
  { month: "Jul", planned: 48, actual: 45 },
  { month: "Aug", planned: 52, actual: 51 },
  { month: "Sep", planned: 55, actual: 58 },
  { month: "Oct", planned: 60, actual: 54 },
  { month: "Nov", planned: 58, actual: 62 },
  { month: "Dec", planned: 65, actual: 61 },
];

const CATEGORY_DATA = [
  { label: "Payroll", amount: "$1.24M", pct: 38, color: "#E8384F" },
  { label: "Vendor Payments", amount: "$845K", pct: 26, color: "#6366F1" },
  { label: "Settlement Fees", amount: "$412K", pct: 13, color: "#10B981" },
  { label: "SWIFT/Wire", amount: "$680K", pct: 21, color: "#F59E0B" },
  { label: "Miscellaneous", amount: "$65K", pct: 2, color: "#9CA3AF" },
];

function BarChartSVG() {
  const W = 560, H = 200, PL = 40, PR = 20, PT = 20, PB = 30;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const maxV = 70;
  const barW = 18;
  const groupW = innerW / VARIANCE_DATA.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {[0, 20, 40, 60].map((v) => (
        <g key={v}>
          <line x1={PL} x2={W - PR} y1={PT + innerH - (v / maxV) * innerH} y2={PT + innerH - (v / maxV) * innerH}
            stroke="#E5E7EB" strokeDasharray="3 3" strokeWidth="1" />
          <text x={PL - 4} y={PT + innerH - (v / maxV) * innerH + 4} textAnchor="end" fontSize={9} fill="#9CA3AF" fontFamily="IBM Plex Mono">{v}M</text>
        </g>
      ))}
      {VARIANCE_DATA.map((d, i) => {
        const cx = PL + i * groupW + groupW / 2;
        const plannedH = (d.planned / maxV) * innerH;
        const actualH = (d.actual / maxV) * innerH;
        return (
          <g key={d.month}>
            <rect x={cx - barW - 2} y={PT + innerH - plannedH} width={barW} height={plannedH} rx={3} fill="#E5E7EB" />
            <rect x={cx + 2} y={PT + innerH - actualH} width={barW} height={actualH} rx={3}
              fill={d.actual >= d.planned ? "#10B981" : "#E8384F"} />
            <text x={cx} y={H - 8} textAnchor="middle" fontSize={9} fill="#9CA3AF" fontFamily="IBM Plex Sans">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function LedgerAnalysisScreen() {
  const SUMMARY = [
    { label: "Total Ledger Volume (Q4)", value: "$3.24M", delta: "+12.4%", up: true },
    { label: "Variance vs Budget", value: "-$180K", delta: "-5.3%", up: false },
    { label: "Unposted Entries", value: "24", delta: "Needs review", up: null },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Ledger Analysis</h1>
          <p className="text-sm text-ink-muted mt-1 font-sans">Q4 2023 financial ledger breakdown and variance analysis.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border-strong rounded-lg text-sm font-medium text-ink-secondary hover:border-ink-secondary transition-all">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {SUMMARY.map((s) => (
          <div key={s.label} className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider font-sans">{s.label}</p>
            <p className="font-display font-bold text-3xl text-ink-primary mt-2 tracking-tight">{s.value}</p>
            <p className="text-xs mt-1.5 font-semibold flex items-center gap-1"
              style={{ color: s.up === true ? "#065F46" : s.up === false ? "#E8384F" : "#92400E" }}>
              {s.up === true && <TrendingUp className="w-3 h-3" />}
              {s.up === false && <TrendingDown className="w-3 h-3" />}
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Bar Chart */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-ink-primary">Planned vs Actual (Monthly)</h2>
            <div className="flex items-center gap-3 text-xs text-ink-muted font-sans">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-border-strong inline-block" />Planned</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Actual</span>
            </div>
          </div>
          <div className="px-4 py-4">
            <BarChartSVG />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border-subtle">
            <h2 className="font-display font-semibold text-sm text-ink-primary">Category Breakdown</h2>
          </div>
          <div className="p-5 space-y-3">
            {CATEGORY_DATA.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-ink-secondary font-sans">{cat.label}</span>
                  <span className="font-mono font-semibold text-ink-primary">{cat.amount}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-subtle overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.pct}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card"
        style={{ borderLeft: "3px solid #6366F1" }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" style={{ color: "#6366F1" }} />
          <span className="font-display font-semibold text-sm text-ink-primary">AI Variance Insight</span>
        </div>
        <p className="text-sm text-ink-secondary font-sans leading-relaxed">
          October actuals are 10% below plan, primarily driven by a <span className="font-semibold text-ink-primary">$230K delay</span> in SWIFT settlement processing
          from EU counterparties. November forecast shows recovery based on confirmed wire schedules.
          Recommend reviewing <code className="font-mono text-xs bg-surface-subtle px-1 py-0.5 rounded border border-border-subtle">SETTLEMENT-RULE-Q4</code> tolerance thresholds.
        </p>
      </div>
    </div>
  );
}
