import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Database,
  Layers,
  Lock,
  Cpu,
  Activity,
  Play,
  Pause,
} from 'lucide-react';
import { soundManager } from '../lib/soundFx';

export default function ScrollyReconcileDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);

  const STEPS = [
    {
      id: 'step-1',
      title: '01 / Ingestion & Paisa Quantization',
      subtitle: 'Zero-drift integer arithmetic over disparate raw rails',
      description:
        'Raw settlement payloads (Razorpay settlement CSVs, HDFC/ICICI Corporate CMS feeds, Tally Prime vouchers) are ingested and converted into integer paisa structures. Eliminates IEEE-754 floating-point inaccuracies before reconciliation begins.',
      badge: 'LAYER 1: SANITIZATION',
      accentColor: 'rose',
      details: [
        { label: 'Gateway Raw', value: '₹14,500.00 → 1,450,000 paisa', status: 'normal' },
        { label: 'Bank CMS UTR', value: 'UTR90128391823 (Settled)', status: 'normal' },
        { label: 'ERP Ledger', value: 'INV-2026-0891 (Sales Journal)', status: 'normal' },
      ],
      tag: '0.00ms Drift',
    },
    {
      id: 'step-2',
      title: '02 / RapidFuzz Multi-Signal Consensus',
      subtitle: 'Composite confidence weighting across 3 dimensions',
      description:
        'RapidFuzz token-set matching cross-references entity names and narrations against the corporate ledger. Evaluates Amount Precision (50%), Reference Match (30%), and Date Proximity (20%) to build a composite verification score.',
      badge: 'LAYER 2: CONSENSUS ENGINE',
      accentColor: 'indigo',
      details: [
        { label: 'Amount Match (50%)', value: '1.00 (Exact Paisa Match)', status: 'success' },
        { label: 'Reference Match (30%)', value: '0.98 (UTR & Invoice Token)', status: 'success' },
        { label: 'Date Proximity (20%)', value: '0.95 (Cleared T+0)', status: 'success' },
      ],
      compositeScore: '0.984 / 1.00',
      tag: 'Double-Lock Passed',
    },
    {
      id: 'step-3',
      title: '03 / Double-Lock Gate & Dual-Path Resolution',
      subtitle: '55 Invariants enforce ledger clearing vs fail-closed isolation',
      description:
        'If composite confidence ≥ 0.75 and all 55 compiler invariants pass, the transaction is marked MATCHED. Any anomaly — such as a 24.50 MDR fee drift — is instantly routed to Fail-Closed Quarantine with zero ledger pollution.',
      badge: 'LAYER 3: INVARIANT CLEARING',
      accentColor: 'emerald',
      details: [
        { label: 'Matched Records (90%)', value: 'Posted directly to Tally GL', status: 'cleared' },
        { label: 'Quarantined Record', value: '+₹24.50 MDR Fee Drift Isolated', status: 'warning' },
        { label: 'Forensic Audit Log', value: 'Cryptographic SHA-256 Receipt', status: 'cleared' },
      ],
      tag: 'Deterministic Gate',
    },
  ];

  // Self-Contained Auto-Play Progress Engine (Zero Global Scroll Lock)
  useEffect(() => {
    if (!isAutoPlaying) return;

    const intervalTime = 50; // 50ms ticks
    const totalStepDuration = 4500; // 4.5s per step
    const stepIncrement = (intervalTime / totalStepDuration) * 100;

    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % STEPS.length);
          try {
            soundManager.playLaserHum();
          } catch (_) {}
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, activeStep, STEPS.length]);

  const handleStepClick = (idx) => {
    try {
      soundManager.playClick();
    } catch (_) {}
    setActiveStep(idx);
    setProgressPercent(0);
  };

  const current = STEPS[activeStep];

  return (
    <section className="relative w-full bg-[#FAFAF9] py-16 px-6 lg:px-12 border-y border-slate-200/80 z-10">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 shadow-xs mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E8384F]" />
            <span className="text-xs font-mono font-semibold text-[#E8384F] uppercase tracking-wider">
              INVARIANT MACHINE WALKTHROUGH
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            How Certus Resolves Multi-Rail Drift
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
            An autonomous, 3-stage mathematical invariant pipeline operating without LLM hallucinations.
          </p>
        </div>

        {/* 🎛️ Stage Controller Card (Self-Contained, No Scroll Lag) */}
        <div
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="luxury-glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl space-y-6"
        >
          {/* Top Interactive Stage Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {STEPS.map((step, idx) => {
                const isSelected = activeStep === idx;
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-[#E8384F] animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                    <span>STAGE {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Auto-Play Pause/Resume Indicator */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500 hover:text-slate-900 transition-colors"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-[#E8384F]" />
                    <span>Auto-Cycling (Hover to Pause)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-emerald-600" />
                    <span>Paused</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Auto-Play Linear Progress Indicator Bar */}
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E8384F] transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Active Stage Body (2-Column Spacious Display) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            {/* Left Column: Stage Explanation */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[10px] font-mono font-bold text-[#E8384F]">
                {current.badge}
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 leading-tight">
                {current.title}
              </h3>

              <p className="text-xs font-mono font-bold text-slate-600">
                {current.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Right Column: Interactive Stream Diff Breakdown */}
            <div className="lg:col-span-6 space-y-3">
              <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs font-mono font-bold text-slate-800">
                    Active Invariant Stream
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-emerald-700 font-bold border border-slate-200">
                    {current.tag}
                  </span>
                </div>

                <div className="space-y-2">
                  {current.details.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs font-mono"
                    >
                      <span className="text-slate-500 font-semibold">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>

                {current.compositeScore && (
                  <div className="pt-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">RapidFuzz Composite:</span>
                    <span className="font-bold text-[#E8384F] text-sm">
                      {current.compositeScore}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
