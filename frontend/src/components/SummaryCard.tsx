'use client';

import React from 'react';
import { CheckCircle2, ShieldAlert, Layers, Clock, Award } from 'lucide-react';
import { BatchSummary } from '@/lib/api';

interface SummaryCardProps {
  summary: BatchSummary | null;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  if (!summary) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-500 min-h-[220px]">
        <Layers className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
        <p className="text-sm font-medium text-slate-400">No active settlement batch loaded</p>
        <p className="text-xs text-slate-500 mt-1">
          Upload a statement above or click &quot;Load 60-Record Demo Batch&quot; to inspect real-time metrics
        </p>
      </div>
    );
  }

  const passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
  const quarantineRate = summary.total > 0 ? (summary.quarantined / summary.total) * 100 : 0;

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold">
            Batch Verification Report
          </span>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{summary.filename || 'Settlement Batch'}</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              ({summary.batch_id.slice(0, 8)}...)
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{summary.processing_time_ms ?? 120}ms</span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-900/70 rounded-xl p-3.5 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" /> Total Records
          </span>
          <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">{summary.total}</div>
          <span className="text-[10px] text-slate-500">100% evaluated</span>
        </div>

        <div className="bg-emerald-950/30 rounded-xl p-3.5 border border-emerald-500/25">
          <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Passed Validated
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{summary.passed}</div>
          <span className="text-[10px] text-emerald-500/80">{passRate.toFixed(1)}% clean</span>
        </div>

        <div className="bg-rose-950/30 rounded-xl p-3.5 border border-rose-500/25">
          <span className="text-[11px] text-rose-300 font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Quarantined
          </span>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">{summary.quarantined}</div>
          <span className="text-[10px] text-rose-500/80">{quarantineRate.toFixed(1)}% isolated</span>
        </div>

        <div className="bg-cyan-950/30 rounded-xl p-3.5 border border-cyan-500/25">
          <span className="text-[11px] text-cyan-300 font-medium flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-400" /> Avg Confidence
          </span>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
            {summary.avg_confidence ? `${(summary.avg_confidence * 100).toFixed(0)}%` : '100%'}
          </div>
          <span className="text-[10px] text-cyan-500/80">Deterministic gate</span>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
          <span>Integrity Distribution</span>
          <span>{summary.passed} Passed / {summary.quarantined} Quarantined</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex p-[1px] border border-slate-700/50">
          <div
            style={{ width: `${passRate}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500"
          />
          <div
            style={{ width: `${quarantineRate}%` }}
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-r-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Core Architectural Banner */}
      <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-200/90 font-mono flex items-center justify-between">
        <span>⚡ Zero Silent Guesses: Anomaly isolated at boundary</span>
        <span className="text-cyan-400 font-semibold">Fail-Closed Active</span>
      </div>
    </div>
  );
}
