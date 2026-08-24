import React, { useState, useEffect } from 'react';
import { soundManager } from '../lib/soundFx';

const KERNEL_MESSAGES = [
  { text: "Mounting SQLite WAL Shared Ring Buffer...", sub: "0.00ms temporal jitter active" },
  { text: "Initializing 16-D Hilbert Space Tensor Engine...", sub: "Continuous metric convergence verified" },
  { text: "Calibrating Double-Lock Invariant Gates...", sub: "55 Programmatic Invariants locked" },
  { text: "Generating ZK-STARK Solvency Proof Verifier...", sub: "Zero-knowledge polynomial commitment ready" },
  { text: "Binding Multi-Rail Adapters (Razorpay, Bank, ERP)...", sub: "20 Sovereign Datasets mapped (DS-01..DS-20)" },
  { text: "Authenticating Core Architect Node [Aditya Singh]...", sub: "Sharda Univ B.Tech CSE (AI/ML) · Core Architect" },
  { text: "Singularity Financial OS Ready. Entering...", sub: "Deterministic reconciliation certainty achieved" },
];

export default function SingularityBootScreen({ onBootComplete }) {
  const [phase, setPhase] = useState('genesis'); // 'genesis' | 'kernel'
  const [progress, setProgress] = useState(0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  useEffect(() => {
    // Play subtle crystal initialization chime
    try {
      soundManager.playMatchChime();
    } catch (_) {}

    // Phase 1: Genesis logo focus (0 -> 1.2s)
    const genesisTimer = setTimeout(() => {
      setPhase('kernel');
    }, 1200);

    // Progress increment timer
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(100, prev + step);
      });
    }, 120);

    // Log stepper interval
    const logInterval = setInterval(() => {
      setActiveLogIndex((prev) => {
        if (prev < KERNEL_MESSAGES.length - 1) {
          try {
            soundManager.playClick();
          } catch (_) {}
          return prev + 1;
        }
        return prev;
      });
    }, 380);

    // Completion timeout (3.4s)
    const completeTimer = setTimeout(() => {
      try {
        soundManager.playMatchChime();
      } catch (_) {}
      onBootComplete();
    }, 3400);

    return () => {
      clearTimeout(genesisTimer);
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearTimeout(completeTimer);
    };
  }, [onBootComplete]);

  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-[#08090D] flex flex-col items-center justify-center select-none overflow-hidden text-white font-sans">
      {/* 🌌 Deep Space Ambient Caustics & Particle Radial Rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-rose-600/10 via-indigo-600/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] border border-rose-500/15 rounded-full animate-ping duration-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 space-y-8 text-center">
        {/* 💎 3D Crystal Logo with Holographic Laser Gauge */}
        <div className="relative flex items-center justify-center">
          {/* Circular SVG Laser Progress Arc */}
          <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="#E8384F"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-150 ease-out drop-shadow-[0_0_12px_rgba(232,56,79,0.9)]"
            />
          </svg>

          {/* Floating Photorealistic 3D Crystal Logo */}
          <div className="absolute w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-rose-500/40 p-0.5 bg-gradient-to-tr from-white/30 to-white/5 border border-white/40 backdrop-blur-xl animate-[float_4s_ease-in-out_infinite]">
            <img
              src="/certus-3d-logo.jpg"
              alt="Certus 3D Singularity Logo"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* Brand & Kernel Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8384F] animate-ping" />
            <h1 className="text-xl font-display font-bold tracking-wider text-white">
              CERTUS FINANCIAL OS
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-[#E8384F] border border-rose-500/40 font-bold">
              v2.4 SINGULARITY
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            12-Layer Sovereign Architecture • Zero-Delay Invariant Engine
          </p>
        </div>

        {/* 📟 Live Terminal Diagnostic Stream */}
        <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-2xl text-left space-y-2.5 shadow-2xl">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 text-slate-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              QUANTUM BOOT SEQUENCE
            </span>
            <span className="text-rose-400 font-bold font-mono">{progress}%</span>
          </div>

          <div className="space-y-1.5 min-h-[56px] flex flex-col justify-center">
            <div className="text-xs font-mono text-slate-200 flex items-center gap-2">
              <span className="text-[#E8384F] font-bold">&gt;</span>
              <span>{KERNEL_MESSAGES[activeLogIndex].text}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 pl-4">
              ↳ {KERNEL_MESSAGES[activeLogIndex].sub}
            </div>
          </div>
        </div>

        {/* Sub-Footer System Attestation */}
        <div className="text-[9px] font-mono text-slate-600 flex items-center justify-between w-full px-2">
          <span>ARCHITECT: ADITYA SINGH (19)</span>
          <span>SHARDA UNIV CSE (AI/ML)</span>
        </div>
      </div>
    </div>
  );
}
