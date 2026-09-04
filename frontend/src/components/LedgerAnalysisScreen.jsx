import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
} from 'lucide-react';

const VARIANCE_DATA = [
  { month: 'Apr', planned: 12.0, actual: 11.8, feeMdr: 0.24 },
  { month: 'May', planned: 13.5, actual: 13.4, feeMdr: 0.27 },
  { month: 'Jun', planned: 14.0, actual: 14.2, feeMdr: 0.28 },
  { month: 'Jul', planned: 15.2, actual: 14.8, feeMdr: 0.30 },
  { month: 'Aug', planned: 16.0, actual: 16.3, feeMdr: 0.32 },
  { month: 'Sep', planned: 14.5, actual: 14.28, feeMdr: 0.29 },
];

const CATEGORY_DATA = [
  { label: 'Gross Captured Volume (Gateway)', amount: '₹14,285,400.00', pct: 100, color: '#0F172A' },
  { label: 'Net Bank CMS Settlements', amount: '₹13,805,410.56', pct: 96.6, color: '#059669' },
  { label: 'Contracted MDR Payment Fees (2%)', amount: '₹285,708.00', pct: 2.0, color: '#475569' },
  { label: 'Section 194-O TDS Withholding (1%)', amount: '₹142,854.00', pct: 1.0, color: '#64748B' },
  { label: 'GST on Payment Gateway Fees (18%)', amount: '₹51,427.44', pct: 0.36, color: '#94A3B8' },
  { label: 'Quarantined Variance Delta (At Risk)', amount: '₹71,780.00', pct: 0.5, color: '#BE123C' },
];

function BarChartSVG() {
  const W = 560, H = 180, PL = 40, PR = 20, PT = 15, PB = 25;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const maxV = 20;
  const barW = 14;
  const groupW = innerW / VARIANCE_DATA.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      {[0, 5, 10, 15, 20].map((v) => (
        <g key={v}>
          <line
            x1={PL}
            x2={W - PR}
            y1={PT + innerH - (v / maxV) * innerH}
            y2={PT + innerH - (v / maxV) * innerH}
            stroke="#E2E8F0"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
          <text
            x={PL - 4}
            y={PT + innerH - (v / maxV) * innerH + 3}
            textAnchor="end"
            fontSize={9}
            fill="#94A3B8"
            fontFamily="JetBrains Mono"
          >
            ₹{v}M
          </text>
        </g>
      ))}
      {VARIANCE_DATA.map((d, i) => {
        const cx = PL + i * groupW + groupW / 2;
        const plannedH = (d.planned / maxV) * innerH;
        const actualH = (d.actual / maxV) * innerH;

        return (
          <g key={d.month}>
            <rect
              x={cx - barW - 1}
              y={PT + innerH - plannedH}
              width={barW}
              height={plannedH}
              rx={2}
              fill="#E2E8F0"
            />
            <rect
              x={cx + 1}
              y={PT + innerH - actualH}
              width={barW}
              height={actualH}
              rx={2}
              fill={d.actual >= d.planned ? '#059669' : '#0F172A'}
            />
            <text
              x={cx}
              y={H - 6}
              textAnchor="middle"
              fontSize={10}
              fill="#64748B"
              fontFamily="Inter"
            >
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function LedgerAnalysisScreen() {
  const SUMMARY = [
    { label: 'Total Verified Gross Volume', value: '₹14,285,400.00', delta: '+12.4% vs Prev Mo', isPositive: true },
    { label: 'Net Bank Deposited Amount', value: '₹13,805,410.56', delta: '98.5% Settlement Ratio', isPositive: true },
    { label: 'Quarantined Discrepancies', value: '₹71,780.00', delta: '4 Isolated Records', isPositive: false },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">
            Financial General Ledger Analysis & Variance Audit
          </h1>
          <p className="text-xs text-ink-muted mt-0.5 font-sans">
            Three-stream accounting equation verification (Gross - MDR - TDS = Net) with exact integer paisa arithmetic.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Q2 General Ledger audit schedule...')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-page hover:bg-surface border border-border-subtle text-ink-secondary hover:text-ink-primary text-xs font-medium shadow-subtle transition-fast"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger Audit</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SUMMARY.map((s, idx) => (
          <div key={idx} className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle space-y-1">
            <span className="text-[10px] font-medium text-ink-muted uppercase tracking-wider">{s.label}</span>
            <p className="font-display font-bold text-xl text-ink-primary font-mono tabular-nums">{s.value}</p>
            <p className={`text-xs font-medium flex items-center gap-1 ${s.isPositive ? 'text-emerald-700' : 'text-sterling'}`}>
              {s.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{s.delta}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Charts and Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Monthly Trend Bar Chart */}
        <div className="bg-surface border border-border-subtle rounded-lg shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="font-display font-bold text-sm text-ink-primary">
                Monthly Planned vs Actual Volume (FY 2026-27)
              </h3>
              <p className="text-xs text-ink-muted">Comparing booked invoices against cleared settlement credits.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-muted font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-border-subtle inline-block" /> Planned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" /> Actual
              </span>
            </div>
          </div>

          <div className="py-2">
            <BarChartSVG />
          </div>
        </div>

        {/* Ledger Stream Breakdown */}
        <div className="bg-surface border border-border-subtle rounded-lg shadow-subtle p-5 space-y-3">
          <div className="pb-2 border-b border-border-subtle">
            <h3 className="font-display font-bold text-sm text-ink-primary">Category Distribution</h3>
            <p className="text-xs text-ink-muted">Paisa breakdown of settlement streams.</p>
          </div>

          <div className="space-y-3 pt-1">
            {CATEGORY_DATA.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary text-[11px]">{cat.label}</span>
                  <span className="font-mono font-bold text-ink-primary text-xs">{cat.amount}</span>
                </div>
                <div className="h-1 rounded-full bg-page overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, cat.pct)}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Variance Insight */}
      <div className="p-4 rounded-lg bg-page border border-border-subtle flex items-start gap-3 text-xs leading-relaxed text-ink-secondary">
        <Sparkles className="w-4 h-4 text-ink-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-ink-primary font-semibold block mb-0.5">Automated Variance Diagnosis (Deterministic Engine):</strong>
          Analysis of Q2 settlements reveals that net bank credits are within 0.12% of booked invoices. The primary variance is driven by a 50 bps MDR rate drift on Transaction <code className="px-1 py-0.2 rounded bg-surface border border-border-subtle font-mono text-[10px]">TXN-0002</code> (₹72.50 overcharge) and an awaiting CMS batch on <code className="px-1 py-0.2 rounded bg-surface border border-border-subtle font-mono text-[10px]">TXN-0003</code> (₹28,900.00). Both items are isolated in Quarantine with zero balance sheet leakage.
        </div>
      </div>
    </div>
  );
}
