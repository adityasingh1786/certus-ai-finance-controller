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
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  exceptionCount = 0,
  onOpenArchitecture,
  onOpenSwagger,
}) {
  const navItems = [
    { id: 'recon', label: 'Reconciliation Hub', icon: Layers },
    { id: 'exceptions', label: 'Quarantine & Traps', icon: ShieldAlert, badge: exceptionCount },
    { id: 'treasury', label: 'Treasury & Liquidity', icon: TrendingUp },
    { id: 'copilot', label: 'Autonomous Copilot', icon: Bot },
    { id: 'governance', label: 'System Governance', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-border-subtle bg-surface flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wider font-display">
          Operating Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-fast font-display ${
                isActive
                  ? 'bg-page text-sterling border border-border-strong shadow-subtle'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-page/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sterling' : 'text-ink-muted'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-sterling text-white'
                      : 'bg-sterling-light/60 text-sterling border border-sterling-border'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Specs */}
      <div className="p-4 border-t border-border-subtle bg-page/40 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
          <span>Edition:</span>
          <span className="text-ink-primary font-semibold">Enterprise v2.4</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
          <span>Engine:</span>
          <span className="text-emerald-600 font-semibold">Double-Lock (0.75)</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
          <span>Audit Status:</span>
          <span className="text-ink-primary font-semibold">ACID Live Synced</span>
        </div>
      </div>
    </aside>
  );
}
