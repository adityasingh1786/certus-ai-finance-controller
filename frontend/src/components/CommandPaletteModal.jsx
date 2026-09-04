import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Layers,
  ShieldAlert,
  TrendingUp,
  Cpu,
  Shield,
  ArrowRight,
  X,
  LayoutDashboard,
  BarChart3,
  Database,
  Fingerprint,
  Settings,
} from 'lucide-react';

/**
 * CommandPaletteModal — Sovereign Financial Spotlight Search (Cmd/Ctrl + K)
 * Fast keyboard-first navigation between 20 Scenarios, 10 Screens/Hubs, and System Tools.
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
      setQuery('');
    }
  }, [isOpen]);

  const hubs = [
    { id: 'dashboard', name: 'Executive Dashboard', icon: LayoutDashboard, hotkey: '0', desc: 'Panoramic controller KPIs & working capital' },
    { id: 'recon', name: '3-Way Reconciliation Hub', icon: Layers, hotkey: '1', desc: 'Gateway ↔ Bank ↔ ERP Matrix' },
    { id: 'quarantine', name: 'Quarantine & Exceptions Hub', icon: ShieldAlert, hotkey: '2', desc: 'HITL anomaly resolution queue' },
    { id: 'treasury', name: 'Treasury & Liquidity Hub', icon: TrendingUp, hotkey: '3', desc: '14-day cash flow & transit tracker' },
    { id: 'copilot', name: 'Autonomous Financial Copilot', icon: Cpu, hotkey: '4', desc: 'Read-only MCP AI with citations' },
    { id: 'governance', name: 'System Governance & Rules', icon: Shield, hotkey: '5', desc: 'Invariant thresholds & weights' },
    { id: 'ledger', name: 'Ledger Analysis & Variance', icon: BarChart3, desc: 'Variance analytics & monthly trends' },
    { id: 'datasources', name: 'Data Sources & Connectors', icon: Database, desc: 'Multi-rail connectors & API telemetry' },
    { id: 'audit', name: 'Audit Logs Ledger', icon: Fingerprint, desc: 'Cryptographic SHA-256 event trail' },
    { id: 'settings', name: 'System & Policy Settings', icon: Settings, desc: 'Organization, policies & invariant rules' },
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-ink-primary/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-surface rounded-lg p-3 shadow-modal space-y-3 border border-border-subtle">
        
        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, scenario name (1–20), or jump to hub..."
            className="w-full pl-10 pr-9 py-2.5 bg-page border border-border-subtle rounded-md text-ink-primary text-xs font-sans focus:outline-none focus:border-border-strong focus:bg-surface shadow-subtle placeholder:text-ink-muted transition-fast"
          />
          <button
            onClick={onClose}
            className="absolute right-3 p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-page transition-fast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto space-y-3 p-1">
          {/* Section: Operational Hubs */}
          {filteredHubs.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase tracking-wider px-2">
                Operational Modules
              </span>
              <div className="space-y-0.5">
                {filteredHubs.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => {
                      onSelectTab(hub.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-page border border-transparent hover:border-border-subtle transition-fast text-left group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-md bg-page border border-border-subtle text-ink-secondary group-hover:text-ink-primary transition-fast">
                        <hub.icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ink-primary">{hub.name}</p>
                        <p className="text-[11px] text-ink-muted">{hub.desc}</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-ink-muted bg-page border border-border-subtle">
                      Key {hub.hotkey}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: 20 Enterprise Scenarios */}
          {filteredScenarios.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono font-semibold text-ink-muted uppercase tracking-wider px-2">
                Enterprise Financial Scenarios (20 Presets)
              </span>
              <div className="space-y-0.5">
                {filteredScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      if (onRunScenario) onRunScenario(sc.id);
                      onSelectTab('recon');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-page border border-transparent hover:border-border-subtle transition-fast text-left group"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="p-1 rounded bg-page border border-border-subtle text-ink-secondary font-mono text-[10px] font-semibold">
                        #{String(sc.id).padStart(2, '0')}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-ink-primary truncate">{sc.name}</p>
                        <p className="text-[10px] font-mono text-ink-muted uppercase">{sc.sector}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink-primary transition-fast shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted font-mono px-1">
          <span>Press <strong>Esc</strong> to close</span>
          <span>Open anytime: <strong>⌘K</strong></span>
        </div>

      </div>
    </div>
  );
}
