import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';
import { resolveQuarantineRecord } from '../lib/api';

export default function QuarantineQueue({ quarantineRecords = [], onRecordResolved }) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [resolutionType, setResolutionType] = useState('ACCEPT_OVERRIDE');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const unresolvedRecords = quarantineRecords.filter((r) => !r.is_resolved && !r.resolved);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    if (!resolutionNotes.trim()) {
      setStatusMsg({ type: 'error', text: 'Resolution notes are required for audit trail.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      await resolveQuarantineRecord(
        selectedRecord.record_id || selectedRecord.transaction_id,
        resolutionType,
        resolutionNotes
      );

      if (onRecordResolved) {
        onRecordResolved(selectedRecord.record_id || selectedRecord.transaction_id);
      }

      setStatusMsg({ type: 'success', text: 'Record resolved and audit log entry created in SQLite.' });
      setTimeout(() => {
        setSelectedRecord(null);
        setResolutionNotes('');
        setStatusMsg(null);
      }, 1000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to resolve record.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-lg shadow-subtle p-5">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-status-mismatched-bg border border-status-mismatched-border flex items-center justify-center text-sterling">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-ink-primary">
              Quarantine Queue & Exception Studio
            </h3>
            <p className="text-xs text-ink-muted">
              Records isolated at Layer 1 boundary with zero ledger contamination
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-status-mismatched-bg text-status-mismatched-text border border-status-mismatched-border">
          {unresolvedRecords.length} Active Exceptions
        </span>
      </div>

      <div className="divide-y divide-border-subtle mt-2">
        {unresolvedRecords.length > 0 ? (
          unresolvedRecords.map((rec, idx) => (
            <div
              key={rec.record_id || idx}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-page/40 p-2 rounded transition-fast"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-ink-primary">
                    {rec.record_id || rec.transaction_id || `QR-${idx + 1}`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sterling-light/60 text-sterling border border-sterling-border">
                    {rec.reason_code || 'ANOMALY'}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {rec.flagged_by || 'Layer 1 Deterministic Rules'}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary leading-snug max-w-xl">
                  {rec.reason_detail || rec.diagnostic || 'Transaction flagged by rules engine.'}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(rec)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border-strong hover:border-sterling bg-surface hover:bg-sterling-light/30 text-ink-primary hover:text-sterling text-xs font-semibold transition-fast shrink-0"
              >
                <span>Review & Resolve</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-ink-muted text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="font-medium text-ink-primary">Quarantine Queue is completely clear!</p>
            <p className="text-[11px] text-ink-secondary mt-0.5">All ingested records passed deterministic integrity checks.</p>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/30 transition-fast">
          <div className="w-full max-w-md bg-surface border border-border-subtle rounded-lg shadow-modal p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h4 className="font-display font-bold text-sm text-ink-primary">
                  Resolve Exception
                </h4>
                <p className="text-[11px] font-mono text-ink-muted">
                  ID: {selectedRecord.record_id || selectedRecord.transaction_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-ink-muted hover:text-ink-primary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-page rounded border border-border-subtle text-xs text-ink-secondary">
              <span className="font-semibold text-ink-primary block mb-1">Flagged Reason:</span>
              <p>{selectedRecord.reason_detail || selectedRecord.diagnostic}</p>
            </div>

            <form onSubmit={handleResolve} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-primary mb-1">
                  Resolution Action:
                </label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  className="w-full text-xs p-2 bg-page border border-border-subtle rounded text-ink-primary focus:outline-none focus:border-sterling"
                >
                  <option value="ACCEPT_OVERRIDE">Accept & Force Reconcile Override</option>
                  <option value="APPLY_CORRECTION">Apply Amount / Currency Correction</option>
                  <option value="DISPUTE_MERCHANT">Flag for Merchant Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-primary mb-1">
                  Resolution Notes (Mandatory for Audit Trail):
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Verified with bank statement credit slip #9012. MDR fee adjusted manually."
                  className="w-full text-xs p-2 bg-page border border-border-subtle rounded text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-sterling"
                />
              </div>

              {statusMsg && (
                <div
                  className={`p-2 rounded text-xs ${
                    statusMsg.type === 'success'
                      ? 'bg-status-matched-bg text-status-matched-text border border-status-matched-border'
                      : 'bg-status-mismatched-bg text-status-mismatched-text border border-status-mismatched-border'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-3 py-1.5 rounded text-xs text-ink-secondary hover:text-ink-primary hover:bg-page"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-sterling hover:bg-sterling-hover text-white text-xs font-semibold transition-fast disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Resolution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
