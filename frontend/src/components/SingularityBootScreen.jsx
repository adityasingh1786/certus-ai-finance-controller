import React, { useState, useEffect } from 'react';
import { soundManager } from '../lib/soundFx';
import { ShieldCheck, Cpu, Lock, Activity, Sparkles } from 'lucide-react';
import CertusLogo from './CertusLogo';

export default function SingularityBootScreen({ onBootComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const BOOT_STEPS = [
    { label: "16-D HILBERT TENSOR MESH", status: "ONLINE", icon: Cpu },
    { label: "ZK-STARK SOLVENCY PROOFS", status: "VERIFIED", icon: Lock },
    { label: "0.00ms SHARED STATE RING", status: "SYNCHRONIZED", icon: Activity },
    { label: "DOUBLE-LOCK INVARIANT GATES", status: "55/55 ARMED", icon: ShieldCheck },
  ];

  useEffect(() => {
    try {
      soundManager.playMatchChime();
    } catch (_) {}

    // Progress counter
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 8) + 6;
        return Math.min(100, prev + delta);
      });
    }, 60);

    // Step cycler
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < BOOT_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    // Exit transition at 2.4s
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      try {
        soundManager.playMatchChime();
      } catch (_) {}
      setTimeout(() => {
        onBootComplete();
      }, 500);
    }, 2400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(exitTimer);
    };
  }, [onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-[#FAFAF9] text-slate-900 flex flex-col items-center justify-between p-8 sm:p-12 select-none overflow-hidden transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 🌌 Luminous White & Crimson Aurora Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Fine Architectural Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.6) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(15,23,42,0.6) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Ambient Radial Glowing Halos */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-rose-500/10 via-indigo-500/5 to-transparent rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-rose-500/15 rounded-full animate-ping duration-1000" />
      </div>

      {/* Top HUD Telemetry Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-900 font-bold tracking-wider">CERTUS KERNEL v2.4</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <span>LATENCY: <strong className="text-emerald-700 font-mono">0.00ms</strong></span>
          <span>AIR-GAP: <strong className="text-[#E8384F] font-mono">ACTIVE</strong></span>
        </div>
        <div className="text-right">
          <span className="text-[#E8384F] font-bold font-mono">SOVEREIGN CORE</span>
        </div>
      </div>

      {/* 🏛️ Center Showcase: Dynamic Logo & Laser Sequence */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-8 text-center max-w-md w-full">
        <div className="relative flex items-center justify-center">
          {/* Orbital Rings */}
          <div className="absolute w-36 h-36 rounded-full border border-rose-500/20 animate-spin duration-3000" />
          <div className="absolute w-44 h-44 rounded-full border border-indigo-500/15 animate-ping duration-2000" />

          {/* Core Monogram */}
          <div className="relative z-10 luxury-glass-card p-6 rounded-3xl bg-white shadow-2xl shadow-rose-500/10">
            <CertusLogo className="w-16 h-16" showText={false} />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            CERTUS SOVEREIGN
          </h1>
          <p className="text-xs font-mono text-[#E8384F] font-semibold mt-1 uppercase tracking-widest">
            AI Financial Controller OS
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="font-semibold text-slate-700">
              {BOOT_STEPS[activeStep]?.label}
            </span>
            <span className="font-bold text-[#E8384F]">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#E8384F] to-[#FF2E4D] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Active Step Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-mono text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>STATUS: <strong className="text-emerald-700">{BOOT_STEPS[activeStep]?.status}</strong></span>
        </div>
      </div>

      {/* Bottom Legal / Author Footnote */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-200/80 pt-4">
        <span>Razorpay AI Buildathon 2026</span>
        <span>Architected by <strong className="text-slate-700">Aditya Singh</strong></span>
      </div>
    </div>
  );
}
