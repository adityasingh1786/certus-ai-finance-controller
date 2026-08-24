import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, UserCheck, Key } from 'lucide-react';

/**
 * Enterprise Auth Screen
 * High-trust login screen with Single-Click Demo Controller access
 * and role-based authentication.
 */
export default function AuthScreen({ onLoginSuccess }) {
  const [role, setRole] = useState('Senior Financial Controller');

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-page">
      <div className="w-full max-w-[460px] bg-surface p-8 border border-border-subtle rounded-2xl space-y-6 text-center shadow-card relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-sterling/10 border border-sterling/30 flex items-center justify-center text-sterling">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-ink-primary tracking-tight">Certus</h1>
            <p className="text-xs text-ink-muted mt-1 font-sans">
              Autonomous Financial Controller & Multi-Source Reconciler
            </p>
          </div>
        </div>

        {/* Controller Profile Badge */}
        <div className="p-3.5 bg-page border border-border-subtle rounded-xl text-left flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sterling flex items-center justify-center text-white font-bold text-sm">
              FC
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-primary">Niraj Singh</p>
              <p className="text-[11px] text-ink-muted font-mono">{role}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-status-matched-bg text-status-matched-text border border-status-matched-border">
            ACTIVE
          </span>
        </div>

        {/* Primary Enterprise Demo Login Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onLoginSuccess}
            className="w-full bg-sterling hover:bg-sterling-hover text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-subtle transition-fast"
          >
            <span>Launch Financial Controller</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onLoginSuccess}
            className="text-xs text-ink-secondary hover:text-ink-primary transition-fast flex items-center justify-center gap-1.5 mx-auto"
          >
            <Lock className="w-3 h-3 text-ink-muted" />
            <span>Single Sign-On (SSO / SAML 2.0)</span>
          </button>
        </div>

        {/* Bounded Authority Governance Notice */}
        <div className="pt-4 border-t border-border-subtle text-[11px] text-ink-muted leading-relaxed font-mono">
          <span>Track 04 • Razorpay AI Buildathon 2026 • Dual-Lock Gate • Read-Only MCP Tools</span>
        </div>

      </div>
    </div>
  );
}
