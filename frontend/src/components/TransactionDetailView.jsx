import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";

const FIELDS = [
  { label: "Settlement Date", a: "2023-10-24  14:32:00 UTC", b: "2023-10-24  14:32:00 UTC", ok: true },
  { label: "Reference ID",    a: "ch_3Nl4...9Xq1",           b: "ch_3Nl4...9Xq1",           ok: true },
  { label: "Gross Amount",    a: "$4,250.00",                  b: "$4,250.05",                 ok: false, highlight: true },
  { label: "Currency",        a: "USD",                        b: "USD",                       ok: true },
];

const AUDIT = [
  { actor: "System", action: "flagged transaction as", tag: "Mismatched", note: "Automated reconciliation job #9021", ts: "2023-10-25  02:00 UTC" },
  { actor: "Ledger API", action: "ingested internal record", tag: null, note: null, ts: "2023-10-24  14:35 UTC" },
  { actor: "Stripe Webhook", action: "received payout confirmation", tag: null, note: null, ts: "2023-10-24  14:32 UTC" },
];

export default function TransactionDetailView({ onBack }) {
  const [resolution, setResolution] = useState(null);
  const [note, setNote] = useState("");
  const [resolved, setResolved] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary transition-colors mb-4 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          BACK TO RECORDS
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Transaction #TXN-8924A</h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase border"
                style={{ background: "#FEF2F2", color: "#991B1B", borderColor: "#FECACA" }}>
                MISMATCHED
              </span>
            </div>
            <p className="text-sm text-ink-muted font-sans mt-1">Stripe Payout vs. Internal Ledger</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-border-strong rounded-lg text-sm font-medium text-ink-secondary hover:border-ink-secondary transition-all">
              Export Audit
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#E8384F,#D02B41)", boxShadow: "0 2px 8px rgba(232,56,79,0.30)" }}>
              Force Reconcile
            </button>
          </div>
        </div>
      </div>

      {/* Two-col layout */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left: Data Comparison */}
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle">
              <h2 className="font-display font-semibold text-base text-ink-primary">Data Comparison</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-surface-subtle/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider w-40">Field</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Source A (Stripe)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Source B (Ledger)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider w-20">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {FIELDS.map((f) => (
                  <tr key={f.label} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-ink-muted font-sans">{f.label}</td>
                    <td className="px-6 py-4">
                      {f.highlight ? (
                        <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded"
                          style={{ background: "#FEF2F2", color: "#E8384F", border: "1px solid #FECACA" }}>
                          {f.a}
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-ink-primary">{f.a}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {f.highlight ? (
                        <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded"
                          style={{ background: "#FEF2F2", color: "#E8384F", border: "1px solid #FECACA" }}>
                          {f.b}
                        </span>
                      ) : (
                        <span className="font-mono text-sm text-ink-primary">{f.b}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {f.ok ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} />
                      ) : (
                        <AlertCircle className="w-5 h-5" style={{ color: "#E8384F" }} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit Trail */}
          <div className="bg-surface border border-border-subtle rounded-xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle">
              <h2 className="font-display font-semibold text-base text-ink-primary">Audit Trail</h2>
            </div>
            <div className="divide-y divide-border-subtle">
              {AUDIT.map((a, i) => (
                <div key={i} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-border-strong mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-ink-primary">
                        <span className="font-semibold">{a.actor}</span> {a.action}{" "}
                        {a.tag && <span className="font-semibold" style={{ color: "#E8384F" }}>{a.tag}</span>}
                      </p>
                      {a.note && <p className="text-xs text-ink-muted mt-0.5 font-sans">{a.note}</p>}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-ink-muted flex-shrink-0">{a.ts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Analysis + Resolution */}
        <div className="space-y-4">
          {/* AI Panel */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card"
            style={{ borderTop: "2px solid #6366F1" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6366F1" }}>✦ AI Analysis</span>
            </div>
            <p className="text-sm text-ink-secondary font-sans leading-relaxed">
              The discrepancy of{" "}
              <span className="font-mono font-bold text-ink-primary">$0.05</span>{" "}
              is likely due to a floating-point rounding error in the internal ledger fee calculation script deployed on 2023-10-23.
            </p>
            <button className="mt-3 text-xs font-semibold flex items-center gap-1" style={{ color: "#6366F1" }}>
              VIEW SIMILAR ANOMALIES <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Resolution Options */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Resolution Options</p>

            {[
              { id: "stripe", title: "Accept Stripe Value", desc: "Adjust ledger entry to $4,250.00" },
              { id: "ledger", title: "Accept Ledger Value", desc: "Maintain $4,250.05, flag for review" },
            ].map((opt) => (
              <label key={opt.id}
                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-border-strong"
                style={{ borderColor: resolution === opt.id ? "#E8384F" : "#E5E7EB" }}>
                <div className="relative mt-0.5">
                  <input type="radio" name="resolution" value={opt.id}
                    checked={resolution === opt.id}
                    onChange={() => setResolution(opt.id)}
                    className="sr-only" />
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: resolution === opt.id ? "#E8384F" : "#D1D5DB" }}>
                    {resolution === opt.id && (
                      <div className="w-2 h-2 rounded-full" style={{ background: "#E8384F" }} />
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm text-ink-primary">{opt.title}</p>
                  <p className="text-xs text-ink-muted font-sans">{opt.desc}</p>
                </div>
              </label>
            ))}

            {/* Note */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Resolution Note (Optional)</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Rounding tolerance applied..."
                className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg resize-none font-sans text-ink-primary placeholder-ink-muted outline-none focus:border-border-strong transition-colors"
                rows={3}
              />
            </div>

            {resolved ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold" style={{ background: "#ECFDF5", color: "#065F46" }}>
                <CheckCircle2 className="w-4 h-4" />
                Marked as Resolved
              </div>
            ) : (
              <button
                onClick={() => resolution && setResolved(true)}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-40"
                style={{
                  background: resolution ? "linear-gradient(135deg,#E8384F,#D02B41)" : "#9CA3AF",
                  boxShadow: resolution ? "0 2px 8px rgba(232,56,79,0.30)" : "none",
                }}
                disabled={!resolution}
              >
                Mark as Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
