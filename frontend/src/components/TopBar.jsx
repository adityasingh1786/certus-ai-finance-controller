import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Layers,
  Terminal,
  Globe,
  LogOut,
  Search,
  ChevronDown,
  User,
} from 'lucide-react';
import CertusLogo from './CertusLogo';

export default function TopBar({
  activeTab,
  reconciliationData,
  scenarioCatalog = [],
  onRunScenario,
  onOpenArchitecture,
  onOpenSwagger,
  onLoadDemo,
  isReconciling,
  onOpenLanding,
  onLogout,
  onOpenCommandPalette,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scenarioNum = useMemo(() => {
    const raw = reconciliationData?.scenario_id;
    if (typeof raw === 'object' && raw !== null) return raw.id || 1;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') return parseInt(raw, 10) || 1;
    return 1;
  }, [reconciliationData]);

  const HUB_NAMES = {
    dashboard: 'Dashboard',
    recon: 'Reconciliation',
    quarantine: 'Quarantine',
    treasury: 'Treasury',
    copilot: 'Copilot',
    governance: 'Governance',
    ledger: 'Ledger Analysis',
    datasources: 'Data Sources',
    audit: 'Audit Trail',
    settings: 'Settings',
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-white border-b border-slate-200/70 px-5 flex items-center justify-between">
      {/* Zone 1: Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        <CertusLogo className="w-5 h-5" textClassName="text-sm font-bold tracking-tight text-slate-900" />
        <span className="text-slate-200 text-sm">/</span>
        <span className="text-[13px] font-medium text-slate-500">
          {HUB_NAMES[activeTab] || 'Workspace'}
        </span>
      </div>

      {/* Zone 2: Command Palette Trigger */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => {
            if (onOpenCommandPalette) onOpenCommandPalette();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-400 hover:text-slate-600 transition-colors w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[12px]">Search...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-400 font-medium">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Scenario Selector & Profile */}
      <div className="flex items-center gap-3">
        {/* Scenario Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[12px] text-slate-600">
          <select
            value={scenarioNum}
            onChange={(e) => {
              const targetId = parseInt(e.target.value, 10);
              if (onRunScenario && targetId) onRunScenario(targetId);
            }}
            className="bg-transparent text-slate-700 font-medium text-[12px] focus:outline-none cursor-pointer pr-1 max-w-[180px] truncate"
            title="Select Enterprise Scenario"
          >
            {scenarioCatalog && scenarioCatalog.length > 0 ? (
              scenarioCatalog.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-white text-slate-900 text-xs py-1">
                  DS-{String(sc.id).padStart(2, '0')}: {sc.name.split('—')[0].trim()}
                </option>
              ))
            ) : (
              Array.from({ length: 20 }, (_, i) => i + 1).map((id) => (
                <option key={id} value={id} className="bg-white text-slate-900 text-xs py-1">
                  DS-{String(id).padStart(2, '0')}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-200" />

        {/* Profile Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[11px] font-semibold">
              AS
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-50 space-y-0.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-[13px] font-semibold text-slate-900">Aditya Singh</p>
                <p className="text-[11px] text-slate-400">Lead System Architect</p>
              </div>

              {onOpenArchitecture && (
                <button
                  onClick={() => {
                    onOpenArchitecture();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Architecture Blueprint</span>
                </button>
              )}

              {onOpenSwagger && (
                <button
                  onClick={() => {
                    onOpenSwagger();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span>REST API Explorer</span>
                </button>
              )}

              {onOpenLanding && (
                <button
                  onClick={() => {
                    onOpenLanding();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Landing Page</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => onLogout()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
