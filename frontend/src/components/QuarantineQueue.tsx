'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Eye, AlertOctagon, RefreshCw, X, Check } from 'lucide-react';
import { api, QuarantineRecord } from '@/lib/api';

interface QuarantineQueueProps {
  refreshTrigger: number;
  onRecordResolved: () => void;
}

export default function QuarantineQueue({
  refreshTrigger,
  onRecordResolved,
}: QuarantineQueueProps) {
  const [records, setRecords] = useState<QuarantineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<QuarantineRecord | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    async function loadQuarantine() {
      try {
        setLoading(true);
        const data = await api.getQuarantine();
        setRecords(data.records || []);
      } catch (err) {
        console.error('Failed to load quarantine list:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuarantine();
  }, [refreshTrigger]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !resolveNote.trim()) return;

    setResolving(true);
    try {
      await api.resolveQuarantine(selectedRecord.record_id, resolveNote);
      setSelectedRecord(null);
      setResolveNote('');
      onRecordResolved();
      // Update local state
      setRecords((prev) =>
        prev.map((r) =>
          r.record_id === selectedRecord.record_id
            ? { ...r, resolved: true, resolution_note: resolveNote }
            : r
        )
      );
    } catch (err: any) {
      alert(err.message || 'Resolution failed');
    } finally {
      setResolving(false);
    }
  };

  const getReasonColor = (code: string) => {
    switch (code) {
      case 'DUPLICATE_ID':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'IMPOSSIBLE_VALUE':
      case 'AMOUNT_MISMATCH':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'INVALID_DATE':
      case 'INVALID_CURRENCY':
        return 'bg-violet-500/10 text-violet-300 border-violet-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    }
  };

  const unresolvedCount = records.filter((r) => !r.resolved).length;

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Human-in-the-Loop Queue
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {unresolvedCount} Active
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-0.5">Quarantine & Exception Management</h3>
          <p className="text-xs text-slate-400">
            Records isolated by deterministic boundaries — inspect raw payload and resolve at your own pace
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono">
          Loading quarantine queue...
        </div>
      ) : records.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Reason Code</th>
                <th className="pb-3 font-semibold">Diagnostic Detail</th>
                <th className="pb-3 font-semibold">Flagged By</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.slice(0, 8).map((r) => (
                <tr
                  key={r.record_id}
                  className={`hover:bg-slate-900/40 transition-colors ${
                    r.resolved ? 'opacity-50' : ''
                  }`}
                >
                  <td className="py-3 text-cyan-300 font-medium font-mono">
                    {r.transaction_id || r.record_id.slice(0, 10)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getReasonColor(
                        r.reason_code
                      )}`}
                    >
                      {r.reason_code}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 max-w-xs truncate font-sans text-xs">
                    {r.reason_detail}
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {r.flagged_by}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {r.resolved ? (
                      <span className="text-[11px] text-emerald-400 flex items-center justify-end gap-1 font-mono">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-[11px] font-semibold transition-all"
                      >
                        Inspect & Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 text-center text-slate-500 text-xs font-mono">
          <CheckCircle className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
          <p className="text-slate-300 font-medium">All Records Verified Clean</p>
          <p className="text-slate-500 mt-1">Zero anomalies currently residing in quarantine</p>
        </div>
      )}

      {/* Resolution Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-cyan-500/30 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {selectedRecord.reason_code}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Txn: {selectedRecord.transaction_id || 'N/A'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-100 mb-1">Human-in-the-Loop Resolution</h3>
            <p className="text-xs text-rose-300/90 mb-4 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/20">
              {selectedRecord.reason_detail}
            </p>

            <div className="mb-4">
              <span className="text-xs text-slate-400 font-mono block mb-1.5">Raw Untrusted Payload:</span>
              <pre className="bg-black/60 p-3 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-36 border border-slate-800">
                {selectedRecord.raw_input}
              </pre>
            </div>

            <form onSubmit={handleResolve}>
              <div className="mb-4">
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Resolution Note (Logged to Immutable Audit Trail):
                </label>
                <textarea
                  required
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="e.g., Manually reconciled with merchant invoice #INV-492; amount discrepancy approved."
                  className="w-full text-xs p-3 rounded-lg glass-input text-slate-200 resize-none h-20"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving || !resolveNote.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-semibold shadow-glow-emerald disabled:opacity-50 flex items-center gap-1.5"
                >
                  {resolving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Commit Resolution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
