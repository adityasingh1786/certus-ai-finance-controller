'use client';

import React from 'react';
import { ShieldCheck, Zap, Bot, LayoutDashboard, Sparkles, RefreshCw, Lock } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'chat';
  setActiveTab: (tab: 'dashboard' | 'chat') => void;
  onLoadDemo: () => void;
  loadingDemo: boolean;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onLoadDemo,
  loadingDemo,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 px-6 py-3.5 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Track */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1px] shadow-glow-cyan flex items-center justify-center">
            <div className="w-full h-full bg-[#080d1a] rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight gradient-text-razor">
                AI Finance Controller
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Track 04
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Razorpay AI Buildathon 2026</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <Lock className="w-3 h-3 inline" /> Read-Only Safe
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Reconciliation</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Agent Query & Citations</span>
          </button>
        </div>

        {/* Actions & System Badges */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLoadDemo}
            disabled={loadingDemo}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {loadingDemo ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{loadingDemo ? 'Processing Batch...' : 'Load 60-Record Demo Batch'}</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual-Gate Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
