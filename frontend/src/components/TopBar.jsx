import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Terminal,
  Sparkles,
  Globe,
  LogOut,
  ShieldCheck,
  Search,
  Volume2,
  VolumeX,
  Activity,
  Zap,
  ChevronDown,
} from 'lucide-react';
import CertusLogo from './CertusLogo';
import { soundManager } from '../lib/soundFx';

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
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  useEffect(() => {
    setIsMuted(soundManager.getIsMuted());
  }, []);

  const handleToggleSound = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      try { soundManager.playClick(); } catch (_) {}
    }
  };

  const scenarioNum = useMemo(() => {
    const raw = reconciliationData?.scenario_id;
    if (typeof raw === 'object' && raw !== null) return raw.id || 1;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') return parseInt(raw, 10) || 1;
    return 1;
  }, [reconciliationData]);

  const scenarioName = reconciliationData?.scenario_name || 'D2C Fashion & Apparel — Festive Flash Sale';

  const HUB_NAMES = {
    recon: '3-Way Match Matrix',
    quarantine: 'Quarantine & Exceptions',
    treasury: 'Treasury & Liquidity',
    copilot: 'Autonomous Copilot',
    governance: 'System Governance',
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] px-6 flex items-center justify-between">
      
      {/* Left: Brand & Breadcrumb + EKG Heartbeat */}
      <div className="flex items-center gap-3.5">
        <CertusLogo className="w-7 h-7" textClassName="text-base font-bold" />
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-xs font-display font-bold text-slate-900">
          {HUB_NAMES[activeTab] || 'Workspace'}
        </span>

        {/* Active Scenario Selector Dropdown */}
        <div className="hidden sm:flex items-center relative group">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200/80 text-[11px] font-mono text-[#E8384F] font-bold shadow-2xs transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8384F] breathing-dot" />
            <select
              value={scenarioNum}
              onChange={(e) => {
                const targetId = parseInt(e.target.value, 10);
                if (onRunScenario && targetId) {
                  soundManager.playClick();
                  onRunScenario(targetId);
                }
              }}
              className="bg-transparent text-[#E8384F] font-mono font-bold text-[11px] focus:outline-none cursor-pointer pr-4 max-w-[160px] truncate"
              title="Select Active Enterprise Scenario (1-20)"
            >
              {scenarioCatalog && scenarioCatalog.length > 0 ? (
                scenarioCatalog.map((sc) => (
                  <option key={sc.id} value={sc.id} className="bg-white text-slate-900 font-sans text-xs py-1">
                    DS-#{String(sc.id).padStart(2, '0')}: {sc.name.split('—')[0].trim()} ({sc.sector})
                  </option>
                ))
              ) : (
                Array.from({ length: 20 }, (_, i) => i + 1).map((id) => (
                  <option key={id} value={id} className="bg-white text-slate-900 font-sans text-xs py-1">
                    DS-#{String(id).padStart(2, '0')} Scenario
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Living Financial Vitals EKG Waveform */}
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-mono text-emerald-800 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 breathing-dot" />
            <span>4,666 rec/s</span>
          </div>

          <svg className="w-16 h-4 text-emerald-500 overflow-visible" viewBox="0 0 60 16">
            <path
              d="M0,8 L15,8 L18,2 L22,14 L26,4 L30,10 L34,8 L60,8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ekg-line"
            />
          </svg>
        </div>
      </div>

      {/* Center: Spotlight Command Trigger */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => {
            try { soundManager.playClick(); } catch (_) {}
            if (onOpenCommandPalette) onOpenCommandPalette();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/70 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-500 hover:text-slate-800 transition-all shadow-xs group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E8384F]" />
          <span>Spotlight Search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600 font-bold shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Action Tools & Profile */}
      <div className="flex items-center gap-2">
        {/* Web Audio Mute/Unmute Toggle */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#E8384F]" />}
        </button>

        {/* 1-Click Demo Trigger */}
        <button
          onClick={() => {
            try { soundManager.playClick(); } catch (_) {}
            if (onLoadDemo) onLoadDemo();
          }}
          disabled={isReconciling}
          className="shimmer-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8384F] hover:bg-[#d42d43] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isReconciling ? 'Reconciling...' : '🎲 Random Scenario'}</span>
        </button>

        {/* Architecture Blueprint Modal Trigger */}
        <button
          onClick={() => {
            try { soundManager.playClick(); } catch (_) {}
            if (onOpenArchitecture) onOpenArchitecture();
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-[#E8384F]" />
          <span className="hidden md:inline">Blueprint</span>
        </button>

        {/* Swagger Modal Trigger */}
        <button
          onClick={() => {
            try { soundManager.playClick(); } catch (_) {}
            if (onOpenSwagger) onOpenSwagger();
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors font-mono"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">API</span>
        </button>

        {/* Landing Page Trigger */}
        {onOpenLanding && (
          <button
            onClick={() => {
              try { soundManager.playClick(); } catch (_) {}
              onOpenLanding();
            }}
            title="Landing Overview"
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Globe className="w-4 h-4" />
          </button>
        )}

        {/* Divider */}
        <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* Controller Profile Badge: Aditya Singh */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-mono">
          <div className="w-5 h-5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E8384F] text-[10px] font-bold">
            AS
          </div>
          <span className="text-slate-800 font-bold">Aditya Singh</span>
        </div>

        {/* Sign Out Trigger */}
        {onLogout && (
          <button
            onClick={() => {
              try { soundManager.playClick(); } catch (_) {}
              onLogout();
            }}
            title="Sign Out"
            className="p-2 rounded-xl bg-white border border-slate-200/80 hover:border-rose-300 hover:text-[#E8384F] text-slate-400 transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
