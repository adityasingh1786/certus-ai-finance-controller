import React from 'react';
import { ShieldCheck, Cpu, BookOpen, Layers, Terminal, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenArchitecture, onOpenSwagger, isLiveMode = false }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border/80 px-4 lg:px-8 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand & Tag */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan p-0.5 shadow-lg shadow-primary-500/20">
            <div className="h-full w-full bg-surface rounded-[10px] flex items-center justify-center">
              <Cpu className="h-5 w-5 text-primary-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                AI Finance Controller
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                  Enterprise Edition
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-Source Reconciliation • Zero-Hallucination Gating • Read-Only Agent
            </p>
          </div>
        </div>

        {/* Right: Actions & Status Pills */}
        <div className="flex items-center gap-2.5">
          {/* Status Beacon */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-light/60 border border-border text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-slate-300 font-mono">Engine: Active (Dual-Layer)</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-light/60 border border-border text-xs text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-teal" />
            <span>Read-Only Guardrails</span>
          </div>

          {/* Architecture Blueprint Modal Button */}
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-light text-slate-200 text-xs font-medium border border-border transition-colors shadow-sm"
            title="View System Architecture & Dual-Layer Pipeline"
          >
            <Layers className="h-3.5 w-3.5 text-primary-400" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          {/* Swagger Interactive Docs Button */}
          <button
            onClick={onOpenSwagger}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-600/30 to-accent-teal/30 hover:from-primary-600/50 hover:to-accent-teal/50 text-white text-xs font-medium border border-primary-500/30 transition-all shadow-sm"
            title="Open Swagger OpenAPI Documentation"
          >
            <Terminal className="h-3.5 w-3.5 text-accent-cyan" />
            <span>API Docs</span>
          </button>
        </div>

      </div>
    </header>
  );
}
