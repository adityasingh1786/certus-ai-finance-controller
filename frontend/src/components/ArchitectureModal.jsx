import React from 'react';
import { X, ShieldCheck, Cpu, Database, CheckCircle2, Lock } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/30 transition-fast">
      <div className="w-full max-w-2xl bg-surface border border-border-subtle rounded-lg shadow-modal p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h3 className="font-display font-bold text-base text-ink-primary">
              Certus System Architecture Blueprint
            </h3>
            <p className="text-xs text-ink-muted">Dual-Layer Validation & Double-Lock Verification</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary p-1 rounded hover:bg-page"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="space-y-3 font-mono text-xs">
          {/* Step 1 */}
          <div className="p-3.5 rounded-lg border border-border-subtle bg-page">
            <div className="flex items-center justify-between font-semibold text-ink-primary">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sterling text-white flex items-center justify-center text-[10px]">1</span>
                Multi-Source Ingestion & Dynamic Column Detection
              </span>
              <span className="text-[10px] text-ink-muted">FastAPI / CSV</span>
            </div>
            <p className="font-sans text-xs text-ink-secondary mt-1.5 leading-relaxed">
              Accepts heterogeneous CSV extracts (Razorpay, Bank, ERP). Inspects header strings and sample value shapes to dynamically bind amounts, UTRs, and dates.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between font-semibold text-emerald-900">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                Layer 1: Deterministic Rules Engine
              </span>
              <span className="text-[10px] text-emerald-800">Zero LLM Cost</span>
            </div>
            <p className="font-sans text-xs text-emerald-800 mt-1.5 leading-relaxed">
              Runs mathematical sanity checks (net &le; gross, valid currency whitelist, batch duplicate IDs). Corrupted records are isolated immediately to Quarantine.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-lg border border-border-strong bg-surface">
            <div className="flex items-center justify-between font-semibold text-ink-primary">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-ink-primary text-white flex items-center justify-center text-[10px]">3</span>
                Double-Lock Confidence Gate (Threshold: 0.75)
              </span>
              <span className="text-[10px] text-sterling font-bold">DOUBLE-LOCK</span>
            </div>
            <p className="font-sans text-xs text-ink-secondary mt-1.5 leading-relaxed">
              Auto-reconciliation requires verifiable rule precision (amount 50%, reference 30%, date 20%) to clear &ge; 0.75. Discrepancies and ambiguous items route safely to exceptions.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/50">
            <div className="flex items-center justify-between font-semibold text-indigo-950">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">4</span>
                Immutable SQLite Persistence & Read-Only Copilot
              </span>
              <span className="text-[10px] text-indigo-800">100% Citations</span>
            </div>
            <p className="font-sans text-xs text-indigo-900 mt-1.5 leading-relaxed">
              Audit logs, reconciliation runs, and settlement records persist across server restarts. Read-only AI agent queries trusted ledger with mandatory transaction citations.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-ink-primary text-white text-xs font-semibold hover:bg-ink-secondary transition-fast"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}
