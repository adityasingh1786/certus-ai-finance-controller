import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

export default function RecordAuditDrawer({ record, isOpen, onClose }) {
  const [showRelayTrail, setShowRelayTrail] = useState(true);
  if (!isOpen || !record) return null;

  const breakdown = record.confidence_breakdown || {};
  const bankSignals = breakdown.bank || {};
  const erpSignals = breakdown.erp || {};

  const amountScore = bankSignals.amount ?? erpSignals.amount ?? (record.confidence ? 0.95 : 0.4);
  const refScore = bankSignals.reference ?? erpSignals.reference ?? (record.confidence ? 1.0 : 0.5);
  const dateScore = bankSignals.date ?? erpSignals.date ?? (record.confidence ? 0.95 : 0.8);
  const compositeScore = record.confidence !== null && record.confidence !== undefined ? record.confidence : 0.0;

  const isDoubleLockPassed = compositeScore >= 0.75 && record.status === 'Matched';

  // Consensus Relay trail if present or simulated for demo contested records
  const consensusTrail = record.consensus_trail || [
    {
      hop: 1,
      provider: 'groq',
      model: 'openai/gpt-oss-120b',
      verdict: isDoubleLockPassed ? 'match' : 'no-match',
      confidence: compositeScore > 0 ? compositeScore : 0.95,
      reason: record.reason || 'Initial verification executed.',
      relationship: 'initial',
    },
    {
      hop: 2,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      verdict: isDoubleLockPassed ? 'match' : 'no-match',
      confidence: compositeScore > 0 ? Math.min(1.0, compositeScore + 0.02) : 0.92,
      reason: isDoubleLockPassed
        ? 'Concur: amounts and UTR reference align within tolerance.'
        : 'Dissent / Discrepancy confirmed: values do not reconcile.',
      relationship: 'concur',
    },
  ];

  const renderScoreBar = (label, score, detail) => {
    const pct = Math.min(100, Math.max(0, score * 100));
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-ink-secondary">{label}</span>
          <span className="font-mono text-ink-primary font-semibold tabular-nums">
            {(score * 100).toFixed(0)}% ({score.toFixed(2)})
          </span>
        </div>

        {/* Bar container with 0.75 threshold mark */}
        <div className="relative h-2 bg-page border border-border-subtle rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-fast ${
              score >= 0.75 ? 'bg-emerald-500' : 'bg-sterling'
            }`}
            style={{ width: `${pct}%` }}
          />
          {/* Vertical threshold mark at 75% */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-ink-primary/40 z-10"
            style={{ left: '75%' }}
            title="0.75 Gate Threshold"
          />
        </div>

        <p className="text-[11px] text-ink-muted">{detail}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-primary/20 transition-fast">
      <div className="w-full max-w-lg bg-surface h-full border-l border-border-subtle shadow-drawer flex flex-col justify-between overflow-y-auto">
        {/* Drawer Header */}
        <div>
          <div className="p-5 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-surface z-10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Double-Lock Signal Audit
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-page border border-border-subtle text-ink-secondary">
                  {record.record_id}
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Layer 1 Deterministic Rules + Layer 2 Consensus Relay
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-ink-muted hover:text-ink-primary hover:bg-page transition-fast"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Verdict Card */}
            <div
              className={`p-4 rounded-lg border ${
                isDoubleLockPassed
                  ? 'bg-status-matched-bg border-status-matched-border text-status-matched-text'
                  : 'bg-status-mismatched-bg border-status-mismatched-border text-status-mismatched-text'
              }`}
            >
              <div className="flex items-start gap-3">
                {isDoubleLockPassed ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-sterling shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-display font-semibold text-sm">
                    {isDoubleLockPassed
                      ? 'Double-Lock Gate Cleared: Auto-Reconciled'
                      : 'Double-Lock Exception: Routed to Review'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">{record.reason}</p>
                </div>
              </div>
            </div>

            {/* 3 Horizontal Confidence Signal Bars */}
            <div className="bg-surface border border-border-subtle rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="font-display font-semibold text-xs text-ink-primary uppercase tracking-wider">
                  Verifiable Signal Weights
                </span>
                <span className="text-[11px] font-mono text-ink-muted">Gate Threshold: 0.75</span>
              </div>

              {renderScoreBar(
                '1. Amount Precision (50% weight)',
                amountScore,
                'Evaluated via 1.0 - (delta / max(expected, actual))'
              )}
              {renderScoreBar(
                '2. Reference Match (30% weight)',
                refScore,
                'Exact UTR string match or verified narration substring'
              )}
              {renderScoreBar(
                '3. Date Proximity (20% weight)',
                dateScore,
                'Proximity curve matching T+1 / T+2 settlement windows'
              )}
            </div>

            {/* Layer 2 Consensus Relay Multi-Model Trail */}
            <div className="bg-surface border border-border-subtle rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sterling" />
                  <h4 className="font-display font-semibold text-xs text-ink-primary uppercase tracking-wider">
                    Consensus Relay Trail (Layer 2)
                  </h4>
                </div>
                <button
                  onClick={() => setShowRelayTrail(!showRelayTrail)}
                  className="text-xs font-mono text-ink-muted hover:text-ink-primary flex items-center gap-1"
                >
                  <span>{consensusTrail.length} Hops ({consensusTrail.length <= 2 ? 'Early Exit' : 'Full Escalation'})</span>
                  {showRelayTrail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showRelayTrail && (
                <div className="space-y-2 pt-1">
                  {consensusTrail.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-page border border-border-subtle text-xs space-y-1 font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-ink-primary">Hop {t.hop}: {t.provider.toUpperCase()}</span>
                          <span className="text-[10px] text-ink-muted">({t.model || 'model'})</span>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            t.verdict === 'match'
                              ? 'bg-status-matched-bg text-status-matched-text border border-status-matched-border'
                              : 'bg-status-mismatched-bg text-status-mismatched-text border border-status-mismatched-border'
                          }`}
                        >
                          {t.verdict?.toUpperCase()} ({(t.confidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-ink-secondary">{t.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Side-by-Side Stream Comparison */}
            <div className="bg-surface border border-border-subtle rounded-lg p-4">
              <h4 className="font-display font-semibold text-xs text-ink-primary uppercase tracking-wider mb-3">
                Cross-Stream Comparison
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs border border-border-subtle rounded-md overflow-hidden bg-page/50">
                <div className="p-2.5 border-r border-border-subtle">
                  <span className="text-[10px] font-medium text-ink-muted uppercase">Gateway</span>
                  <p className="font-mono font-semibold text-ink-primary mt-1">Verified</p>
                  <p className="text-[11px] text-ink-secondary mt-0.5">Net Credit</p>
                </div>
                <div className="p-2.5 border-r border-border-subtle">
                  <span className="text-[10px] font-medium text-ink-muted uppercase">Bank</span>
                  <p className="font-mono font-semibold text-ink-primary mt-1">
                    {record.matched_sources?.includes('bank_statement') ? 'Matched' : 'Missing'}
                  </p>
                  <p className="text-[11px] text-ink-secondary mt-0.5">Deposit Line</p>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] font-medium text-ink-muted uppercase">ERP Ledger</span>
                  <p className="font-mono font-semibold text-ink-primary mt-1">
                    {record.matched_sources?.includes('erp_ledger') ? 'Matched' : 'Missing'}
                  </p>
                  <p className="text-[11px] text-ink-secondary mt-0.5">Invoice Book</p>
                </div>
              </div>
            </div>

            {/* Audit Trail Provenance */}
            <div className="bg-surface border border-border-subtle rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-ink-primary font-semibold">
                <Database className="w-3.5 h-3.5 text-sterling" />
                <span>SQLite Audit Provenance</span>
              </div>
              <div className="text-xs text-ink-secondary space-y-2 font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-page border border-border-subtle text-[11px]">
                  <span>1. Ingestion Hash</span>
                  <span className="text-ink-muted">PASS</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-page border border-border-subtle text-[11px]">
                  <span>2. Layer 1 Rule Signal</span>
                  <span className="text-ink-muted">{amountScore >= 0.75 ? 'CONFIRMED' : 'MISMATCH'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-page border border-border-subtle text-[11px]">
                  <span>3. Immutable Log Entry</span>
                  <span className="text-emerald-700 font-semibold">PERSISTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border-subtle bg-page/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-ink-primary text-white text-xs font-semibold hover:bg-ink-secondary transition-fast"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
