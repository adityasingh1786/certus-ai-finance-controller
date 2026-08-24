'use client';

import React, { useState } from 'react';
import { GitMerge, Check, AlertTriangle, Cpu, ArrowRight, FileCheck, Layers } from 'lucide-react';
import { api, ReconciliationResult } from '@/lib/api';

interface ReconciliationMatrixProps {
  refreshTrigger: number;
}

export default function ReconciliationMatrix({ refreshTrigger }: ReconciliationMatrixProps) {
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunReconcile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.runReconciliation();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Reconciliation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold flex items-center gap-1">
              <GitMerge className="w-3.5 h-3.5" /> 3-Way Triangulation Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Gateway ↔ Bank ↔ ERP
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1">Multi-Source Cross Reconciliation</h3>
          <p className="text-xs text-slate-400">
            Fuzzy matching (RapidFuzz) & UTR parsing resolving fees, TDS & timing discrepancies
          </p>
        </div>

        <button
          onClick={handleRunReconcile}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-white text-xs font-semibold shadow-glow-cyan hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          <Cpu className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Reconciling 3 Streams...' : 'Run Multi-Source Reconciliation'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result ? (
        <div>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Match Rate</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {result.summary.match_rate_percentage}
              </div>
              <span className="text-[10px] text-emerald-500">
                {result.summary.matched_count} of {result.summary.total_gateway_records} matched
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Throughput</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
                {result.summary.throughput_records_per_second} <span className="text-xs font-normal text-slate-400">rec/sec</span>
              </div>
              <span className="text-[10px] text-slate-500">{result.summary.duration_ms}ms total</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Exceptions Flagged</span>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {result.summary.exceptions_count}
              </div>
              <span className="text-[10px] text-amber-500/80">Diagnostic reasons logged</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Unmatched Streams</span>
              <div className="text-xl font-bold text-slate-300 font-mono mt-1">
                {result.summary.unmatched_bank_count} Bank / {result.summary.unmatched_erp_count} ERP
              </div>
              <span className="text-[10px] text-slate-500">In transit / timing gap</span>
            </div>
          </div>

          {/* Sample Matches & Exceptions List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Matches List */}
            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800">
              <h4 className="text-xs font-semibold text-emerald-400 font-mono uppercase mb-3 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Verified Reconciled Pairs (Sample)
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {result.matches.slice(0, 5).map((m) => (
                  <div key={m.match_id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-cyan-300 font-semibold">{m.gateway_txn_id}</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {(m.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">{m.match_reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exceptions List */}
            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800">
              <h4 className="text-xs font-semibold text-amber-400 font-mono uppercase mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Honest Exception Log
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {result.exceptions.length > 0 ? (
                  result.exceptions.slice(0, 5).map((ex) => (
                    <div key={ex.exception_id} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/25 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-amber-400 font-semibold text-[11px]">{ex.type}</span>
                        <span className="text-[10px] text-slate-400">{ex.gateway_txn_id}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{ex.detail}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-mono py-6 text-center">
                    No cross-source discrepancies found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center">
          <Layers className="w-8 h-8 text-cyan-500/60 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">Ready to Cross-Reconcile</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Click &quot;Run Multi-Source Reconciliation&quot; to cross-match Gateway orders with Bank credits and ERP ledgers using dual-gated fuzzy matching.
          </p>
        </div>
      )}
    </div>
  );
}
