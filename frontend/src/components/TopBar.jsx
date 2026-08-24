import React from 'react';
import { Layers, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

export default function TopBar({ onOpenArchitecture, onOpenSwagger, onLoadDemo, isReconciling }) {
  return (
    <header className="h-14 border-b border-border-subtle bg-surface px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Brand & Engine Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sterling rounded-md flex items-center justify-center text-white font-display font-bold text-sm">
            C
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-ink-primary">
            CERTUS
          </span>
        </div>
        <span className="text-border-strong text-xs">|</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Double-Lock Engine Active
        </div>
      </div>

      {/* Action Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onLoadDemo}
          disabled={isReconciling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-strong hover:border-sterling text-ink-secondary hover:text-sterling text-xs font-medium transition-fast bg-surface hover:bg-sterling-light/30 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-sterling" />
          <span>1-Click Demo</span>
        </button>

        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-subtle hover:border-border-strong text-ink-secondary hover:text-ink-primary text-xs font-medium transition-fast bg-surface"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Architecture</span>
        </button>

        <button
          onClick={onOpenSwagger}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-subtle hover:border-border-strong text-ink-secondary hover:text-ink-primary text-xs font-medium transition-fast bg-surface"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>API Docs</span>
        </button>
      </div>
    </header>
  );
}
