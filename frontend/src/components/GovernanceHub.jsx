import React, { useState } from 'react';
import {
  Cpu,
  Sliders,
  Layers,
  Terminal,
} from 'lucide-react';
import SubTabBar from './SubTabBar';

export default function GovernanceHub({ onOpenArchitecture, onOpenSwagger }) {
  const [activeSubTab, setActiveSubTab] = useState('consensus');
  const [gateThreshold, setGateThreshold] = useState(0.75);
  const [amountWeight, setAmountWeight] = useState(50);
  const [refWeight, setRefWeight] = useState(30);
  const [dateWeight, setDateWeight] = useState(20);

  const tabs = [
    { id: 'consensus', label: 'Consensus Relay', icon: Cpu },
    { id: 'config', label: 'Parameters', icon: Sliders, badge: `≥ ${gateThreshold.toFixed(2)}` },
    { id: 'blueprint', label: 'Architecture & API', icon: Layers },
  ];

  const RELAY_HOPS = [
    { hop: 'Hop 1: Rapid Ingest', model: 'Groq LLaMA 3.3 70B', role: 'Produces rapid initial verdict and preliminary confidence score.', avgLatency: '118ms', status: 'Active (Primary)' },
    { hop: 'Hop 2: Independent Review', model: 'Google Gemini 2.5 Pro', role: 'Reviews raw transaction with blind evaluation. Concurrence triggers Early Exit.', avgLatency: '360ms', status: 'Active (Early Exit)' },
    { hop: 'Hop 3: Escalation Arbiter', model: 'OpenAI GPT-4o', role: 'Invoked only when Hop 1 and Hop 2 disagree. Evaluates fuzzy reference discrepancy.', avgLatency: '680ms', status: 'Standby (Dissent)' },
    { hop: 'Hop 4: Senior Authority', model: 'Anthropic Claude 3.5 Sonnet', role: 'Final authority on complex cross-border or composite MDR disputes.', avgLatency: '890ms', status: 'Standby (Senior)' },
  ];

  return (
    <div className="space-y-5">

      {/* Sub-Tab Bar */}
      <SubTabBar tabs={tabs} activeSubTab={activeSubTab} onSubTabChange={setActiveSubTab} />

      {/* Consensus Relay Matrix */}
      {activeSubTab === 'consensus' && (
        <div className="surface-elevated p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Multi-Model Consensus Relay</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Serial escalation engine with early exits when models concur.
              </p>
            </div>
            <span className="pill-matched px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold">
              80% Token Savings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RELAY_HOPS.map((h, idx) => (
              <div key={idx} className="surface-card p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-slate-600">{h.hop}</span>
                  <span className="pill-matched px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                    {h.avgLatency}
                  </span>
                </div>
                <h4 className="text-[13px] font-semibold text-slate-900">{h.model}</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">{h.role}</p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Status:</span>
                  <span className="text-slate-700 font-medium">{h.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parameters */}
      {activeSubTab === 'config' && (
        <div className="surface-elevated p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Thresholds & Signal Weights</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Adjust mathematical gating tolerances and signal importance.
              </p>
            </div>
          </div>

          {/* Gate Threshold Slider */}
          <div className="surface-card p-5 space-y-3">
            <div className="flex justify-between items-center text-[12px]">
              <div>
                <span className="font-semibold text-slate-800 block">Consensus Gate</span>
                <span className="text-[11px] text-slate-500">Minimum combined score for auto-reconciliation.</span>
              </div>
              <span className="font-mono text-base font-semibold text-slate-900">
                {gateThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range" min="0.50" max="0.95" step="0.01"
              value={gateThreshold}
              onChange={(e) => setGateThreshold(parseFloat(e.target.value))}
              className="w-full accent-slate-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0.50 (Permissive)</span>
              <span>0.75 (Default)</span>
              <span>0.95 (Ultra-Strict)</span>
            </div>
          </div>

          {/* Signal Weights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="surface-card p-4 space-y-2">
              <div className="flex justify-between text-[12px] font-medium">
                <span className="text-slate-700">Amount Signal</span>
                <span className="font-mono text-slate-900 font-semibold">{amountWeight}%</span>
              </div>
              <input type="range" min="30" max="70" value={amountWeight} onChange={(e) => setAmountWeight(parseInt(e.target.value, 10))} className="w-full accent-slate-700 cursor-pointer" />
              <p className="text-[10px] text-slate-400">Gross invoice vs net settlement tolerance.</p>
            </div>

            <div className="surface-card p-4 space-y-2">
              <div className="flex justify-between text-[12px] font-medium">
                <span className="text-slate-700">Reference Signal</span>
                <span className="font-mono text-slate-900 font-semibold">{refWeight}%</span>
              </div>
              <input type="range" min="10" max="50" value={refWeight} onChange={(e) => setRefWeight(parseInt(e.target.value, 10))} className="w-full accent-slate-700 cursor-pointer" />
              <p className="text-[10px] text-slate-400">Bank UTR & fuzzy merchant token match.</p>
            </div>

            <div className="surface-card p-4 space-y-2">
              <div className="flex justify-between text-[12px] font-medium">
                <span className="text-slate-700">Date Proximity</span>
                <span className="font-mono text-slate-900 font-semibold">{dateWeight}%</span>
              </div>
              <input type="range" min="10" max="40" value={dateWeight} onChange={(e) => setDateWeight(parseInt(e.target.value, 10))} className="w-full accent-slate-700 cursor-pointer" />
              <p className="text-[10px] text-slate-400">T+1 / T+2 settlement transit curve.</p>
            </div>
          </div>
        </div>
      )}

      {/* Architecture & API */}
      {activeSubTab === 'blueprint' && (
        <div className="surface-elevated p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Architecture & API Specs</h4>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Interact with the API surface or inspect the architecture blueprint.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onOpenArchitecture && onOpenArchitecture()}
              className="surface-card p-6 text-left space-y-2 group hover:border-slate-300 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-50 text-slate-600 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h5 className="text-[13px] font-semibold text-slate-800 group-hover:text-slate-900">
                6-Layer Architecture Explorer
              </h5>
              <p className="text-[12px] text-slate-500">
                Explore Layer 0 (Streaming Ingest) to Layer 5 (Read-Only MCP Copilot).
              </p>
            </button>

            <button
              onClick={() => onOpenSwagger && onOpenSwagger()}
              className="surface-card p-6 text-left space-y-2 group hover:border-slate-300 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-50 text-slate-600 w-fit">
                <Terminal className="w-5 h-5" />
              </div>
              <h5 className="text-[13px] font-semibold text-slate-800 group-hover:text-slate-900 font-mono">
                Interactive Swagger REST API
              </h5>
              <p className="text-[12px] text-slate-500">
                Execute live API calls against all 28 FastAPI endpoints.
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
