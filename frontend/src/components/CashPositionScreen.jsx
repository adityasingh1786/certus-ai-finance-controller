import React, { useEffect, useRef, useState } from "react";
import { Building2, ArrowLeftRight, Shield, TrendingUp, AlertTriangle, Download } from "lucide-react";

const FORECAST_POINTS = [
  { label: "Today", value: 12.8 },
  { label: "Day 3", value: 14.8 },
  { label: "Day 6", value: 17.2 },
  { label: "Day 9", value: 15.8 },
  { label: "Day 12", value: 20.2 },
  { label: "Day 14", value: 23.5 },
];

const BAND_SPREAD = [1.2, 1.8, 2.8, 2.2, 3.0, 3.8];

function ForecastChart() {
  const W = 640, H = 240, PL = 48, PR = 20, PT = 20, PB = 40;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const minV = 8, maxV = 32;
  const toX = (i) => PL + (i / (FORECAST_POINTS.length - 1)) * innerW;
  const toY = (v) => PT + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const pts = FORECAST_POINTS.map((p, i) => [toX(i), toY(p.value)]);
  const upper = FORECAST_POINTS.map((p, i) => [toX(i), toY(p.value + BAND_SPREAD[i])]);
  const lower = FORECAST_POINTS.map((p, i) => [toX(i), toY(p.value - BAND_SPREAD[i])]);

  const pathD = (points) =>
    points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");

  const bandPath =
    upper.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ") +
    " " +
    lower.slice().reverse().map(([x, y]) => `L${x},${y}`).join(" ") +
    " Z";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {/* Grid lines */}
      {[10, 15, 20, 25, 30].map((v) => (
        <g key={v}>
          <line x1={PL} x2={W - PR} y1={toY(v)} y2={toY(v)} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1" />
          <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fontSize={10} fill="#9CA3AF" fontFamily="IBM Plex Mono">{v}M</text>
        </g>
      ))}
      {/* Confidence band */}
      <path d={bandPath} fill="rgba(16,185,129,0.12)" />
      {/* Line */}
      <path d={pathD(pts)} fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinejoin="round" />
      {/* Points */}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="#10B981" stroke="white" strokeWidth={2} />
      ))}
      {/* X axis labels */}
      {FORECAST_POINTS.map((p, i) => (
        <text key={p.label} x={toX(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#9CA3AF" fontFamily="IBM Plex Sans">{p.label}</text>
      ))}
    </svg>
  );
}

export default function CashPositionScreen() {
  const CARDS = [
    {
      label: "Verified Cash Balance",
      value: "$24,892,105.00",
      sub: "+1.2% from yesterday",
      subColor: "#10B981",
      icon: Building2,
      iconBg: "#EFF6FF",
      iconColor: "#3B82F6",
    },
    {
      label: "In-Flight Settlements",
      value: "$1,450,000.00",
      sub: "Pending clearing",
      subColor: "#6366F1",
      icon: ArrowLeftRight,
      iconBg: "#EEF2FF",
      iconColor: "#6366F1",
    },
    {
      label: "Quarantined Amount",
      value: "$45,210.00",
      sub: "Requires manual review",
      subColor: "#E8384F",
      icon: Shield,
      iconBg: "#FEF2F2",
      iconColor: "#E8384F",
      alert: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Cash Position</h1>
          <p className="text-sm text-ink-muted mt-1 font-sans">Real-time balances and 14-day predictive forecast.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border-strong rounded-lg text-sm font-medium text-ink-secondary hover:border-ink-secondary transition-all">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider font-sans">{card.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: card.iconBg }}>
                  <Icon className="w-4 h-4" style={{ color: card.iconColor }} />
                </div>
              </div>
              <p className="font-mono font-bold text-xl text-ink-primary">{card.value}</p>
              <p className="text-xs mt-1.5 font-sans flex items-center gap-1" style={{ color: card.subColor }}>
                {card.alert && <AlertTriangle className="w-3 h-3" />}
                {!card.alert && card.label === "Verified Cash Balance" && <TrendingUp className="w-3 h-3" />}
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Forecast Chart */}
      <div className="bg-surface border border-border-subtle rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-ink-primary">14-Day Cash Forecast</h2>
          <div className="flex items-center gap-4 text-xs text-ink-muted font-sans">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded bg-emerald-500 inline-block" />
              Projected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded inline-block" style={{ background: "rgba(16,185,129,0.2)" }} />
              Confidence Band
            </span>
          </div>
        </div>
        <div className="px-4 py-4">
          <ForecastChart />
        </div>
      </div>
    </div>
  );
}
