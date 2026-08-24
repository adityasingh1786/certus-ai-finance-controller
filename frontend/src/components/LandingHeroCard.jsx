import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, Clock, CheckCircle2 } from 'lucide-react';

/**
 * Signature Motion: Auto-cycling Confidence Sweep demo card
 * Cycles through outcomes: Green (auto-reconciled), Red (exception), Amber (quarantined).
 */
export default function LandingHeroCard() {
  const outcomes = [
    {
      status: 'AUTO_RECONCILED',
      color: '#2FD97F',
      dim: '#12261B',
      glow: 'rgba(47, 217, 127, 0.30)',
      badge: '3-Way Match Verified',
      icon: CheckCircle2,
      txId: 'pay_live_091823',
      amount: '₹14,500.00',
      reason: '100% exact match across Gateway, Bank UTR (UTR982341908234), and ERP Ledger (INV-2026-0891).',
      confidence: '1.00',
    },
    {
      status: 'QUARANTINED',
      color: '#FF3B3B',
      dim: '#3A1414',
      glow: 'rgba(255, 59, 59, 0.35)',
      badge: 'Layer 1 Anomaly Isolated',
      icon: AlertOctagon,
      txId: 'pay_bad_019283',
      amount: '-₹5,000.00',
      reason: 'IMPOSSIBLE_VALUE: Gross amount cannot be negative for settlement credit. Isolated from trusted DB.',
      confidence: '0.00',
    },
    {
      status: 'AMBIGUOUS_RESOLVED',
      color: '#FFB020',
      dim: '#2E2210',
      glow: 'rgba(255, 176, 32, 0.30)',
      badge: 'Fuzzy Entity Matched',
      icon: Clock,
      txId: 'pay_fuz_002931',
      amount: '₹45,000.00',
      reason: 'RapidFuzz score 0.88 resolved "Acme India Pvt Ltd" to "Acme Corp India Private Limited".',
      confidence: '0.92',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSweeping, setIsSweeping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSweeping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % outcomes.length);
        setIsSweeping(false);
      }, 900);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const current = outcomes[currentIndex];
  const IconComponent = current.icon;

  return (
    <div
      className={`glass-panel p-6 rounded-2xl w-full max-w-md transition-all duration-500 relative overflow-hidden`}
      style={{
        borderColor: current.color,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.40), 0 0 25px ${current.glow}`,
      }}
    >
      {/* Sweep overlay */}
      {isSweeping && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4FD1FF]/20 to-transparent animate-pulse pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4" style={{ color: current.color }} />
          <span className="font-mono text-xs text-[#F7F5F2]">{current.txId}</span>
        </div>
        <span
          className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-pill"
          style={{ backgroundColor: current.dim, color: current.color }}
        >
          {current.badge}
        </span>
      </div>

      {/* Amount and Confidence */}
      <div className="py-4 flex items-baseline justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#9A9AA5] block">Settlement Amount</span>
          <span className="text-2xl font-mono font-semibold text-[#F7F5F2]">{current.amount}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-[#9A9AA5] block">Confidence</span>
          <span className="text-sm font-mono font-semibold" style={{ color: current.color }}>
            {current.confidence}
          </span>
        </div>
      </div>

      {/* Diagnostic Reason */}
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-[#9A9AA5] leading-relaxed">
        <span className="text-white font-medium">Verdict: </span>
        {current.reason}
      </div>

      {/* Micro Status Bar */}
      <div className="mt-4 pt-2 flex items-center justify-between text-[10px] text-[#5C5C68] font-mono">
        <span>Dual-Layer Validation Gate</span>
        <span>Auto-Cycling Demo</span>
      </div>
    </div>
  );
}
