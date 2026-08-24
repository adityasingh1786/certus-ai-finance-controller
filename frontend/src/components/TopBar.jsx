import React from 'react';
import { Layers, Terminal, Sparkles, Globe, LogOut, ShieldCheck, User } from 'lucide-react';
import CertusLogo from './CertusLogo';

export default function TopBar({
  activeTab,
  onOpenArchitecture,
  onOpenSwagger,
  onLoadDemo,
  isReconciling,
  onOpenLanding,
  onLogout,
}) {
  const HUB_NAMES = {
    recon: 'Reconciliation Hub',
    exceptions: 'Quarantine & Traps',
    treasury: 'Treasury & Liquidity',
    copilot: 'Autonomous Copilot',
    governance: 'System Governance',
  };

  return (
    <header className="h-14 border-b border-border-subtle bg-surface px-6 flex items-center justify-between sticky top-0 z-20 shadow-subtle">
      {/* Brand & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <CertusLogo className="w-7 h-7" textClassName="text-base font-bold" />
        <span className="text-border-strong text-xs">/</span>
        <span className="text-xs font-display font-semibold text-ink-primary">
          {HUB_NAMES[activeTab] || 'Workspace'}
        </span>
        <span className="hidden sm:inline text-border-strong text-xs">|</span>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-medium font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Double-Lock Engine Active
        </div>
      </div>

      {/* Action Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onLoadDemo}
          disabled={isReconciling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sterling hover:bg-sterling-hover text-white text-xs font-semibold shadow-subtle transition-fast disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isReconciling ? 'Reconciling...' : '1-Click Demo'}</span>
        </button>

        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-strong text-ink-secondary hover:text-ink-primary text-xs font-medium transition-fast bg-surface"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Landing Overview</span>
          </button>
        )}

        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-strong text-ink-secondary hover:text-ink-primary text-xs font-medium transition-fast bg-surface"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Architecture</span>
        </button>

        <button
          onClick={onOpenSwagger}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-strong text-ink-secondary hover:text-ink-primary text-xs font-medium transition-fast bg-surface"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">API Docs</span>
        </button>

        {/* Controller Profile & Logout */}
        <div className="h-4 w-[1px] bg-border-subtle mx-1 hidden sm:block" />

        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-page border border-border-subtle text-xs font-mono">
          <div className="w-5 h-5 rounded-full bg-sterling-light/60 border border-sterling-border flex items-center justify-center text-sterling text-[10px] font-bold">
            NS
          </div>
          <span className="text-ink-primary font-semibold">Niraj Singh</span>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out to Overview"
            className="p-1.5 rounded-lg border border-border-subtle hover:border-sterling hover:text-sterling text-ink-muted transition-fast bg-surface"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
