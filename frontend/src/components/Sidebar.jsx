import React from 'react';
import {
  LayoutDashboard,
  Layers,
  ShieldAlert,
  TrendingUp,
  Bot,
  Sliders,
  BarChart3,
  Database,
  Fingerprint,
  Settings,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  exceptionCount = 4,
}) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hotkey: '0' },
    { id: 'recon', label: 'Reconciliation', icon: Layers, hotkey: '1' },
    { id: 'quarantine', label: 'Quarantine', icon: ShieldAlert, badge: exceptionCount, hotkey: '2' },
    { id: 'treasury', label: 'Treasury', icon: TrendingUp, hotkey: '3' },
    { id: 'copilot', label: 'Copilot', icon: Bot, hotkey: '4' },
    { id: 'governance', label: 'Governance', icon: Sliders, hotkey: '5' },
  ];

  const secondaryNavItems = [
    { id: 'ledger', label: 'Ledger Analysis', icon: BarChart3 },
    { id: 'datasources', label: 'Data Sources', icon: Database },
    { id: 'audit', label: 'Audit Trail', icon: Fingerprint },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 fixed top-14 left-0 h-[calc(100vh-56px)] z-30 bg-white border-r border-slate-200/70 flex flex-col justify-between select-none overflow-y-auto">
      {/* Navigation Links */}
      <div className="p-3 space-y-4 mt-1">
        {/* Core Workspace */}
        <div className="space-y-0.5">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Workspace
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors group ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`min-w-[18px] text-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        isActive
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.hotkey && (
                    <kbd
                      className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                        isActive ? 'text-slate-400' : 'text-slate-300'
                      }`}
                    >
                      {item.hotkey}
                    </kbd>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Analytics & System Tools */}
        <div className="space-y-0.5 pt-2 border-t border-slate-100">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Operations & Control
          </div>

          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors group ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-[11px] bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-500 font-mono font-medium">55 Invariants</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-400 font-mono border border-slate-200/80">
          v2.5
        </span>
      </div>
    </aside>
  );
}
