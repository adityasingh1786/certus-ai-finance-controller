import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import CertusLogo from './CertusLogo';

export default function ArchitectureModal({ isOpen, onClose }) {
  const [activeLayer, setActiveLayer] = useState(1);

  if (!isOpen) return null;

  const ARCH_LAYERS = [
    {
      id: 0,
      badge: 'LAYER 0',
      title: '4-Channel Ingestion & 20-Scenario Engine',
      techTag: 'Sanitization & Integer Quantization',
      latency: '< 4ms',
      summary: 'Heterogeneous multi-source data extraction converting raw floats into exact integer paisa structures.',
      details: [
        'Channel 1: Razorpay Gateway Instant Capture / Settlement Stream (MDR, GST, Section 194-O TDS).',
        'Channel 2: Multi-Bank CMS Statements (HDFC, ICICI, SBI, Axis) with 16-digit Indian UTR regex parsers.',
        'Channel 3: ERP General Ledgers (SAP S/4HANA, Tally Prime, NetSuite) with automatic voucher validation.',
        'Channel 4: Human-in-the-Loop Quarantine Audit Stream with immutable transaction lifecycle tracking.',
        '20 Pre-Configured Enterprise Scenarios covering D2C, B2B SaaS, Quick Commerce, and FinTech.',
      ],
    },
    {
      id: 1,
      badge: 'LAYER 1',
      title: 'Deterministic Invariant Rules Engine',
      techTag: 'Zero-LLM Boundary / Fail-Closed',
      latency: '1.37 ms (8,345 ops/s)',
      summary: '55 mathematical invariant checks executed before data touches storage, isolating anomalies to Quarantine.',
      details: [
        'Rule 1 (INV_PAISA_MATH): Absolute integer paisa quantization eliminating IEEE-754 floating-point drift.',
        'Rule 2 (INV_MDR_RATE): Strict 50 bps tolerance gate trapping unauthorized payment processor rate hikes.',
        'Rule 3 (INV_DUPLICATE_ID): In-flight batch duplicate payment ID and order ID isolation.',
        'Rule 4 (INV_UTR_INTEGRITY): Mandatory 16-digit bank CMS reference validation with format checksum.',
        'Rule 5 (INV_FAIL_CLOSED): Any rule violation triggers automatic isolation with zero ledger pollution.',
      ],
    },
    {
      id: 2,
      badge: 'LAYER 2',
      title: '3-Signal Composite Matching & RapidFuzz',
      techTag: 'Weighted Multi-Signal Consensus',
      latency: '< 12ms',
      summary: 'Continuous 3-signal mathematical scoring with Double-Lock confidence gate (≥ 0.75 threshold).',
      details: [
        'Signal 1 (50% Weight): Exact Amount Match adjusted for MDR fee schedule and Section 194-O TDS deductions.',
        'Signal 2 (30% Weight): Reference & Bank UTR checksum with RapidFuzz token sorting on merchant entities.',
        'Signal 3 (20% Weight): Settlement Date Proximity within standard T+1 / T+2 banking transit clearance.',
        'Double-Lock Threshold: Records with composite confidence ≥ 0.75 are automatically cleared to the General Ledger.',
      ],
    },
    {
      id: 3,
      badge: 'LAYER 3',
      title: 'Fail-Closed Quarantine & Audit Engine',
      techTag: 'Automated Isolation Matrix',
      latency: '< 6ms',
      summary: 'Cryptographic ledger isolation preventing corrupted records from polluting balance sheets.',
      details: [
        'Exact Paisa Variance Accounting: Records the exact mathematical delta (e.g. +₹217.50 MDR Rate Drift).',
        'Double-Lock Release Protocol: Requires administrative authorization and rationale before releasing quarantined funds.',
        'Cryptographic Audit Logging: Generates tamper-proof SHA-256 state receipts for every lifecycle mutation.',
      ],
    },
    {
      id: 4,
      badge: 'LAYER 4',
      title: 'Sovereign Treasury & Liquidity Forecaster',
      techTag: 'In-Flight Gateway Transit Model',
      latency: '< 8ms',
      summary: 'Dynamic 14-day cash projection factoring verified gateway in-transit settlements and 3-way variance.',
      details: [
        'In-Flight Transit Pipeline: Accurately projects funds stuck in gateway transit across T+1 / T+2 banking windows.',
        '3-Way Balance Audit Equation: Continuous verification of (Net Bank Credit = Invoices - MDR - TDS).',
        'Liquidity Health Metrics: Real-time working capital stress indicators and payment rail velocity meters.',
      ],
    },
    {
      id: 5,
      badge: 'LAYER 5',
      title: 'Autonomous AI Copilot ReAct Studio',
      techTag: 'Strict Read-Only Treasury Analyst',
      latency: '< 15ms',
      summary: 'Read-only financial analyst delivering 4-tier structured audit reports with SQLite WAL fallback.',
      details: [
        'Strict Read-Only Boundary: Zero write permissions on live financial rails prevents unintended ledger mutations.',
        'Mandatory Verified Citations: Every forensic explanation references immutable record IDs and UTR checksums.',
        'Air-Gapped Local WAL Continuity: Guaranteed operational resilience and instant offline recovery.',
      ],
    },
  ];

  const active = ARCH_LAYERS.find((l) => l.id === activeLayer) || ARCH_LAYERS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-primary/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-surface border border-border-subtle rounded-lg shadow-modal overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-page">
          <div className="flex items-center gap-3">
            <CertusLogo className="w-6 h-6" />
            <div>
              <h3 className="font-display font-bold text-sm text-ink-primary">
                Certus 6-Layer Architecture Blueprint
              </h3>
              <p className="text-xs text-ink-muted">
                Deterministic Invariant Boundary • Double-Lock Consensus • Read-Only AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary p-1.5 rounded-md hover:bg-surface transition-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-surface">
          
          {/* Left Column: Layer Selector */}
          <div className="w-full md:w-72 border-r border-border-subtle p-3 space-y-1 overflow-y-auto bg-page shrink-0">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-muted px-2 py-1 block">
              Architectural Layers (0–5)
            </span>

            {ARCH_LAYERS.map((layer) => {
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full p-2.5 rounded-md text-left transition-fast flex items-center justify-between group ${
                    isSelected
                      ? 'bg-ink-primary text-white shadow-subtle'
                      : 'hover:bg-surface text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[9px] font-mono font-medium px-1 py-0.2 rounded ${
                        isSelected ? 'bg-white/10 text-white' : 'bg-surface border border-border-subtle text-ink-muted'
                      }`}>
                        {layer.badge}
                      </span>
                      <span className={`text-[10px] font-mono ${
                        isSelected ? 'text-slate-300' : 'text-ink-muted'
                      }`}>
                        {layer.latency}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold line-clamp-1">
                      {layer.title.split('&')[0].trim()}
                    </h4>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-white' : 'text-ink-muted group-hover:text-ink-primary'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Layer Specification */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-5 bg-surface">
            
            {/* Header info */}
            <div className="space-y-2 pb-4 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-ink-primary bg-page px-2.5 py-0.5 rounded border border-border-subtle">
                  {active.badge} • {active.techTag}
                </span>
                <span className="text-xs font-mono text-ink-muted bg-page px-2 py-0.5 rounded border border-border-subtle">
                  Latency: {active.latency}
                </span>
              </div>

              <h2 className="text-lg font-display font-bold text-ink-primary pt-1">
                {active.title}
              </h2>
              <p className="text-xs text-ink-secondary leading-relaxed">
                {active.summary}
              </p>
            </div>

            {/* Invariant Specs List */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-mono font-semibold text-ink-muted uppercase tracking-wider">
                Formal Mathematical Invariants & Verification Rules:
              </h4>

              <div className="space-y-2">
                {active.details.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-ink-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-ink-primary mt-1.5 shrink-0" />
                    <span className="leading-relaxed font-sans">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fail-Closed Guarantee */}
            <div className="p-3.5 rounded-md bg-page border border-border-subtle flex items-center justify-between text-xs text-ink-secondary">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic Boundary: Zero unverified data reaches trusted storage.</span>
              </div>
              <span className="font-mono text-[10px] font-medium text-ink-muted bg-surface px-1.5 py-0.5 rounded border border-border-subtle">
                AIR-GAP ENFORCED
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-page flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>Certus v2.5 Enterprise</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-ink-primary hover:bg-slate-800 text-white text-xs font-medium shadow-subtle transition-fast"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}
