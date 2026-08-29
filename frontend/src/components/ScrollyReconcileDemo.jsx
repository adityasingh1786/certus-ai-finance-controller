import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  Activity
} from 'lucide-react';
import { soundManager } from '../lib/soundFx';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollyReconcileDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const pinRef = useRef(null);

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
        { label: 'Gateway Raw', value: '₹14,500.00 → 1450000 paisa', status: 'normal' },
        { label: 'Bank CMS UTR', value: 'UTR90128391823 (Settled)', status: 'normal' },
        { label: 'ERP Ledger', value: 'INV-2026-0891 (Sales Journal)', status: 'normal' },
      ],
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
    },
  ];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=1800',
        pin: pinRef.current,
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress < 0.33) {
            setActiveStep(0);
          } else if (progress < 0.66) {
            setActiveStep(1);
          } else {
            setActiveStep(2);
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleStepClick = (idx) => {
    try {
      soundManager.playClick();
    } catch (_) {}
    setActiveStep(idx);
  };

  const currentData = STEPS[activeStep];

  return (
    <section ref={containerRef} className="relative w-full bg-[#FAFAF9] py-12 md:py-24 border-y border-slate-200/80">
      {/* Ambient background light glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div ref={pinRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 shadow-xs mb-4">
            <ShieldCheck className="w-4 h-4 text-[#E8384F]" />
            <span className="text-xs font-mono font-semibold text-[#E8384F] uppercase tracking-wider">
              INVARIANT MACHINE WALKTHROUGH
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">
            How Certus Reconciles <span className="text-[#E8384F]">Multi-Rail Cash</span> with Zero Drift
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-sans">
            Scroll down or click below to inspect the deterministic 3-stage pipeline executing across live financial rails.
          </p>

          {/* Interactive Step Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeStep === idx
                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200/80 border border-rose-200 scale-105'
                    : 'bg-slate-100/80 text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeStep === idx ? 'bg-[#E8384F] animate-pulse' : 'bg-slate-300'}`} />
                {`Stage ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollytelling Visual Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Stage Explanation & Rules */}
          <div className="lg:col-span-5 space-y-6">
            <div className="luxury-glass-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200/80 relative overflow-hidden">
              {/* Top Laser Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E8384F] to-transparent" />

              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md bg-rose-50 text-[#E8384F] text-[11px] font-mono font-bold tracking-wider uppercase border border-rose-200">
                  {currentData.badge}
                </span>
                <span className="text-xs font-mono text-slate-400 font-medium">
                  {`0${activeStep + 1} / 03`}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                {currentData.title}
              </h3>
              <p className="text-sm font-medium text-[#E8384F] mt-1">
                {currentData.subtitle}
              </p>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                {currentData.description}
              </p>

              {/* Progress Indicator Bar */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                  <span>PIPELINE EXECUTION PROGRESS</span>
                  <span className="font-bold text-[#E8384F]">
                    {Math.round(((activeStep + 1) / 3) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E8384F] to-[#FF2E4D] transition-all duration-500 rounded-full"
                    style={{ width: `${((activeStep + 1) / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Ledger Matrix Visualization */}
          <div className="lg:col-span-7">
            <div className="luxury-glass-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200/80 relative">
              {/* Header Telemetry */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#E8384F] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                    REAL-TIME INVARIANT TELEMETRY
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  55 INVARIANTS ARMED
                </span>
              </div>

              {/* Dynamic Interactive Stage Inspector */}
              <div className="space-y-4">
                {currentData.details.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all duration-300 hover:bg-white hover:border-rose-200 hover:shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.status === 'success' || item.status === 'cleared' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : item.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <Zap className="w-4 h-4 text-[#E8384F] shrink-0" />
                      )}
                      <span className="text-xs font-mono text-slate-600 font-semibold">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
                      {item.value}
                    </span>
                  </div>
                ))}

                {/* Optional Composite Confidence Meter for Stage 2 */}
                {activeStep === 1 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-indigo-50 border border-rose-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#E8384F]" />
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-900">
                          COMPOSITE RAPIDFUZZ SCORE
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          Double-lock threshold ≥ 0.75 passed
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-mono font-bold text-[#E8384F]">
                      98.4%
                    </div>
                  </div>
                )}

                {/* Interactive Status Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Consensus Gate Active
                  </span>
                  <span>Latency: ~1.37ms / record</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
