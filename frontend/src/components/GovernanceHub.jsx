import React, { useState } from 'react';
import {
  Cpu,
  Sliders,
  Layers,
  Terminal,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
} from 'lucide-react';
import SubTabBar from './SubTabBar';

export default function GovernanceHub({ onOpenArchitecture, onOpenSwagger }) {
  const [activeSubTab, setActiveSubTab] = useState('consensus');
  const [gateThreshold, setGateThreshold] = useState(0.75);
  const [amountWeight, setAmountWeight] = useState(50);
  const [refWeight, setRefWeight] = useState(30);
  const [dateWeight, setDateWeight] = useState(20);

  const tabs = [
    {
      id: 'consensus',
      label: 'Consensus Relay Matrix',
      icon: Cpu,
      badge: '4 Multi-Model',
    },
    {
      id: 'config',
      label: 'Double-Lock Parameters',
      icon: Sliders,
      badge: `≥ ${(gateThreshold || 0.75).toFixed(2)} Gate`,
    },
    {
      id: 'blueprint',
      label: 'Architecture & API Spec',
      icon: Layers,
      badge: 'OpenAPI 3.1',
    },
  ];

  const RELAY_HOPS = [
    {
      hop: 'Hop 1: Rapid Ingest',
      model: 'Groq LLaMA 3.3 70B',
      role: 'Produces rapid initial verdict and preliminary confidence score.',
      avgLatency: '118ms',
      status: 'Active (Primary)',
      color: '#E8384F',
    },
    {
      hop: 'Hop 2: Independent Review',
      model: 'Google Gemini 2.5 Pro',
      role: 'Reviews raw transaction with blind evaluation. If concurs with Hop 1, triggers Early Exit.',
      avgLatency: '420ms',
      status: 'Active (Early Exit Gate)',
      color: '#4FD1FF',
    },
    {
      hop: 'Hop 3: Escalation Arbiter',
      model: 'OpenAI GPT-4o',
      role: 'Invoked only when Hop 1 and Hop 2 disagree. Evaluates fuzzy reference discrepancy.',
      avgLatency: '680ms',
      status: 'Standby (Dissent Escalation)',
      color: '#FFB020',
    },
    {
      hop: 'Hop 4: Senior Authority',
      model: 'Anthropic Claude 3.5 Sonnet',
      role: 'Final authority on complex cross-border or composite MDR disputes.',
      avgLatency: '890ms',
      status: 'Standby (Senior Auditor)',
      color: '#A855F7',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Nested Sub-Tab Navigation Bar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
      />

      {/* Sub-View 1: Consensus Relay Matrix */}
      {activeSubTab === 'consensus' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Multi-Model Consensus Relay Architecture
                </h3>
                <p className="text-xs text-ink-muted">
                  Serial escalation engine that executes early exits when models concur, escalating only on dissent.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                EARLY-EXIT OPTIMIZED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RELAY_HOPS.map((h, idx) => (
                <div key={idx} className="p-5 bg-page rounded-xl border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sterling uppercase">
                      {h.hop}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface border border-border-subtle text-ink-primary">
                      {h.avgLatency}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-ink-primary">{h.model}</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed font-sans">{h.role}</p>
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono">
                    <span className="text-ink-muted">Relay Policy</span>
                    <span className="font-semibold text-emerald-600">{h.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 2: Double-Lock Parameters */}
      {activeSubTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Double-Lock Gate Calibration & Signal Dials
                </h3>
                <p className="text-xs text-ink-muted">
                  Configure autonomous reconciliation acceptance thresholds and signal weight allocations.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sterling-light/60 text-sterling border border-sterling-border">
                FAIL-CLOSED POLICY
              </span>
            </div>

            {/* Threshold Slider */}
            <div className="p-5 bg-page rounded-xl border border-border-subtle space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-display font-bold text-sm text-ink-primary">
                    Confidence Acceptance Threshold
                  </h4>
                  <p className="text-xs text-ink-muted font-sans">
                    Both Layer 1 rule score and Layer 2 LLM confidence must independently clear this gate.
                  </p>
                </div>
                <span className="text-2xl font-mono font-bold text-sterling tabular-nums">
                  {gateThreshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={gateThreshold}
                onChange={(e) => setGateThreshold(parseFloat(e.target.value))}
                className="w-full accent-sterling cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-ink-muted">
                <span>0.50 (Permissive)</span>
                <span>0.75 (Default Institutional Standard)</span>
                <span>0.95 (Ultra-Strict)</span>
              </div>
            </div>

            {/* Signal Weights Configuration */}
            <div className="p-5 bg-page rounded-xl border border-border-subtle space-y-4">
              <h4 className="font-display font-bold text-sm text-ink-primary">
                Multi-Signal Scoring Allocations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface rounded-lg border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-ink-primary">1. Amount Weight</span>
                    <span className="font-mono font-bold text-sterling">{amountWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="70"
                    value={amountWeight}
                    onChange={(e) => setAmountWeight(parseInt(e.target.value))}
                    className="w-full accent-sterling"
                  />
                  <span className="text-[10px] text-ink-muted block font-sans">Gross vs Net Settlement delta</span>
                </div>

                <div className="p-4 bg-surface rounded-lg border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-ink-primary">2. Reference Weight</span>
                    <span className="font-mono font-bold text-sterling">{refWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={refWeight}
                    onChange={(e) => setRefWeight(parseInt(e.target.value))}
                    className="w-full accent-sterling"
                  />
                  <span className="text-[10px] text-ink-muted block font-sans">Bank UTR & RapidFuzz entity match</span>
                </div>

                <div className="p-4 bg-surface rounded-lg border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-ink-primary">3. Date Weight</span>
                    <span className="font-mono font-bold text-sterling">{dateWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={dateWeight}
                    onChange={(e) => setDateWeight(parseInt(e.target.value))}
                    className="w-full accent-sterling"
                  />
                  <span className="text-[10px] text-ink-muted block font-sans">T+1/T+2 transit window tolerance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 3: Architecture & API Blueprint */}
      {activeSubTab === 'blueprint' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  System Architecture Blueprint & OpenAPI Specs
                </h3>
                <p className="text-xs text-ink-muted">
                  Interactive blueprint modals and direct Swagger endpoint documentation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenArchitecture}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-page border border-border-subtle text-xs font-semibold text-ink-primary transition-fast"
                >
                  <Layers className="w-3.5 h-3.5 text-sterling" />
                  <span>Launch Blueprint Modal</span>
                </button>
                <button
                  onClick={onOpenSwagger}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sterling hover:bg-sterling-hover text-white text-xs font-semibold shadow-subtle transition-fast"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Open Swagger API</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-page rounded-xl border border-border-subtle space-y-3 font-mono text-xs">
              <span className="text-xs font-bold text-ink-primary font-display block">
                Production API Contract Endpoints:
              </span>
              <div className="divide-y divide-border-subtle">
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold mr-2">POST</span>
                    <span className="font-bold text-ink-primary">/api/v1/reconcile</span>
                  </div>
                  <span className="text-ink-muted font-sans text-xs">3-File Multipart CSV Ingest & 3-Way Match</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold mr-2">POST</span>
                    <span className="font-bold text-ink-primary">/api/v1/reconcile/demo</span>
                  </div>
                  <span className="text-ink-muted font-sans text-xs">Instant 60-Record Synthetic Dataset Run</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold mr-2">GET</span>
                    <span className="font-bold text-ink-primary">/api/v1/cash-position</span>
                  </div>
                  <span className="text-ink-muted font-sans text-xs">Audited Real-Time Ledger Cash Aggregates</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold mr-2">GET</span>
                    <span className="font-bold text-ink-primary">/api/v1/cash-position/forecast</span>
                  </div>
                  <span className="text-ink-muted font-sans text-xs">14-Day Trajectory with Confidence Intervals</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold mr-2">GET</span>
                    <span className="font-bold text-ink-primary">/api/v1/quarantine</span>
                  </div>
                  <span className="text-ink-muted font-sans text-xs">Live SQLite Quarantined Anomaly Traps</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold mr-2">POST</span>
                    <span className="font-bold text-ink-primary">/api/v1/agent/query</span>
                  </div>
                  <span className="text-ink-muted font-sans text-xs">Strict Read-Only Financial Copilot Assistant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
