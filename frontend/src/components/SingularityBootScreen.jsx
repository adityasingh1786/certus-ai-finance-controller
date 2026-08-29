import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../lib/soundFx';
import { ShieldCheck, Cpu, Lock, Activity, Sparkles, Terminal } from 'lucide-react';
import CertusLogo from './CertusLogo';

export default function SingularityBootScreen({ onBootComplete }) {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isDetonating, setIsDetonating] = useState(false);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const COMPILER_LOGS = [
    { code: '0x8F01', msg: 'INV_PAISA_QUANTIZATION: 1,450,000 paisa integer normalized', status: 'PASS' },
    { code: '0x8F04', msg: 'INV_MDR_DRIFT_GATE: Max 50 bps tolerance armed', status: 'ARMED' },
    { code: '0x8F09', msg: 'INV_16D_HILBERT_TENSORS: Multi-rail vector convergence', status: 'SYNC' },
    { code: '0x8F12', msg: 'INV_BANK_CMS_CHECKSUM: 16-digit UTR resolver active', status: 'ARMED' },
    { code: '0x8F24', msg: 'INV_TALLY_ERP_LEDGER: Section 194-O TDS invariant verified', status: 'PASS' },
    { code: '0x8F38', msg: 'INV_ZK_STARK_SOLVENCY: Zero-knowledge variance proof verified', status: 'CLEARED' },
    { code: '0x8F45', msg: 'INV_0_JITTER_STATE_MESH: SQLite WAL shared-memory ring active', status: 'LOCKED' },
    { code: '0x8F55', msg: 'DOUBLE_LOCK_CONSENSUS: 55/55 Invariant Rules Verified', status: 'READY' },
  ];

  // 1. Quantum Canvas Particle Singularity Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool: 450 photons
    const particleCount = 450;
    const particles = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (Math.min(width, height) * 0.45) + 60;
      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        originAngle: angle,
        radius: radius,
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        radialSpeed: Math.random() * 0.8 + 0.4,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? '#E8384F' : '#6366F1',
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    let animationFrameId;
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw subtle orbital rings
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(232, 56, 79, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(cx, cy, 220, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Render & update spiral particle physics
      particles.forEach((p) => {
        p.originAngle += p.speed;
        p.radius -= p.radialSpeed * 0.5;

        // Reset if collapsed into center
        if (p.radius < 30) {
          p.radius = Math.random() * (Math.min(width, height) * 0.45) + 120;
          p.originAngle = Math.random() * Math.PI * 2;
        }

        p.x = cx + Math.cos(p.originAngle) * p.radius;
        p.y = cy + Math.sin(p.originAngle) * p.radius;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (p.radius / 250);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Synthesizer & Progress Calibration Loop
  useEffect(() => {
    // Start pure Web Audio frequency ramp (220Hz -> 880Hz)
    try {
      soundManager.playBootSweep(2.2);
    } catch (_) {}

    // Progress counter with exponential acceleration
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 6;
        return Math.min(100, prev + step);
      });
    }, 60);

    // Rapid compiler log cascade
    const logInterval = setInterval(() => {
      setActiveLogIndex((prev) => (prev < COMPILER_LOGS.length - 1 ? prev + 1 : prev));
    }, 280);

    // Shockwave Detonation at 2.4s
    const exitTimer = setTimeout(() => {
      setIsDetonating(true);
      try {
        soundManager.playShockwaveBoom();
        soundManager.playMatchChime();
      } catch (_) {}
      setTimeout(() => {
        onBootComplete();
      }, 550);
    }, 2400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearTimeout(exitTimer);
    };
  }, [onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-[#FAFAF9] text-slate-900 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden transition-all duration-600 ${
        isDetonating ? 'scale-110 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
      }`}
    >
      {/* 🌌 Quantum Particle Canvas Backdrop */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Cybernetic High-Tech Grid Overlays */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #0F172A 1px, transparent 1px),
                            linear-gradient(to bottom, #0F172A 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top HUD Telemetry Bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-mono border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8384F] breathing-dot" />
          <span className="font-bold text-slate-900 tracking-wider">CERTUS SINGULARITY KERNEL v2.4</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-slate-500">
          <span>LATENCY: <strong className="text-emerald-700 font-mono">0.00ms</strong></span>
          <span>AIR-GAP: <strong className="text-[#E8384F] font-mono">ENFORCED (WAL)</strong></span>
          <span>RAILS: <strong className="text-indigo-600 font-mono">3 / 3 CONNECTED</strong></span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#E8384F] font-bold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8384F] animate-ping" />
          <span>INITIALIZING CONSENSUS</span>
        </div>
      </div>

      {/* 🏛️ Center Vortex: Monumental 3D Monogram & Holographic Laser Rings */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-6 text-center max-w-lg mx-auto w-full">
        {/* Holographic Center Stage */}
        <div className="relative flex items-center justify-center">
          {/* Animated Orbital Laser Rings */}
          <div className="absolute w-48 h-48 rounded-full border border-rose-500/25 animate-spin duration-3000" />
          <div className="absolute w-60 h-60 rounded-full border border-indigo-500/20 animate-ping duration-2000" />
          <div className="absolute w-36 h-36 rounded-full border border-rose-500/40 animate-pulse" />

          {/* Central Glass Monogram Vessel */}
          <div className="relative z-10 p-7 rounded-3xl bg-white/95 border border-slate-200 shadow-2xl shadow-rose-500/15 backdrop-blur-xl">
            <CertusLogo className="w-16 h-16" showText={false} />
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight leading-none">
            CERTUS <span className="text-[#E8384F]">SOVEREIGN</span>
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1.5 uppercase tracking-widest font-semibold">
            Autonomous Multi-Rail Financial Controller
          </p>
        </div>

        {/* Live Progress Bar & Rolling Percentage */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-700">
              {COMPILER_LOGS[activeLogIndex]?.msg.split(':')[0]}
            </span>
            <span className="font-mono font-bold text-base text-[#E8384F]">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#E8384F] via-[#FF2E4D] to-[#9F1239] rounded-full transition-all duration-100 shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Live Hexadecimal Compiler Stream Log Card */}
        <div className="w-full p-3 rounded-2xl bg-white/90 border border-slate-200/90 shadow-md text-left flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 overflow-hidden">
            <Terminal className="w-3.5 h-3.5 text-[#E8384F] shrink-0" />
            <span className="text-slate-400 font-bold">{COMPILER_LOGS[activeLogIndex]?.code}</span>
            <span className="text-slate-800 font-medium truncate">
              {COMPILER_LOGS[activeLogIndex]?.msg}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px] shrink-0">
            {COMPILER_LOGS[activeLogIndex]?.status}
          </span>
        </div>
      </div>

      {/* Bottom Legal / Author Footnote */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-200/80 pt-4">
        <span>Razorpay AI Buildathon 2026 — Track 4</span>
        <span>Lead Architect: <strong className="text-slate-800">Aditya Singh</strong></span>
      </div>
    </div>
  );
}
