import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Layers,
  Terminal,
  Sparkles,
  Globe,
  LogOut,
  Search,
  Volume2,
  VolumeX,
  ChevronDown,
  User,
  SlidersHorizontal,
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setIsMuted(soundManager.getIsMuted());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      try {
        soundManager.playClick();
      } catch (_) {}
    }
  };

  const scenarioNum = useMemo(() => {
    const raw = reconciliationData?.scenario_id;
    if (typeof raw === 'object' && raw !== null) return raw.id || 1;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') return parseInt(raw, 10) || 1;
    return 1;
  }, [reconciliationData]);

  const HUB_NAMES = {
    recon: '3-Way Match Matrix',
    quarantine: 'Quarantine & Exceptions',
    treasury: 'Treasury & Liquidity',
    copilot: 'Autonomous Copilot',
    governance: 'System Governance',
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200/70 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] px-6 flex items-center justify-between">
      {/* 🏛️ Zone 1: Left Brand & Minimal Scenario Selector */}
      <div className="flex items-center gap-3">
        <CertusLogo className="w-6 h-6" textClassName="text-base font-bold tracking-tight" />
        <span className="text-slate-300 text-xs hidden sm:inline">/</span>
        <span className="text-xs font-display font-semibold text-slate-900 hidden sm:inline">
          {HUB_NAMES[activeTab] || 'Workspace'}
        </span>

        {/* Minimal Scenario Switcher Pill */}
        <div className="flex items-center ml-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-mono text-slate-700 font-bold transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8384F]" />
            <select
              value={scenarioNum}
              onChange={(e) => {
                const targetId = parseInt(e.target.value, 10);
                if (onRunScenario && targetId) {
                  soundManager.playClick();
                  onRunScenario(targetId);
                }
              }}
              className="bg-transparent text-slate-800 font-mono font-bold text-[11px] focus:outline-none cursor-pointer pr-2 max-w-[170px] truncate"
              title="Select Active Enterprise Scenario (1-20)"
            >
              {scenarioCatalog && scenarioCatalog.length > 0 ? (
                scenarioCatalog.map((sc) => (
                  <option key={sc.id} value={sc.id} className="bg-white text-slate-900 font-sans text-xs py-1">
                    DS-#{String(sc.id).padStart(2, '0')}: {sc.name.split('—')[0].trim()}
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
      </div>

      {/* 🔍 Zone 2: Center Spotlight Search Trigger */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => {
            try {
              soundManager.playClick();
            } catch (_) {}
            if (onOpenCommandPalette) onOpenCommandPalette();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-xs text-slate-400 hover:text-slate-700 transition-all shadow-2xs group w-56 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E8384F] transition-colors" />
            <span className="text-slate-500 text-[11px]">Search commands...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500 font-semibold shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ⚡ Zone 3: Clean Actions & Profile Menu */}
      <div className="flex items-center gap-2">
        {/* Sleek Scenario Shuffle Trigger */}
        <button
          onClick={() => {
            try {
              soundManager.playClick();
            } catch (_) {}
            if (onLoadDemo) onLoadDemo();
          }}
          disabled={isReconciling}
          title="Simulate Random Scenario"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#E8384F] text-white text-xs font-semibold shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{isReconciling ? 'Loading...' : 'Randomize'}</span>
        </button>

        {/* Minimal Blueprint Trigger */}
        <button
          onClick={() => {
            try {
              soundManager.playClick();
            } catch (_) {}
            if (onOpenArchitecture) onOpenArchitecture();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-[#E8384F]" />
          <span className="hidden sm:inline">Blueprint</span>
        </button>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* Profile & Secondary Tools Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E8384F] text-[10px] font-bold">
              AS
            </div>
            <span className="text-xs font-semibold hidden lg:inline text-slate-800">Aditya Singh</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Profile Menu Popover */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Aditya Singh</p>
                <p className="text-[10px] font-mono text-slate-400">Lead System Architect</p>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  handleToggleSound();
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#E8384F]" />}
                  <span>Sound Synthesizer</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{isMuted ? 'Muted' : 'Active'}</span>
              </button>

              {/* REST API Explorer */}
              {onOpenSwagger && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenSwagger();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors font-mono"
                >
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>REST API Explorer</span>
                </button>
              )}

              {/* Landing Page */}
              {onOpenLanding && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenLanding();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Public Landing Page</span>
                </button>
              )}

              {/* Sign Out */}
              {onLogout && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
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
