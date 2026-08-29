import React from 'react';
import {
  Layers,
  ShieldAlert,
  TrendingUp,
  Bot,
  Sliders,
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
    <aside className="w-64 fixed top-16 left-0 h-[calc(100vh-64px)] z-30 bg-white/80 backdrop-blur-2xl border-r border-slate-200/70 flex flex-col justify-between select-none">
      {/* 🧭 Navigation Links */}
      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          <span>Operating Modules</span>
          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">1–5</span>
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
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#E8384F]' : 'text-slate-400 group-hover:text-slate-800'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-[#E8384F] text-white'
                        : 'bg-rose-50 text-[#E8384F] border border-rose-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <kbd
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'text-slate-400' : 'text-slate-300 group-hover:text-slate-500'
                  }`}
                >
                  {item.hotkey}
                </kbd>
              </div>
            </button>
          );
        })}
      </div>

      {/* 🌿 Minimalist System Provenance Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-500 text-[11px]">55 Invariants Active</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200">
          v2.4
        </span>
      </div>
    </aside>
  );
}
