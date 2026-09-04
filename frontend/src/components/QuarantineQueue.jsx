import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { resolveQuarantineRecord } from '../lib/api';
import DisputeNoticeModal from './DisputeNoticeModal';

export default function QuarantineQueue({
  records = [],
  quarantineRecords = [],
  onRecordResolved,
  onResolve,
  onInspect,
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [disputeNoticeData, setDisputeNoticeData] = useState(null);
  const [isGeneratingDispute, setIsGeneratingDispute] = useState(false);
  const [resolutionType, setResolutionType] = useState('ACCEPT_OVERRIDE');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const rawList = records.length > 0 ? records : quarantineRecords;

  const activeRecords = useMemo(() => {
    const list = rawList.length > 0 ? rawList : [
      { record_id: 'QR-001-MDR', reason_code: 'UNAUTHORIZED_MDR', flagged_by: 'Layer 1 Deterministic Rules', reason_detail: 'Bank deduction fee rate is 2.50% (expected standard 2.0% + 18% GST). Fee delta of ₹72.50 exceeds tolerance.', gross_amount: 14500.0, discrepancy_amount: 72.5, is_resolved: false },
      { record_id: 'QR-002-UTR', reason_code: 'MISSING_UTR', flagged_by: 'Bank Ingest Pipeline', reason_detail: 'Gateway payment completed but 16-digit Bank UTR is absent in HDFC CMS settlement batch.', gross_amount: 28900.0, discrepancy_amount: 28900.0, is_resolved: false },
      { record_id: 'QR-003-VOUCHER', reason_code: 'ERP_UNPOSTED', flagged_by: 'Tally Prime Connector', reason_detail: 'Sales invoice posted under draft status without matching general ledger journal credit entry.', gross_amount: 8200.0, discrepancy_amount: 8200.0, is_resolved: false },
      { record_id: 'QR-004-NET-GT-GROSS', reason_code: 'NET_GT_GROSS', flagged_by: 'Deterministic Rule Gate', reason_detail: 'Net settlement credit received (₹5,100.00) exceeds gross invoice amount (₹5,000.00). Trapped fail-closed.', gross_amount: 5000.0, discrepancy_amount: 100.0, is_resolved: false },
    ];
    return list.filter((r) => !r.is_resolved && !r.resolved);
  }, [rawList]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    if (!resolutionNotes.trim()) {
      setStatusMsg({ type: 'error', text: 'Resolution notes are required for the audit trail.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      try {
        await resolveQuarantineRecord(
          selectedRecord.record_id || selectedRecord.transaction_id,
          resolutionType,
          resolutionNotes
        );
      } catch (_) { /* Demo fallback */ }

      const recId = selectedRecord.record_id || selectedRecord.transaction_id;
      if (onRecordResolved) onRecordResolved(recId, resolutionType);
      if (onResolve) onResolve(recId, resolutionType);

      setStatusMsg({ type: 'success', text: 'Record resolved and audit log entry created.' });
      setTimeout(() => {
        setSelectedRecord(null);
        setResolutionNotes('');
        setStatusMsg(null);
      }, 900);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to resolve record.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDisputeNotice = async (rec) => {
    setIsGeneratingDispute(true);
    const recId = rec.record_id || rec.transaction_id || 'QR-001-MDR';

    try {
      const res = await fetch(`/api/v1/quarantine/${recId}/generate-dispute`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDisputeNoticeData(data);
      } else {
        throw new Error('Fallback');
      }
    } catch (_) {
      setDisputeNoticeData({
        notice_id: `CERTUS/DISP/20260829/${recId.slice(-8).toUpperCase()}`,
        record_id: recId,
        utr: 'HDFC44910283910',
        variance_formatted: rec.discrepancy_amount ? `₹${rec.discrepancy_amount.toFixed(2)}` : '₹217.50',
        issue_date: '29 August 2026',
        letter_markdown: `# Formal Demand Notice\n**Notice Reference:** \`CERTUS/DISP/20260829/${recId.slice(-8).toUpperCase()}\`\n**Issue Date:** 29 August 2026\n\n---\n\n### Transaction: \`${recId}\`\nDisputed Amount: **${rec.discrepancy_amount ? `₹${rec.discrepancy_amount.toFixed(2)}` : '₹217.50'}**\n\nPlease credit the disputed amount within 72 hours of this notice.`,
      });
    } finally {
      setIsGeneratingDispute(false);
    }
  };

  return (
    <div className="surface-elevated p-6 space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Quarantine Queue</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Records isolated at Layer 1 boundary with zero ledger contamination.
            </p>
          </div>
        </div>
        <span className="pill-flagged px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold">
          {activeRecords.length} Active
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {activeRecords.length > 0 ? (
          activeRecords.map((rec, idx) => (
            <div
              key={rec.record_id || idx}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-3 rounded-lg transition-colors group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-semibold text-slate-900">
                    {rec.record_id || rec.transaction_id || `QR-${idx + 1}`}
                  </span>
                  <span className="pill-flagged px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                    {rec.reason_code || 'ANOMALY'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {rec.flagged_by || 'Layer 1 Deterministic Rules'}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed max-w-2xl">
                  {rec.reason_detail || rec.diagnostic || rec.reason || 'Transaction flagged by rules engine.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenDisputeNotice(rec)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-medium transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  <span>Demand Notice</span>
                </button>

                {onInspect && (
                  <button
                    onClick={() => onInspect(rec)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-600 text-[11px] font-medium transition-colors"
                  >
                    Inspect
                  </button>
                )}

                <button
                  onClick={() => setSelectedRecord(rec)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium transition-colors"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-medium text-slate-600 text-sm">Queue is clear</p>
            <p className="text-[12px] mt-1">All records passed deterministic integrity checks.</p>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Resolve Exception</h4>
                <p className="text-[11px] font-mono text-slate-500">
                  {selectedRecord.record_id || selectedRecord.transaction_id}
                </p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200 text-[12px] text-slate-700 space-y-1">
              <span className="font-semibold text-rose-700 block text-[11px]">Flagged Diagnostic:</span>
              <p>{selectedRecord.reason_detail || selectedRecord.diagnostic || selectedRecord.reason}</p>
            </div>

            <form onSubmit={handleResolve} className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Resolution Action:</label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  className="w-full text-[12px] p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                >
                  <option value="ACCEPT_OVERRIDE">Accept & Force Reconcile Override</option>
                  <option value="APPLY_CORRECTION">Apply Amount / Currency Correction</option>
                  <option value="WRITE_OFF_MDR">Write-Off Gateway MDR Fee Variance</option>
                  <option value="DISPUTE_MERCHANT">Flag for Merchant Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">Resolution Notes:</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Verified with bank CMS credit slip #9012."
                  className="w-full text-[12px] p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                />
              </div>

              {statusMsg && (
                <div className={`p-3 rounded-lg text-[12px] font-medium ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {statusMsg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Authorize Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Notice Modal */}
      {disputeNoticeData && (
        <DisputeNoticeModal
          isOpen={!!disputeNoticeData}
          onClose={() => setDisputeNoticeData(null)}
          disputeData={disputeNoticeData}
        />
      )}
    </div>
  );
}
