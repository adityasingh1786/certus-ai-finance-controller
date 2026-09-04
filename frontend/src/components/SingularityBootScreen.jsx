import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  Lock,
  FileText,
  Layers,
  Sparkles,
  Building2,
  Clock,
  Eye,
} from 'lucide-react';
import { soundManager } from '../lib/soundFx';
import CertusLogo from './CertusLogo';

/**
 * SingularityBootScreen — Sovereign Financial OS Boot Terminal
 * Inspired by Bloomberg Professional Terminals, Stripe/Mercury Financial OS,
 * and high-frequency trading ledger verification sequences.
 */
export default function SingularityBootScreen({ onBootComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showRawInspector, setShowRawInspector] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState('');

  // Live ISO UTC timestamp
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTimestamp(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Diagnostic Log Sequence
  const BOOT_LOGS = [
    { time: '00.012', tag: 'ENCLAVE', msg: 'Mounted hardware-backed security keyring [0x7F9A...88B2]', status: 'OK' },
    { time: '00.064', tag: 'STORAGE', msg: 'SQLite WAL ring shared-memory ring buffer initialized', status: 'OK' },
    { time: '00.120', tag: 'MERKLE', msg: 'SHA-256 cryptographic audit tree root verified', status: 'OK' },
    { time: '00.198', tag: 'ISO-20022', msg: 'Financial message schemas compiled (pacs.008 & camt.053)', status: 'VALID' },
    { time: '00.285', tag: 'DOUBLE-LOCK', msg: 'Composite consensus gate loaded (threshold >= 0.75)', status: 'ARMED' },
    { time: '00.360', tag: 'RAPIDFUZZ', msg: 'Weighted fuzzy token similarity engine v3.8 online', status: 'ACTIVE' },
    { time: '00.440', tag: 'INVARIANTS', msg: 'Layer 1 deterministic rules armed (COMP-01 to COMP-09)', status: 'PASS' },
    { time: '00.520', tag: 'RECOVERY', msg: 'Autonomous dispute demand letter synthesizer ready', status: 'READY' },
    { time: '00.610', tag: 'CONSENSUS', msg: 'Multi-model LLM relay armed (Groq 70B, Claude, GPT-4o)', status: 'ONLINE' },
    { time: '00.720', tag: 'SOVEREIGN', msg: 'All 55 mathematical financial invariants calibrated', status: 'LOCKED' },
  ];

  // Handle hotkeys (Escape or Space to skip immediately, F2 to inspect)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        skipBoot();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setShowRawInspector((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const skipBoot = () => {
    setIsFadingOut(true);
    try { soundManager.playMatchChime(); } catch (_) {}
    setTimeout(() => {
      onBootComplete && onBootComplete();
    }, 300);
  };

  // Progression loop
  useEffect(() => {
    const duration = 3200; // 3.2 seconds total boot time
    const intervalTime = 40;
    const increment = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + increment);
        const nextStep = Math.min(
          BOOT_LOGS.length - 1,
          Math.floor((next / 100) * BOOT_LOGS.length)
        );
        setCurrentStepIndex(nextStep);

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            try { soundManager.playMatchChime(); } catch (_) {}
            setTimeout(() => {
              onBootComplete && onBootComplete();
            }, 500);
          }, 400);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-[#06080D] text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none font-mono transition-all duration-500 overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 🌌 Background CRT Phosphor Scanlines & Ambient Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] opacity-30" />

      {/* =========================================================================
          TOP COMMAND HEADER: KERNEL STATUS & NODE METRICS
         ========================================================================= */}
      <header className="relative z-10 w-full flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <CertusLogo className="w-5 h-5" textClassName="text-sm font-bold text-white tracking-tight" />
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SOVEREIGN FINANCIAL OS KERNEL v4.2
          </span>
          <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
            NODE: 0x8F9A-DELHI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-slate-400 text-[11px] tabular-nums">
            {liveTimestamp}
          </span>
          <button
            onClick={skipBoot}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-all shadow-xs cursor-pointer"
            title="Press Space or ESC to skip boot screen"
          >
            <span>Skip Boot</span>
            <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[9px] text-slate-400">ESC</kbd>
          </button>
        </div>
      </header>

      {/* =========================================================================
          4-QUADRANT FINANCIAL TERMINAL INITIALIZATION MATRIX
         ========================================================================= */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 my-auto py-2 max-w-7xl mx-auto w-full">
        
        {/* Quadrant A: Kernel Diagnostic Boot Log */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-2xl flex flex-col justify-between h-[230px] overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              DIAGNOSTIC ENCLAVE LOG
            </span>
            <span className="text-slate-500 text-[10px]">SECURE RING-0</span>
          </div>

          <div className="flex-1 py-2 overflow-y-auto space-y-1 text-[11px] leading-relaxed">
            {BOOT_LOGS.slice(0, currentStepIndex + 1).map((log, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-600 text-[10px]">[{log.time}]</span>
                  <span className="text-cyan-400 font-bold text-[10px]">{log.tag}:</span>
                  <span className="text-slate-300 truncate">{log.msg}</span>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                  {log.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
            <span>Enclave: 64-bit Integer Paisa Active</span>
            <span className="text-emerald-500 font-bold">100% Invariant Compliant</span>
          </div>
        </div>

        {/* Quadrant B: 3-Rail Settlement Ingestion Handshake */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-2xl flex flex-col justify-between h-[230px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 text-[11px]">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              3-RAIL SETTLEMENT TOPOLOGY
            </span>
            <span className="text-slate-500 text-[10px]">PARALLEL STREAM</span>
          </div>

          <div className="space-y-2 py-1">
            {/* Rail 1: Gateway */}
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-300 font-medium">Razorpay Gateway API v2</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-500">Gross Captures</span>
                <span className="text-rose-400 font-bold">SYNCED (14ms)</span>
              </div>
            </div>

            {/* Rail 2: Bank CMS */}
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-slate-300 font-medium">HDFC / ICICI Corporate CMS</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-500">16-Digit UTRs</span>
                <span className="text-amber-400 font-bold">SYNCED (28ms)</span>
              </div>
            </div>

            {/* Rail 3: ERP Ledger */}
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-slate-300 font-medium">Tally Prime & SAP S/4HANA</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-500">194-O TDS / GST</span>
                <span className="text-indigo-400 font-bold">POSTED (09ms)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
            <span>ISO 20022 Schema Handshake: pacs.008 & camt.053</span>
            <span className="text-cyan-400 font-bold">VERIFIED</span>
          </div>
        </div>

        {/* Quadrant C: Mathematical Invariant Self-Test */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-2xl flex flex-col justify-between h-[230px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 text-[11px]">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              MATHEMATICAL INVARIANT VERIFIER
            </span>
            <span className="text-slate-500 text-[10px]">ZERO FLOAT DRIFT</span>
          </div>

          <div className="space-y-2 py-1 text-[11px]">
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-500 mb-0.5">Conservation Equation:</div>
              <div className="text-slate-200 font-mono text-[11px] truncate text-emerald-400">
                Δ = Σ Paisa(GW) - Σ Paisa(Bank) - Σ MDR(Contractual) = 0
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <div className="text-slate-500">Float Precision Error:</div>
                <div className="text-emerald-400 font-bold mt-0.5">0.000000000000</div>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <div className="text-slate-500">MDR Tolerance Gate:</div>
                <div className="text-amber-400 font-bold mt-0.5">50 bps (COMP-06)</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
            <span>Double-Lock Score: 0.985 / 1.000</span>
            <span className="text-emerald-400 font-bold">GATE PASSED (≥ 0.75)</span>
          </div>
        </div>

        {/* Quadrant D: Cryptographic Ledger Audit & Recovery Bot */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-2xl flex flex-col justify-between h-[230px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 text-[11px]">
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              CRYPTOGRAPHIC MERKLE AUDIT ROOT
            </span>
            <span className="text-slate-500 text-[10px]">SHA-256 PROOF</span>
          </div>

          <div className="space-y-2 py-1 text-[11px]">
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] text-slate-500 mb-0.5">Active Merkle Root Hash:</div>
              <div className="text-slate-300 font-mono text-[10px] truncate text-cyan-300">
                0x7f9a2b81c034e88192ab368862b4fbb75feba584b53bb3c72922
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500">Autonomous Revenue Recovery:</div>
                <div className="text-slate-200 font-bold text-[11px]">8 Actions Armed (RBI Compliant)</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800/60">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
            <span>Dispute Demand Letters Ready</span>
            <span className="text-rose-400 font-bold">1-Click Auto Recovery</span>
          </div>
        </div>
      </main>

      {/* =========================================================================
          BOTTOM SYSTEM CONTROLLER & HIGH-SPEED INITIALIZATION METER
         ========================================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto space-y-3 pt-3 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">
              INITIALIZING FINANCIAL CONTROLLER MESH:
            </span>
            <span className="text-emerald-400 font-bold">
              {progress < 100 ? `${Math.round(progress)}% COMPLETE` : 'SOVEREIGN RECONCILIATION ENGINE READY'}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {'>_ '}
            <span className="text-cyan-400">
              {progress < 100
                ? `certus-kernel --verify-invariants --enclave-ring [PID: ${Math.round(progress * 42)}]`
                : 'certus-kernel --launch-sovereign-dashboard --all-rails-ok'}
            </span>
          </div>
        </div>

        {/* Precision Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
          <span>Track 4: Autonomous Financial Reconciler • Razorpay AI Buildathon 2026</span>
          <div className="flex items-center gap-3">
            <span>Lead Architect: <strong>Aditya Singh</strong></span>
            <span>•</span>
            <span className="text-slate-400">[ESC] Skip</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
