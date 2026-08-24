import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import CertusLogo from './CertusLogo';

/**
 * ArchitectureModal — Certus Enterprise Financial Operating System Architecture Blueprint
 * Comprehensive, interactive visual breakdown of the 6-layer autonomous architecture.
 */
export default function ArchitectureModal({ isOpen, onClose }) {
  const [activeLayer, setActiveLayer] = useState(1);

  if (!isOpen) return null;

  const ARCH_LAYERS = [
    {
      id: 0,
      badge: 'LAYER 0',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: '4-Channel Ingest & 20-Scenario Engine',
      techTag: 'FastAPI / C-BOM Sanitizer',
      latency: '< 4ms',
      summary: 'Dynamic column detection and heterogeneous multi-source data extraction without schema hardcoding.',
      details: [
        'Channel 1: Razorpay Gateway Instant Capture / Settlement Stream (MDR, GST, TDS 194-O, Gross/Net).',
        'Channel 2: Multi-Bank Statements (HDFC, ICICI, SBI, Axis, Kotak) with Indian banking UTR regex parsers.',
        'Channel 3: ERP General Ledgers (SAP S/4HANA, Tally Prime, Zoho Books, NetSuite) with tax breakdown.',
        'Channel 4: Human-in-the-Loop Quarantine Audit Stream with immutable transaction lifecycle tracking.',
        '20 Pre-Configured Enterprise Scenarios covering D2C, B2B SaaS, Quick Commerce, NBFC, and Healthcare.',
      ],
    },
    {
      id: 1,
      badge: 'LAYER 1',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'Deterministic 8-Trap Invariant Engine',
      techTag: 'Zero-LLM Boundary / Fail-Closed',
      latency: '< 1ms (4,666+ rec/s)',
      summary: 'Mathematical sanity checks executed before data touches storage, isolating malformed records to Quarantine.',
      details: [
        'Trap 1: IMPOSSIBLE_VALUE (Negative Gross / Net Amount Traps).',
        'Trap 2: INVALID_CURRENCY (Whitelisted against ISO-4217: INR, USD, EUR, GBP).',
        'Trap 3: DUPLICATE_ID (In-flight batch duplicate payment ID and order ID isolation).',
        'Trap 4: MATHEMATICAL_INCONSISTENCY (Net settlement exceeding gross invoice value).',
        'Trap 5–8: Date temporal boundaries, missing UTR checksums, and zero-amount vouchers.',
      ],
    },
    {
      id: 2,
      badge: 'LAYER 2',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: '3-Signal Composite Matching & RapidFuzz',
      techTag: 'C-Accelerated Scoring',
      latency: '< 12ms',
      summary: 'Continuous 3-signal mathematical scoring with Double-Lock confidence gate (>= 0.75 threshold).',
      details: [
        'Signal 1 (50% Weight): Exact Amount Match adjusted for MDR fee schedule and TDS deductions.',
        'Signal 2 (30% Weight): Reference & Bank UTR checksum with RapidFuzz token sorting on merchant entities.',
        'Signal 3 (20% Weight): Settlement Date Proximity within standard T+1 / T+2 banking transit clearance.',
        'Double-Lock Threshold: Records with composite confidence >= 0.75 are automatically matched.',
        'Ambiguity Buffer: Records between 0.50 and 0.74 are escalated to the Layer 3 Serial Consensus Relay.',
      ],
    },
    {
      id: 3,
      badge: 'LAYER 3',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      title: '4-Model Serial Consensus Relay',
      techTag: 'Multi-LLM Early Exit',
      latency: '118ms – 480ms',
      summary: 'Serial escalation across 4 frontier LLMs with Hop 2 Early Exit to save 80% latency and cost.',
      details: [
        'Hop 1 (Speed): Groq LLaMA 3.3 70B produces rapid initial verdict and confidence score in ~118ms.',
        'Hop 2 (Independent): Google Gemini 2.5 performs blind audit. If it concurs with Hop 1, Early Exit is triggered.',
        'Hop 3 (Dissent Arbiter): OpenAI GPT-4o resolves discrepancies if Hop 1 and Hop 2 disagree.',
        'Hop 4 (Senior Authority): Anthropic Claude 3.5 Sonnet acts as final authority on complex disputes.',
      ],
    },
    {
      id: 4,
      badge: 'LAYER 4',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      title: 'Treasury Liquidity & 14-Day Trajectory Forecaster',
      techTag: 'In-Flight Gateway Transit Release',
      latency: '< 8ms',
      summary: 'Dynamic 14-day cash projection factoring verified gateway in-transit settlements and 3-way balance variance.',
      details: [
        'In-Flight Transit Release: Accurately projects funds stuck in gateway transit ($T+1 / T+2$ clearance).',
        '95% Confidence Variance Cones: Renders statistical upper and lower uncertainty bounds.',
        '3-Way Balance Audit Equation: Continuous verification of (Net Bank = Invoices - MDR - TDS).',
        'Liquidity Health Metric: Real-time runway calculations and working capital stress indicators.',
      ],
    },
    {
      id: 5,
      badge: 'LAYER 5',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Strict Read-Only MCP Copilot & Governance Hub',
      techTag: 'Model Context Protocol / SQLite WAL',
      latency: '< 15ms',
      summary: 'Interactive AI financial assistant with zero write permissions and mandatory immutable citations.',
      details: [
        'Strict Read-Only Architecture: Zero write permissions prevents unprompted transactions or ledger mutations.',
        'Mandatory Verified Citations: Every answer references immutable transaction IDs (TXN-xxxx, UTRxxxx).',
        'Human-in-the-Loop Quarantine Drawer: Controllers can review, override UTRs, write off fees, or void items.',
        'ACID SQLite WAL Storage: Full historical audit trail persisted across server restarts.',
      ],
    },
  ];

  const activeLayerData = ARCH_LAYERS.find((l) => l.id === activeLayer) || ARCH_LAYERS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <CertusLogo />
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Certus Autonomous Financial Operating System Architecture
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                6-Layer Production Architecture • Dual-Layer Invariants • 4-Model Serial Consensus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Benchmark KPIs Banner */}
        <div className="px-6 py-2.5 bg-slate-900 text-slate-300 text-[11px] font-mono flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <span>⚡ <strong className="text-white">4,666+ rec/s</strong> Throughput</span>
            <span>•</span>
            <span>⏱️ <strong className="text-emerald-400">118ms</strong> Groq Relay</span>
            <span>•</span>
            <span>🛡️ <strong className="text-white">100%</strong> Invariant Traps</span>
            <span>•</span>
            <span>📦 <strong className="text-amber-400">20</strong> Enterprise Scenarios</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Designed & Built by Aditya Singh
          </div>
        </div>

        {/* Modal Body: Left Navigation + Right Detail View */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-white">
          
          {/* Left: Layer Selector Tabs */}
          <div className="w-full md:w-80 border-r border-slate-100 p-4 space-y-2 overflow-y-auto bg-slate-50/50 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
              Architectural Layers (0–5)
            </span>

            {ARCH_LAYERS.map((layer) => {
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-[#E8384F] bg-white shadow-sm ring-1 ring-[#E8384F]/30'
                      : 'border-slate-200/60 bg-white/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${layer.badgeColor}`}>
                        {layer.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{layer.latency}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 font-display line-clamp-1">
                      {layer.title}
                    </h4>
                  </div>
                  <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${isSelected ? 'text-[#E8384F] translate-x-0.5' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* Right: Active Layer Detailed Blueprint */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
            
            {/* Header of Active Layer */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${activeLayerData.badgeColor}`}>
                  {activeLayerData.badge} • {activeLayerData.techTag}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Execution Latency: {activeLayerData.latency}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {activeLayerData.title}
                </h3>
                <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
                  {activeLayerData.summary}
                </p>
              </div>
            </div>

            {/* In-Depth Architectural Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">
                Deep Architectural Invariants & Mechanics:
              </h4>

              <div className="space-y-2">
                {activeLayerData.details.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start space-x-3 text-xs text-slate-700"
                  >
                    <div className="p-1 rounded-md bg-[#E8384F]/10 text-[#E8384F] mt-0.5 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed font-sans">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Technical Guarantee */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Deterministic Fail-Closed Boundary: Zero hallucinated figures enter trusted storage.</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 font-bold">ACID WAL</span>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span>Certus v2.4 Enterprise</span>
            <span>•</span>
            <a
              href="https://github.com/adityasingh1786/certus-ai-finance-controller"
              target="_blank"
              rel="noreferrer"
              className="text-[#E8384F] hover:underline flex items-center gap-1 font-sans font-semibold"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Close Blueprint
          </button>
        </div>

      </div>
    </div>
  );
}
