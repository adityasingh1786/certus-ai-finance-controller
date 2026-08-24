import React, { useState, useEffect } from 'react';
import { soundManager } from '../lib/soundFx';

export default function SingularityBootScreen({ onBootComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Play subtle crystal initialization chime
    try {
      soundManager.playMatchChime();
    } catch (_) {}

    // Smooth progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 12) + 8;
        return Math.min(100, prev + delta);
      });
    }, 100);

    // Fade out and complete
    const finishTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onBootComplete();
      }, 400);
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
    };
  }, [onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#FAFAF9] flex flex-col items-center justify-center select-none overflow-hidden text-slate-900 transition-opacity duration-400 aurora-canvas ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 🌌 Ambient Living Aurora Glow Lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-rose-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 space-y-6 text-center">
        
        {/* 💎 Floating 3D Crystal Logo Tile */}
        <div className="relative">
          {/* Subtle Outer Ambient Ring */}
          <div className="absolute -inset-3 bg-gradient-to-tr from-rose-500/20 to-indigo-500/15 rounded-[32px] blur-lg animate-pulse" />
          
          {/* Frosted Acrylic Glass Tile */}
          <div className="relative w-24 h-24 rounded-3xl p-1 bg-white/85 backdrop-blur-2xl border border-white shadow-2xl shadow-slate-900/5 flex items-center justify-center overflow-hidden">
            <img
              src="/certus-3d-logo.jpg"
              alt="Certus 3D Logo"
              className="w-full h-full object-cover rounded-2xl shadow-xs"
            />
            {/* Specular light sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/40 pointer-events-none rounded-2xl" />
          </div>
        </div>

        {/* Brand Header */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl font-display font-bold tracking-tight text-slate-900">
              Certus
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-[#E8384F] border border-rose-200 font-bold tracking-wide">
              FINANCE OS
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Autonomous 3-Way Reconciliation & Liquidity Controller
          </p>
        </div>

        {/* Precision Minimalist Laser Loading Gauge */}
        <div className="w-56 space-y-2 pt-2">
          <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#E8384F] to-[#d42d43] rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(232,56,79,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-semibold px-0.5">
            <span>INITIALIZING KERNEL</span>
            <span className="text-[#E8384F] font-bold">{progress}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
