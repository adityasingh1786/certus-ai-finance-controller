import React, { useState } from "react";
import { Filter, Sparkles, CheckCircle2, XCircle, AlertTriangle, Copy, ChevronRight } from "lucide-react";

const RECORDS = [
  {
    id: "R1",
    bankName: "Stripe Payout",
    bankDate: "Oct 15, 2023",
    bankRef: "REF-99234",
    bankAmt: "+$12,450.00",
    bankPos: true,
    status: "MATCHED",
    ledgerName: "Stripe Batch Settlement",
    ledgerDate: "Oct 15, 2023",
    ledgerRef: "JE-4491",
    ledgerAmt: "+$12,450.00",
    ledgerPos: true,
  },
  {
    id: "R2",
    bankName: "AWS Services",
    bankDate: "Oct 14, 2023",
    bankRef: "REF-1102A",
    bankAmt: "-$1,240.50",
    bankPos: false,
    status: "MISMATCHED",
    ledgerName: "Amazon Web Serv",
    ledgerDate: "Oct 14, 2023",
    ledgerRef: "JE-4482",
    ledgerAmt: "-$1,280.00",
    ledgerPos: false,
  },
  {
    id: "R3",
    bankName: "Gusto Payroll",
    bankDate: "Oct 12, 2023",
    bankRef: "REF-88331",
    bankAmt: "-$45,920.00",
    bankPos: false,
    status: "MISSING",
    ledgerName: null,
    ledgerDate: null,
    ledgerRef: null,
    ledgerAmt: null,
    ledgerPos: false,
  },
  {
    id: "R4",
    bankName: "Office Supplies Inc",
    bankDate: "Oct 10, 2023",
    bankRef: "REF-0012",
    bankAmt: "-$340.00",
    bankPos: false,
    status: "DUPLICATE",
    ledgerName: "Office Supplies",
    ledgerDate: "Oct 10, 2023",
    ledgerRef: "JE-4390",
    ledgerAmt: "-$340.00",
    ledgerPos: false,
  },
];

const statusConfig = {
  MATCHED:    { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  MISMATCHED: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
  MISSING:    { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  DUPLICATE:  { bg: "#EEF2FF", text: "#3730A3", border: "#C7D2FE" },
};

function StatusBadge({ status }) {
  const s = statusConfig[status] || statusConfig.MATCHED;
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

export default function ReconciliationWorkspace({ onSelectRecord }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Reconciliation Workspace</h1>
          <p className="text-sm text-ink-muted mt-1 font-sans">Bank Statement vs. Internal Ledger (Oct 1 - Oct 31, 2023)</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border-strong rounded-lg text-sm font-medium text-ink-secondary hover:border-ink-secondary hover:text-ink-primary transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#E8384F,#D02B41)", boxShadow: "0 2px 8px rgba(232,56,79,0.30)" }}>
            <Sparkles className="w-4 h-4" />
            Auto-Resolve
          </button>
        </div>
      </div>

      {/* AI Summary Banner */}
      <div className="bg-surface border border-border-subtle rounded-xl p-4 flex items-start gap-3"
        style={{ borderLeft: "3px solid #6366F1" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(99,102,241,0.1)" }}>
          <Sparkles className="w-4 h-4" style={{ color: "#6366F1" }} />
        </div>
        <div>
          <p className="font-semibold text-sm text-ink-primary font-display">AI Summary</p>
          <p className="text-sm text-ink-secondary font-sans mt-0.5 leading-relaxed">
            Detected 3 mismatches primarily related to currency conversion delays on Oct 14th transactions.
            1 missing record from Stripe batch processing. Overall match rate is 98.4%.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-card">
        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_auto_1fr] border-b border-border-subtle">
          <div className="px-5 py-3 flex items-center justify-between border-r border-border-subtle bg-surface-subtle/50">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Bank Statement (Chase)</span>
            <span className="text-xs font-mono text-ink-muted">USD</span>
          </div>
          <div className="w-36 px-4 py-3 flex items-center justify-center bg-surface-subtle/50">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between bg-surface-subtle/50">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Internal Ledger (NetSuite)</span>
            <span className="text-xs font-mono text-ink-muted">USD</span>
          </div>
        </div>

        {/* Rows */}
        {RECORDS.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[1fr_auto_1fr] border-b border-border-subtle last:border-0 cursor-pointer transition-colors"
            style={{ backgroundColor: hovered === r.id ? "rgba(0,0,0,0.02)" : "transparent" }}
            onMouseEnter={() => setHovered(r.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelectRecord && onSelectRecord(r)}
          >
            {/* Left: Bank */}
            <div className="px-5 py-4 border-r border-border-subtle">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm text-ink-primary">{r.bankName}</p>
                  <p className="text-xs text-ink-muted font-mono mt-0.5">{r.bankDate}</p>
                  <p className="text-xs text-ink-muted font-mono">{r.bankRef}</p>
                </div>
                <span className="font-mono font-semibold text-sm" style={{ color: r.bankPos ? "#065F46" : "#111827" }}>
                  {r.bankAmt}
                </span>
              </div>
            </div>

            {/* Center: Status */}
            <div className="w-36 px-4 py-4 flex flex-col items-center justify-center gap-2">
              <StatusBadge status={r.status} />
              {r.status === "MISMATCHED" && (
                <button
                  className="px-2 py-0.5 text-[10px] font-bold uppercase rounded"
                  style={{ background: "#E8384F", color: "white" }}
                  onClick={(e) => { e.stopPropagation(); onSelectRecord && onSelectRecord(r); }}
                >
                  RESOLVE
                </button>
              )}
            </div>

            {/* Right: Ledger */}
            <div className="px-5 py-4">
              {r.ledgerName ? (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-ink-primary">{r.ledgerName}</p>
                    <p className="text-xs text-ink-muted font-mono mt-0.5">{r.ledgerDate}</p>
                    <p className="text-xs text-ink-muted font-mono">{r.ledgerRef}</p>
                  </div>
                  <span className="font-mono font-semibold text-sm" style={{ color: r.status === "MISMATCHED" ? "#E8384F" : "#111827" }}>
                    {r.ledgerAmt}
                  </span>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-sm italic text-ink-muted">No matching record found</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
