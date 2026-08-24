import React, { useState } from "react";
import { Search, Filter, Download, CheckCircle2, XCircle, AlertTriangle, Clock, User, Bot, Zap } from "lucide-react";

const LOGS = [
  { id: "LOG-5521", type: "system", actor: "Automated Engine", action: "Auto-reconciled batch BCH-88290", status: "success", ts: "2023-10-25 03:12 UTC", txn: "BCH-88290" },
  { id: "LOG-5520", type: "user",   actor: "Sarah Chen",       action: "Manually resolved exception TXN-8920A", status: "success", ts: "2023-10-25 02:45 UTC", txn: "TXN-8920A" },
  { id: "LOG-5519", type: "system", actor: "Automated Engine", action: "Flagged 3 mismatches in batch BCH-88291", status: "error",   ts: "2023-10-25 02:00 UTC", txn: "BCH-88291" },
  { id: "LOG-5518", type: "ai",     actor: "Certus AI",        action: "Generated rule suggestion EU-SWIFT-TZ", status: "info",    ts: "2023-10-25 01:30 UTC", txn: null },
  { id: "LOG-5517", type: "user",   actor: "Admin User",       action: "Added data source: Global Corporate Bank", status: "success", ts: "2023-10-24 18:00 UTC", txn: null },
  { id: "LOG-5516", type: "system", actor: "Stripe Webhook",   action: "Received payout confirmation for TXN-8924A", status: "info", ts: "2023-10-24 14:32 UTC", txn: "TXN-8924A" },
];

const actorIcon = { system: Zap, user: User, ai: Bot };
const actorColor = { system: "#6366F1", user: "#3B82F6", ai: "#E8384F" };
const actorBg = { system: "#EEF2FF", user: "#EFF6FF", ai: "#FEF2F2" };

const statusConfig = {
  success: { icon: CheckCircle2, color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  error:   { icon: XCircle,      color: "#991B1B", bg: "#FEF2F2", border: "#FECACA" },
  info:    { icon: Clock,         color: "#3730A3", bg: "#EEF2FF", border: "#C7D2FE" },
};

export default function AuditLogsScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = LOGS.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || l.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Audit Logs</h1>
          <p className="text-sm text-ink-muted mt-1 font-sans">Complete audit trail of all system and user actions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border-strong rounded-lg text-sm font-medium text-ink-secondary hover:border-ink-secondary transition-all">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border-subtle rounded-lg text-sm font-sans text-ink-primary placeholder-ink-muted outline-none focus:border-border-strong transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {[["all","All"], ["system","System"], ["user","User"], ["ai","AI"]].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === id ? "rgba(232,56,79,0.08)" : "transparent",
                color: filter === id ? "#E8384F" : "#6B7280",
                border: filter === id ? "1px solid rgba(232,56,79,0.3)" : "1px solid #E5E7EB",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface border border-border-subtle rounded-xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-subtle/50 border-b border-border-subtle">
              {["Log ID", "Actor", "Action", "Transaction", "Status", "Timestamp"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((log) => {
              const Icon = actorIcon[log.type] || Zap;
              const sc = statusConfig[log.status];
              const StatusIcon = sc.icon;
              return (
                <tr key={log.id} className="hover:bg-surface-subtle/40 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-mono text-xs text-ink-muted">{log.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: actorBg[log.type] }}>
                        <Icon className="w-3 h-3" style={{ color: actorColor[log.type] }} />
                      </div>
                      <span className="text-sm text-ink-primary font-sans">{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink-secondary font-sans max-w-xs">{log.action}</td>
                  <td className="px-5 py-4">
                    {log.txn ? (
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-surface-subtle border border-border-subtle text-ink-primary">{log.txn}</span>
                    ) : (
                      <span className="text-ink-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      <StatusIcon className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-ink-muted">{log.ts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
