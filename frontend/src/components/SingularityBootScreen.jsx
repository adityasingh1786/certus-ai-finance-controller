import React, { useState, useEffect } from 'react';
import { soundManager } from '../lib/soundFx';
import { ShieldCheck, Cpu, Lock, Activity, Sparkles } from 'lucide-react';

export default function SingularityBootScreen({ onBootComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const BOOT_STEPS = [
    { label: "16-D HILBERT TENSOR MESH", status: "ONLINE", icon: Cpu },
    { label: "ZK-STARK SOLVENCY PROOFS", status: "VERIFIED", icon: Lock },
    { label: "0.00ms SHARED STATE RING", status: "SYNCHRONIZED", icon: Activity },
    { label: "DOUBLE-LOCK INVARIANT GATES", status: "55/55 LOCKED", icon: ShieldCheck },
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
        const delta = Math.floor(Math.random() * 8) + 5;
        return Math.min(100, prev + delta);
      });
    }, 70);

    // Step cycler
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < BOOT_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    // Exit transition at 2.6s
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      try {
        soundManager.playMatchChime();
      } catch (_) {}
      setTimeout(() => {
        onBootComplete();
      }, 600);
    }, 2600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(exitTimer);
    };
  }, [onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-[#07080C] text-white flex flex-col items-center justify-between p-8 sm:p-12 select-none overflow-hidden transition-all duration-600 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 🌌 High-Tech Volumetric Ambient Glow & Grid Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle Cybernetic Grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient Radial Auroras */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-rose-600/20 via-indigo-600/15 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-rose-500/20 rounded-full animate-ping duration-1000" />
      </div>

      {/* Top HUD Telemetry Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold tracking-wider">CERTUS KERNEL v2.4</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-slate-400">
          <span>LATENCY: <strong className="text-emerald-400 font-mono">0.00ms</strong></span>
          <span>SOLVENCY TARGET: <strong className="text-rose-400 font-mono">₹872,000,000,000</strong></span>
        </div>
        <div className="text-right">
          <span className="text-rose-400 font-bold font-mono">SOVEREIGN CORE</span>
        </div>
      </div>

      {/* 🏛️ Center Showcase: Monumental 3D Crystal Emblem & Laser Rings */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-8 text-center max-w-xl w-full">
        
        {/* Holographic Rotating Emblem Vessel */}
        <div className="relative flex items-center justify-center">
          {/* Animated Orbital Laser Ring */}
          <div className="absolute w-44 h-44 rounded-full border border-rose-500/30 border-t-[#E8384F] border-r-[#E8384F] animate-spin duration-700 shadow-[0_0_20px_rgba(232,56,79,0.4)]" />
          <div className="absolute w-52 h-52 rounded-full border border-indigo-500/20 border-b-indigo-400 animate-spin duration-1000" style={{ animationDirection: 'reverse' }} />

          {/* 3D Glassmorphic Crystal Emblem Frame */}
          <div className="relative w-32 h-32 rounded-3xl p-1 bg-gradient-to-br from-white/20 via-white/5 to-transparent backdrop-blur-2xl border border-white/30 shadow-[0_0_50px_rgba(232,56,79,0.35)] flex items-center justify-center overflow-hidden group">
            <img
              src="/certus-3d-logo.jpg"
              alt="Certus 3D Singularity Logo"
              className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
            />
            {/* Prismatic Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40 pointer-events-none rounded-2xl" />
          </div>
        </div>

        {/* Brand Title & Sub-Headline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#E8384F]" />
            <span>FINANCIAL OPERATING SYSTEM</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-white drop-shadow-lg">
            Certus Singularity
          </h1>
          <p className="text-sm text-slate-400 font-sans max-w-md mx-auto">
            Autonomous 3-Way Reconciliation & Sovereign Liquidity Mesh
          </p>
        </div>

        {/* ⚡ High-Tech Loading Gauge & Telemetry Progress */}
        <div className="w-full max-w-md space-y-3">
          {/* Laser Progress Bar */}
          <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#E8384F] via-rose-400 to-[#E8384F] rounded-full transition-all duration-100 ease-out shadow-[0_0_15px_rgba(232,56,79,0.9)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percent & Live Sub-Step Indicator */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              {React.createElement(BOOT_STEPS[activeStep].icon, { className: "w-4 h-4 text-[#E8384F] animate-pulse" })}
              <span className="font-semibold">{BOOT_STEPS[activeStep].label}</span>
            </div>
            <span className="text-[#E8384F] font-bold text-sm tracking-wider">{progress}%</span>
          </div>
        </div>

      </div>

      {/* Bottom Telemetry Footer Grid */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-4 text-left">
        {BOOT_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = activeStep >= idx;
          return (
            <div
              key={step.label}
              className={`p-2.5 rounded-xl border transition-all ${
                isPassed
                  ? 'bg-white/5 border-rose-500/30 text-white'
                  : 'bg-black/20 border-white/5 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-3.5 h-3.5 ${isPassed ? 'text-[#E8384F]' : 'text-slate-600'}`} />
                <span className={`text-[9px] font-mono font-bold ${isPassed ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {isPassed ? step.status : 'PENDING'}
                </span>
              </div>
              <p className="text-[10px] font-mono font-medium truncate mt-1">
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
