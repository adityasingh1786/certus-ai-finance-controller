import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Zap, Building, Database } from 'lucide-react';

/**
 * LandingHeroCard — High-End Live Preview Card for Landing Page
 * Demonstrates 3-way multi-rail consensus in real time with subtle transitions.
 */
export default function LandingHeroCard({ onExploreWorkspace }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      rail: 'Gateway Instant Capture',
      id: 'pay_82Xy9910',
      amt: '₹14,500.00',
      status: 'Gross Capture',
      icon: Zap,
    },
    {
      rail: 'HDFC Corporate CMS',
      id: 'UTR-9140281092',
      amt: '₹14,137.50',
      status: 'Net Settlement (T+1)',
      icon: Building,
    },
    {
      rail: 'Tally Prime General Ledger',
      id: 'INV-2026-1093',
      amt: '₹14,500.00',
      status: 'Voucher Synchronized',
      icon: Database,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-6 shadow-modal max-w-xl mx-auto space-y-5 text-left select-none">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-ink-primary uppercase tracking-wider">
            Live Autonomous Consensus Mesh
          </span>
        </div>
        <span className="text-[10px] font-mono text-ink-muted bg-page px-2 py-0.5 rounded border border-border-subtle">
          8,345 ops/s
        </span>
      </div>

      {/* 3 Rails Display */}
      <div className="space-y-2.5">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isHighlighted = activeStep === idx;

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border transition-fast flex items-center justify-between ${
                isHighlighted
                  ? 'bg-page border-border-strong shadow-subtle'
                  : 'bg-surface border-border-subtle opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-surface border border-border-subtle flex items-center justify-center text-ink-primary">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-primary">{s.rail}</p>
                  <p className="font-mono text-[10px] text-ink-muted">{s.id}</p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs font-bold text-ink-primary block">{s.amt}</span>
                <span className="text-[10px] text-emerald-700 font-medium">{s.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Double-Lock Status Strip */}
      <div className="p-3.5 rounded-lg bg-page border border-border-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-medium text-ink-primary">Double-Lock Gate: 98.4% Confidence Passed</span>
        </div>
        <span className="font-mono text-[10px] text-ink-muted">0.00 Paisa Drift</span>
      </div>

      {/* CTA Button */}
      {onExploreWorkspace && (
        <button
          onClick={onExploreWorkspace}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-ink-primary hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle transition-fast"
        >
          <span>Open Live Financial Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
