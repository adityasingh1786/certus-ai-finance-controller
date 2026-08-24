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
  Activity,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import { soundManager } from '../lib/soundFx';

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
    },
    {
      hop: 'Hop 2: Independent Review',
      model: 'Google Gemini 2.5 Pro',
      role: 'Reviews raw transaction with blind evaluation. If concurs with Hop 1, triggers Early Exit.',
      avgLatency: '360ms',
      status: 'Active (Early Exit Gate)',
    },
    {
      hop: 'Hop 3: Escalation Arbiter',
      model: 'OpenAI GPT-4o',
      role: 'Invoked only when Hop 1 and Hop 2 disagree. Evaluates fuzzy reference discrepancy.',
      avgLatency: '680ms',
      status: 'Standby (Dissent Escalation)',
    },
    {
      hop: 'Hop 4: Senior Authority',
      model: 'Anthropic Claude 3.5 Sonnet',
      role: 'Final authority on complex cross-border or composite MDR disputes.',
      avgLatency: '890ms',
      status: 'Standby (Senior Auditor)',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* SubTabBar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={(tab) => {
          soundManager.playClick();
          setActiveSubTab(tab);
        }}
      />

      {/* Sub-View 1: Consensus Relay Matrix */}
      {activeSubTab === 'consensus' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Multi-Model Consensus Relay Architecture
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Serial escalation engine that executes early exits when models concur, escalating only on dissent.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              80% Token Savings
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RELAY_HOPS.map((h, idx) => (
              <div key={idx} className="glass-3d hover-lift-3d p-5 rounded-2xl specular-top space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#E8384F]">{h.hop}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {h.avgLatency}
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900">{h.model}</h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">{h.role}</p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Status:</span>
                  <span className="text-slate-800 font-bold">{h.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 2: Double-Lock Parameters & Weight Recalibration */}
      {activeSubTab === 'config' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Double-Lock Thresholds & Signal Weights
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Adjust mathematical gating tolerances and re-balance signal importance in real-time.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-[#E8384F] border border-rose-200">
              Live Tuning Active
            </span>
          </div>

          {/* Gate Threshold Slider */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Double-Lock Consensus Gate</span>
                <span className="text-[11px] text-slate-500 font-sans">Minimum combined rule + AI score required for auto-reconciliation.</span>
              </div>
              <span className="font-mono text-base font-bold text-[#E8384F]">
                {(gateThreshold).toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.01"
              value={gateThreshold}
              onChange={(e) => {
                soundManager.playClick();
                setGateThreshold(parseFloat(e.target.value));
              }}
              className="w-full accent-[#E8384F] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0.50 (Permissive)</span>
              <span>0.75 (Default Institutional)</span>
              <span>0.95 (Ultra-Strict)</span>
            </div>
          </div>

          {/* Signal Weights 50 / 30 / 20 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">Amount Signal</span>
                <span className="font-mono text-[#E8384F] font-bold">{amountWeight}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="70"
                value={amountWeight}
                onChange={(e) => {
                  soundManager.playClick();
                  setAmountWeight(parseInt(e.target.value, 10));
                }}
                className="w-full accent-[#E8384F] cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 font-sans">Gross invoice vs net settlement tolerance.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">Reference Signal</span>
                <span className="font-mono text-[#E8384F] font-bold">{refWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={refWeight}
                onChange={(e) => {
                  soundManager.playClick();
                  setRefWeight(parseInt(e.target.value, 10));
                }}
                className="w-full accent-[#E8384F] cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 font-sans">Bank UTR & fuzzy merchant token match.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">Date Proximity</span>
                <span className="font-mono text-[#E8384F] font-bold">{dateWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={dateWeight}
                onChange={(e) => {
                  soundManager.playClick();
                  setDateWeight(parseInt(e.target.value, 10));
                }}
                className="w-full accent-[#E8384F] cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 font-sans">T+1 / T+2 settlement transit curve.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 3: Blueprint & API Spec */}
      {activeSubTab === 'blueprint' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-display font-bold text-base text-slate-900">
                Enterprise OpenAPI 3.1 & Architectural Specs
              </h4>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Interact with the full API surface or inspect the 6-layer architecture blueprint.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                soundManager.playClick();
                if (onOpenArchitecture) onOpenArchitecture();
              }}
              className="glass-3d hover-lift-3d p-6 rounded-2xl specular-top text-left space-y-2 group"
            >
              <div className="p-2 rounded-xl bg-rose-50 text-[#E8384F] w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h5 className="font-display font-bold text-sm text-slate-900 group-hover:text-[#E8384F] transition-colors">
                6-Layer Architecture Explorer
              </h5>
              <p className="text-xs text-slate-500 font-sans">
                Explore Layer 0 (Streaming Ingest) to Layer 5 (Read-Only MCP Copilot) with formal invariant guarantees.
              </p>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                if (onOpenSwagger) onOpenSwagger();
              }}
              className="glass-3d hover-lift-3d p-6 rounded-2xl specular-top text-left space-y-2 group"
            >
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 w-fit">
                <Terminal className="w-5 h-5" />
              </div>
              <h5 className="font-display font-bold text-sm text-slate-900 group-hover:text-[#E8384F] transition-colors font-mono">
                Interactive Swagger REST API
              </h5>
              <p className="text-xs text-slate-500 font-sans">
                Execute live API calls against all 28 FastAPI endpoints with interactive JSON payloads and response models.
              </p>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
