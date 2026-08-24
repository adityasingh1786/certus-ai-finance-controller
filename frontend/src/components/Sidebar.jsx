import React from 'react';
import {
  Layers,
  ShieldAlert,
  TrendingUp,
  Bot,
  Sliders,
  Cpu,
  Lock,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { soundManager } from '../lib/soundFx';

export default function Sidebar({
  activeTab,
  onTabChange,
  exceptionCount = 4,
}) {
  const navItems = [
    { id: 'recon', label: '3-Way Match Matrix', icon: Layers, hotkey: '1' },
    { id: 'quarantine', label: 'Quarantine & Exceptions', icon: ShieldAlert, badge: exceptionCount, hotkey: '2' },
    { id: 'treasury', label: 'Treasury & Liquidity', icon: TrendingUp, hotkey: '3' },
    { id: 'copilot', label: 'Autonomous Copilot', icon: Bot, hotkey: '4' },
    { id: 'governance', label: 'System Governance', icon: Sliders, hotkey: '5' },
  ];

  const handleNavClick = (id) => {
    soundManager.playClick();
    onTabChange(id);
  };

  return (
    <aside className="w-64 fixed top-16 left-0 h-[calc(100vh-64px)] z-30 bg-white/75 backdrop-blur-2xl border-r border-slate-200/60 flex flex-col justify-between select-none">
      
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5">
        <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          <span>Operating Modules</span>
          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">Keys 1–5</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all font-display group ${
                isActive
                  ? 'bg-rose-50/80 text-[#E8384F] border border-rose-200 shadow-sm ring-1 ring-[#E8384F]/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#E8384F] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#E8384F] text-white'
                        : 'bg-rose-50 text-[#E8384F] border border-rose-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current breathing-dot" />
                    {item.badge}
                  </span>
                )}
                <kbd
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'text-[#E8384F]' : 'text-slate-300 group-hover:text-slate-500'
                  }`}
                >
                  {item.hotkey}
                </kbd>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer System Specs & Invariant Monitor */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-2.5 text-xs font-mono">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Engine Gate:</span>
          <span className="text-emerald-700 font-bold">Double-Lock (0.75)</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Audit Provenance:</span>
          <span className="text-slate-800 font-semibold">SQLite WAL Sync</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Invariants:</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            55/55 Passing
          </span>
        </div>
      </div>
    </aside>
  );
}
