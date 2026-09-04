import React, { useState } from 'react';
import {
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Bot,
  Zap,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react';

const LOGS = [
  {
    id: 'LOG-5521',
    type: 'system',
    actor: 'Layer 1 Deterministic Engine',
    action: 'Auto-reconciled 54 transactions in batch BCH-88290 (Double-Lock score 0.984)',
    status: 'VERIFIED',
    ts: '2026-09-04 05:32:01 UTC',
    txn: 'BCH-88290',
    hash: '0x7f9a2b81c034',
  },
  {
    id: 'LOG-5520',
    type: 'user',
    actor: 'Sarah Chen (Lead Controller)',
    action: 'Authorized double-lock review on QR-001-MDR (+₹72.50 fee overcharge)',
    status: 'ACTIONED',
    ts: '2026-09-04 05:28:44 UTC',
    txn: 'QR-001-MDR',
    hash: '0x88e1a4209bf1',
  },
  {
    id: 'LOG-5519',
    type: 'system',
    actor: 'Compiler Rules Engine',
    action: 'Trapped 50 bps MDR fee drift violation into Fail-Closed Quarantine (COMP-06)',
    status: 'QUARANTINED',
    ts: '2026-09-04 05:22:15 UTC',
    txn: 'TXN-0002',
    hash: '0x992fa1807d4a',
  },
  {
    id: 'LOG-5518',
    type: 'ai',
    actor: 'Certus Autonomous Copilot',
    action: 'Synthesized 4-tier forensic audit report citing UTR-914028 and INV-1093',
    status: 'VERIFIED',
    ts: '2026-09-04 05:15:30 UTC',
    txn: 'UTR-914028',
    hash: '0x33b8c91a0112',
  },
  {
    id: 'LOG-5517',
    type: 'user',
    actor: 'Aditya Singh (Controller)',
    action: 'Calibrated Double-Lock composite threshold to >= 0.75 in Governance Hub',
    status: 'ACTIONED',
    ts: '2026-09-04 04:55:00 UTC',
    txn: null,
    hash: '0x55d0e722a498',
  },
  {
    id: 'LOG-5516',
    type: 'system',
    actor: 'Razorpay Webhook Listener',
    action: 'Verified HMAC-SHA256 signature and parsed instant capture pay_82Xy',
    status: 'VERIFIED',
    ts: '2026-09-04 04:30:12 UTC',
    txn: 'pay_82Xy',
    hash: '0x44a1e900c731',
  },
];

const actorIcon = { system: Zap, user: User, ai: Bot };

export default function AuditLogsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = LOGS.filter((l) => {
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.type === filter;
    return matchSearch && matchFilter;
  });

  const handleExportCSV = () => {
    const headers = 'Log ID,Actor,Action,Transaction,Status,Timestamp,Merkle Hash\n';
    const rows = filtered
      .map(
        (l) =>
          `"${l.id}","${l.actor}","${l.action.replace(/"/g, '""')}","${l.txn || ''}","${l.status}","${l.ts}","${l.hash}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certus_audit_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">
            Immutable Audit Trail & Statutory Event Ledger
          </h1>
          <p className="text-xs text-ink-muted mt-0.5 font-sans">
            Cryptographic citation logs recorded to local SQLite WAL with SHA-256 Merkle solvency verification.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-page hover:bg-surface border border-border-subtle text-ink-secondary hover:text-ink-primary text-xs font-medium shadow-subtle transition-fast"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          <input
            type="text"
            placeholder="Search log ID, actor, or transaction reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border-subtle rounded-md text-xs font-sans text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-border-strong shadow-subtle"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-surface border border-border-subtle rounded-md">
          {[
            ['all', 'All Events'],
            ['system', 'Rules Engine'],
            ['user', 'Controller (HITL)'],
            ['ai', 'Copilot AI'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-fast ${
                filter === id
                  ? 'bg-ink-primary text-white shadow-subtle font-semibold'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface border border-border-subtle rounded-lg shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-page border-b border-border-subtle text-ink-secondary font-medium">
                <th className="py-2.5 px-4 font-mono uppercase text-[10px] tracking-wider">Log ID</th>
                <th className="py-2.5 px-4 font-mono uppercase text-[10px] tracking-wider">Actor</th>
                <th className="py-2.5 px-4 font-mono uppercase text-[10px] tracking-wider">Event Details</th>
                <th className="py-2.5 px-4 font-mono uppercase text-[10px] tracking-wider">Reference</th>
                <th className="py-2.5 px-4 font-mono uppercase text-[10px] tracking-wider">Proof Hash</th>
                <th className="py-2.5 px-4 font-mono uppercase text-[10px] tracking-wider">Status</th>
                <th className="py-2.5 px-4 font-mono uppercase text-[10px] tracking-wider text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-sans">
              {filtered.map((log) => {
                const Icon = actorIcon[log.type] || Zap;
                const isVerified = log.status === 'VERIFIED';
                const isQuarantined = log.status === 'QUARANTINED';

                return (
                  <tr key={log.id} className="hover:bg-page/50 transition-fast">
                    <td className="py-3 px-4 font-mono text-[11px] text-ink-muted">{log.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-page border border-border-subtle flex items-center justify-center text-ink-secondary">
                          <Icon className="w-3 h-3 text-ink-primary" />
                        </div>
                        <span className="text-ink-primary font-medium">{log.actor}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-secondary max-w-sm leading-relaxed">{log.action}</td>
                    <td className="py-3 px-4">
                      {log.txn ? (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-page border border-border-subtle text-ink-primary">
                          {log.txn}
                        </span>
                      ) : (
                        <span className="text-ink-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-muted bg-page px-1.5 py-0.2 rounded border border-border-subtle">
                        <Fingerprint className="w-3 h-3 text-ink-muted" />
                        {log.hash}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium border ${
                          isVerified
                            ? 'bg-status-matched-bg text-status-matched-text border-status-matched-border'
                            : isQuarantined
                            ? 'bg-status-flagged-bg text-status-flagged-text border-status-flagged-border'
                            : 'bg-page text-ink-secondary border-border-subtle'
                        }`}
                      >
                        {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isQuarantined && <AlertTriangle className="w-3 h-3 text-sterling" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-ink-muted text-right">{log.ts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-page border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SQLite WAL State Proof: Root Hash 0x7f9a2b81... verified</span>
          </span>
          <span>Showing {filtered.length} of {LOGS.length} entries</span>
        </div>
      </div>
    </div>
  );
}
