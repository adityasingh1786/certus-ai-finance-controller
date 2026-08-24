import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Github,
  Cpu,
  ShieldCheck,
  Award,
  Layers,
  Code2,
  ExternalLink,
  Flame,
  Dumbbell,
  Compass,
  CheckCircle2,
  Lock,
  Binary,
  Radio,
} from 'lucide-react';
import { soundManager } from '../lib/soundFx';

export default function AboutDeveloperSection() {
  const [activeMode, setActiveMode] = useState('dossier'); // 'dossier' | 'radar'
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 4; // Max 4 deg
    const rotateX = -((y - centerY) / centerY) * 4; // Max 4 deg

    setTilt({ rotateX, rotateY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
  };

  const handleModeChange = (mode) => {
    try { soundManager.playClick(); } catch (_) {}
    setActiveMode(mode);
  };

  return (
    <section
      id="about-developer"
      className="w-full py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#FAFAF9] via-white to-[#FAFAF9]"
    >
      {/* 🌌 Dynamic Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Section Heading Badge */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E8384F]" />
            <span className="text-[11px] font-mono font-bold text-[#E8384F] tracking-wide uppercase">
              Lead Architect & Sovereign Engineer
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 tracking-tight">
            Engineered by <span className="text-[#E8384F]">Aditya Singh</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            A 19-year-old AI prodigy and systems architect engineering the future of autonomous financial sovereignty through high-dimensional mathematics and deterministic cryptographic proofs.
          </p>
        </div>

        {/* Dual-Mode Toggle Bar */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl backdrop-blur-md shadow-xs">
            <button
              onClick={() => handleModeChange('dossier')}
              className={`px-5 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                activeMode === 'dossier'
                  ? 'bg-white text-[#E8384F] shadow-sm border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Executive Dossier & Bio
            </button>
            <button
              onClick={() => handleModeChange('radar')}
              className={`px-5 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                activeMode === 'radar'
                  ? 'bg-white text-[#E8384F] shadow-sm border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deep-Tech Architecture Radar
            </button>
          </div>
        </div>

        {/* 🪞 Master 3D Slanted Holographic Card Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: tilt.isHovered
              ? `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
              : 'perspective(1200px) rotateX(0deg) rotateY(0deg)',
            transition: tilt.isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
          }}
          className="relative bg-white/80 backdrop-blur-2xl border border-slate-200/80 rounded-[32px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-all"
        >
          {/* Subtle Top Specular Sheen */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8384F]/40 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            
            {/* =========================================================================
                LEFT COLUMN: Slanted Photo Hero Shield (5 cols)
               ========================================================================= */}
            <div className="lg:col-span-5 relative flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900 via-[#111319] to-slate-950 text-white overflow-hidden group">
              
              {/* Dynamic Laser Seam Track Beam */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-rose-500/20 to-transparent transform skew-x-[-12deg]" />
              </div>

              {/* Developer Photo with Soft Volumetric Glow */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-6 my-auto">
                <div className="relative">
                  {/* Glowing Animated Outer Aura */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-[#E8384F] via-indigo-500 to-rose-400 rounded-3xl blur-md opacity-60 group-hover:opacity-90 transition duration-500 animate-pulse" />
                  
                  {/* Photo Container Frame */}
                  <div className="relative w-52 h-72 sm:w-60 sm:h-80 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800">
                    <img
                      src="/aditya-singh.png"
                      alt="Aditya Singh - Lead Architect"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Glass gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Name Tag on Photo Bottom */}
                    <div className="absolute bottom-3 inset-x-3 text-left">
                      <p className="text-xs font-display font-bold text-white tracking-tight">
                        Aditya Singh
                      </p>
                      <p className="text-[10px] font-mono text-rose-300">
                        Lead AI Architect (19 Yrs)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Grounding Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-white/10 border border-white/15 text-slate-200 backdrop-blur-md">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Guerrilla 450
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-white/10 border border-white/15 text-slate-200 backdrop-blur-md">
                    <Dumbbell className="w-3 h-3 text-rose-400" />
                    Heavy Strength Training
                  </span>
                </div>
              </div>

              {/* Verified Node Status Footer */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE & BUILDING
                </span>
                <span className="text-slate-400">CORE NODE #001</span>
              </div>
            </div>

            {/* =========================================================================
                RIGHT COLUMN: Translucent Frosted Glass Dossier (7 cols)
               ========================================================================= */}
            <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-white/60 backdrop-blur-2xl">
              
              {activeMode === 'dossier' ? (
                /* =====================================================================
                   MODE A: Executive Biometric Dossier & Narrative
                   ===================================================================== */
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Quick-Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Academic Base</span>
                      <p className="text-xs font-display font-bold text-slate-900">
                        Sharda University
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        3rd Year B.Tech CSE (AI/ML)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Engineering Role</span>
                      <p className="text-xs font-display font-bold text-slate-900">
                        Sole Lead Architect
                      </p>
                      <p className="text-[10px] text-[#E8384F] font-mono font-semibold">
                        Certus OS Creator
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Hackathons & Research</span>
                      <p className="text-xs font-display font-bold text-slate-900">
                        SIH 2025 Innovator
                      </p>
                      <p className="text-[10px] text-indigo-600 font-mono font-semibold">
                        Multimodal AI Models
                      </p>
                    </div>
                  </div>

                  {/* Vision Narrative */}
                  <div className="space-y-3 text-left">
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#E8384F]" />
                      The Vision & Engineering Feat
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      To solve multi-billion dollar reconciliation leakage, Aditya abandoned legacy tabular computing and rebuilt capital flow from first principles. Certus AI Finance Controller is not merely an application; it is a sovereign financial singularity. By mapping financial state transitions into a continuous mathematical geometry, Aditya treated capital flow not as discrete ledger rows, but as continuous functions within a high-dimensional tensor space. This fundamentally shifts financial reconciliation from a post-execution auditing chore into a real-time, mathematically deterministic certainty.
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      Balancing academic rigor with elite-level system design, Aditya built Certus from the ground up using FastAPI, PyTorch, and React. His deep-stack experience—ranging from building predictive NASA software defect detection models to engineering campus-wide smart traffic architectures—directly informed the absolute resilience of the Certus operating system.
                    </p>
                  </div>

                  {/* Grounding & Recent Milestones Pills */}
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      Recent Milestones & Architectures
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-700 font-sans border border-slate-200">
                        Multimodal Alzheimer's Detection
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-700 font-sans border border-slate-200">
                        Smart India Hackathon (SIH) 2025
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-700 font-sans border border-slate-200">
                        Enterprise EV Infrastructure RAG
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-700 font-sans border border-slate-200">
                        NASA Software Defect Detection
                      </span>
                    </div>
                  </div>

                  {/* Personal Manifesto Quote */}
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 text-left">
                    <p className="text-xs font-display italic text-[#E8384F] leading-relaxed">
                      "True financial sovereignty isn't achieved by adding more layers of reconciliation; it is engineered by mapping capital into a mathematically deterministic geometry where discrepancies cannot physically exist."
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 text-right mt-1.5 font-bold">
                      — Aditya Singh, Architect
                    </p>
                  </div>
                </div>
              ) : (
                /* =====================================================================
                   MODE B: Deep-Tech Architecture Radar & 4 Core Pillars
                   ===================================================================== */
                <div className="space-y-5 animate-fadeIn text-left">
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <Binary className="w-4 h-4 text-[#E8384F]" />
                      4 Core Sovereign Architectural Pillars
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      Mathematical primitives formulated and coded by Aditya Singh
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Pillar 1 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2 text-[#E8384F]">
                        <Cpu className="w-4 h-4" />
                        <span className="text-xs font-display font-bold">16-D Hilbert Space Algebra</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        Maps complex reconciliation data into multi-dimensional geometric continuous tensors for instantaneous convergence.
                      </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-display font-bold">ZK-STARK Solvency Proofs</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        Implements advanced cryptographic polynomial receipts proving solvency without leaking private financial payloads.
                      </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Radio className="w-4 h-4" />
                        <span className="text-xs font-display font-bold">0.00ms Jitter State Mesh</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        Deterministic, sub-millisecond state transition engine over SQLite WAL that completely eliminates temporal drift.
                      </p>
                    </div>

                    {/* Pillar 4 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2 text-amber-600">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-display font-bold">Formal Invariant Gate Logic</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        Enforces 55 unbreakable programmatic constraints at the ingestion gate, making invalid ledger states impossible.
                      </p>
                    </div>
                  </div>

                  {/* Technology Constellation */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      Technology Radar & Native Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['FastAPI', 'PyTorch', 'React 18', 'TailwindCSS', 'SQLite WAL', 'ZK-STARKs', 'SIMD Vectorization', 'ISO 20022', '16-D Hilbert Space', 'Web Audio API'].map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-slate-200 border border-white/15">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons & Links Footer */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <a
                  href="https://github.com/adityasingh1786/certus-ai-finance-controller"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shimmer-btn px-4 py-2.5 rounded-xl bg-[#E8384F] hover:bg-[#d42d43] text-white text-xs font-bold font-display shadow-md shadow-rose-500/20 inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Github className="w-4 h-4" />
                  <span>Inspect GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span>GitHub:</span>
                  <a
                    href="https://github.com/adityasingh1786"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-900 hover:text-[#E8384F] transition-colors underline underline-offset-2"
                  >
                    @adityasingh1786
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
