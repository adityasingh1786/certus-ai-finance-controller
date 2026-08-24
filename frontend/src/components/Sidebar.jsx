import React from 'react';
import {
  LayoutDashboard,
  Layers,
  ShieldAlert,
  TrendingUp,
  Bot,
  Terminal,
  FileCheck,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  exceptionCount = 0,
  onOpenArchitecture,
  onOpenSwagger,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Drop & Reconcile', icon: LayoutDashboard },
    { id: 'reconcile', label: 'Match Matrix', icon: Layers },
    { id: 'exceptions', label: 'Quarantine Queue', icon: ShieldAlert, badge: exceptionCount },
    { id: 'cash-forecast', label: 'Cash & Forecast', icon: TrendingUp },
    { id: 'copilot', label: 'Financial Copilot', icon: Bot },
  ];

  return (
    <aside className="w-64 border-r border-border-subtle bg-surface flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wider font-display">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-fast ${
                isActive
                  ? 'bg-page text-sterling border border-border-strong font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-page/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sterling' : 'text-ink-muted'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-sterling text-white'
                      : 'bg-status-mismatched-bg text-sterling border border-sterling-border'
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
          <span>Engine:</span>
          <span className="text-ink-primary font-semibold">Dual-Lock v1.0</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
          <span>Database:</span>
          <span className="text-emerald-700 font-semibold">SQLite Synced</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
          <span>Gate Threshold:</span>
          <span className="text-ink-primary font-semibold">0.75</span>
        </div>
      </div>
    </aside>
  );
}
