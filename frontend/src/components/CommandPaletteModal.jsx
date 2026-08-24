import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Layers,
  ShieldAlert,
  TrendingUp,
  Cpu,
  Shield,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Key,
} from 'lucide-react';
import { soundManager } from '../lib/soundFx';

/**
 * CommandPaletteModal — Global Financial Spotlight Search (Cmd/Ctrl + K)
 * Allows instant navigation between 20 Scenarios, 5 Hubs, and Transaction IDs.
 */
export default function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectTab,
  onRunScenario,
  scenarios = [],
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      soundManager.playClick();
      setQuery('');
    }
  }, [isOpen]);

  const hubs = [
    { id: 'recon', name: '3-Way Reconciliation Hub', icon: Layers, hotkey: '1', desc: 'Gateway ↔ Bank ↔ ERP Matrix' },
    { id: 'quarantine', name: 'Quarantine & Exceptions Hub', icon: ShieldAlert, hotkey: '2', desc: 'HITL anomaly resolution queue' },
    { id: 'treasury', name: 'Treasury & Liquidity Hub', icon: TrendingUp, hotkey: '3', desc: '14-day cash flow & transit tracker' },
    { id: 'copilot', name: 'Autonomous Financial Copilot', icon: Cpu, hotkey: '4', desc: 'Read-only MCP AI with citations' },
    { id: 'governance', name: 'System Governance & Rules', icon: Shield, hotkey: '5', desc: 'Invariant thresholds & weights' },
  ];

  const defaultScenarios = [
    { id: 1, name: 'D2C Fashion & Apparel — Festive Flash Sale', sector: 'E-Commerce' },
    { id: 2, name: 'B2B SaaS — Quarterly Milestone Invoicing', sector: 'SaaS' },
    { id: 3, name: 'Quick Commerce — 10-Min Hyperlocal Batching', sector: 'Q-Comm' },
    { id: 4, name: 'NBFC Micro-Lending — EMI Bulk Disbursals', sector: 'Credit' },
    { id: 5, name: 'Hospital & Healthcare — TPA Insurance Co-Pay', sector: 'Health' },
    { id: 6, name: 'EdTech — Annual Subscription Installments', sector: 'EdTech' },
    { id: 7, name: 'FoodTech — Multi-Vendor Marketplace Split', sector: 'FoodTech' },
    { id: 8, name: 'Mobility & Cab Aggregator — Driver Cashouts', sector: 'Mobility' },
    { id: 9, name: 'Cross-Border IT Services — EEFC Inward Wire', sector: 'Export' },
    { id: 10, name: 'Luxury Hotel & Hospitality — Pre-Auth Capture', sector: 'Hospitality' },
  ];

  const scenarioList = scenarios.length ? scenarios : defaultScenarios;

  // Filter hubs and scenarios based on query
  const filteredHubs = useMemo(() => {
    if (!query) return hubs;
    const q = query.toLowerCase();
    return hubs.filter(h => h.name.toLowerCase().includes(q) || h.desc.toLowerCase().includes(q));
  }, [query]);

  const filteredScenarios = useMemo(() => {
    if (!query) return scenarioList.slice(0, 5);
    const q = query.toLowerCase();
    return scenarioList.filter(s => s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q));
  }, [query, scenarioList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl glass-3d-elevated rounded-3xl p-4 specular-top shadow-2xl space-y-4 border border-white/90">
        
        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search scenario (1–20), or hub..."
            className="w-full pl-12 pr-10 py-3.5 bg-white/90 border border-slate-200/80 rounded-2xl text-slate-900 text-sm font-sans focus:outline-none focus:border-[#E8384F] focus:ring-1 focus:ring-[#E8384F]/30 shadow-xs placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto space-y-4 p-1">
          {/* Section: Operational Hubs */}
          {filteredHubs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3">
                Operational Modules
              </span>
              <div className="space-y-1">
                {filteredHubs.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectTab(hub.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/60 hover:bg-white border border-slate-100 hover:border-slate-300 transition-all text-left group hover:scale-[1.008] shadow-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:text-[#E8384F] group-hover:bg-rose-50 transition-colors">
                        <hub.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#E8384F] transition-colors">{hub.name}</p>
                        <p className="text-[11px] text-slate-500">{hub.desc}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-500 group-hover:bg-rose-50 group-hover:text-[#E8384F]">
                      Key {hub.hotkey}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: 20 Enterprise Scenarios */}
          {filteredScenarios.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3">
                Enterprise Financial Scenarios (20 Presets)
              </span>
              <div className="space-y-1">
                {filteredScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      soundManager.playClick();
                      if (onRunScenario) onRunScenario(sc.id);
                      onSelectTab('recon');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/60 hover:bg-white border border-slate-100 hover:border-rose-300 transition-all text-left group hover:scale-[1.008] shadow-xs"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2 rounded-xl bg-rose-50 text-[#E8384F] font-mono text-[10px] font-bold">
                        #{String(sc.id).padStart(2, '0')}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#E8384F] transition-colors">{sc.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase">{sc.sector}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#E8384F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Press <strong>Esc</strong> to close</span>
          <span>Navigation: <strong>Cmd/Ctrl + K</strong></span>
        </div>

      </div>
    </div>
  );
}
