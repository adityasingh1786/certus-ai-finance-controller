import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Github,
  Cpu,
  ShieldCheck,
  Globe,
  Brain,
  Bot,
  ExternalLink,
  Code2,
  GraduationCap,
  Lock,
  Activity,
  Zap,
  Fingerprint,
  Layers,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { soundManager } from '../lib/soundFx';

export default function AboutDeveloperSection() {
  const [hoveredInnovation, setHoveredInnovation] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const playClick = () => {
    try {
      soundManager.playClick();
    } catch (_) {}
  };

  const INNOVATIONS = [
    {
      id: 'hilbert',
      title: '16-D Hilbert Space Tensors',
      tag: 'CONTINUOUS ALGEBRA',
      icon: Cpu,
      color: 'rose',
      borderClass: 'hover:border-rose-400/80 hover:shadow-rose-500/15',
      glowColor: 'rgba(232, 56, 79, 0.12)',
      desc: 'Maps multi-rail financial transactions into continuous geometric vectors for sub-millisecond convergence proofs.',
    },
    {
      id: 'zk',
      title: 'ZK-STARK Solvency Proofs',
      tag: 'ZERO-KNOWLEDGE',
      icon: Lock,
      color: 'indigo',
      borderClass: 'hover:border-indigo-400/80 hover:shadow-indigo-500/15',
      glowColor: 'rgba(99, 102, 241, 0.12)',
      desc: 'Generates non-interactive polynomial receipts proving zero ledger variance without leaking private merchant payloads.',
    },
    {
      id: 'mesh',
      title: '0.00ms Jitter State Mesh',
      tag: 'REAL-TIME KERNEL',
      icon: Activity,
      color: 'emerald',
      borderClass: 'hover:border-emerald-400/80 hover:shadow-emerald-500/15',
      glowColor: 'rgba(16, 185, 129, 0.12)',
      desc: 'Central runtime state machine over SQLite WAL synchronizing all 5 operational hubs with zero temporal drift.',
    },
    {
      id: 'gates',
      title: 'Double-Lock Invariant Gates',
      tag: '55 FORMAL RULES',
      icon: ShieldCheck,
      color: 'amber',
      borderClass: 'hover:border-amber-400/80 hover:shadow-amber-500/15',
      glowColor: 'rgba(245, 158, 11, 0.12)',
      desc: 'Enforces 55 mathematical compiler-level rules (exact paisa quantization, Section 194-O TDS, RBI cutoffs).',
    },
  ];

  const MILESTONES = [
    {
      title: 'Digital Web App',
      date: 'Nov 2025',
      icon: Globe,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      desc: 'Engineered a customized, fully mobile-responsive digital birthday web application.',
    },
    {
      title: 'Alzheimer’s ML Framework',
      date: 'Jan – Apr 2026',
      icon: Brain,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      desc: 'Deep learning early-detection ML pipeline correlating neuroimaging (MRI/PET) and speech data.',
    },
    {
      title: 'Sterling AI Portal & Automation',
      date: 'May 2026',
      icon: Bot,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      desc: 'Full-stack recruitment platform featuring a 3D avatar, real-time voice AI, and enterprise RAG pipelines.',
    },
  ];

  return (
    <section
      id="about-developer"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#FAFAF9] via-white to-[#FAFAF9] border-t border-slate-200/80"
    >
      {/* 🌌 Dynamic Ambient Mesh Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-rose-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Section Heading Badge */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-xs backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-[#E8384F]" />
            <span className="text-[11px] font-mono font-bold text-slate-800 tracking-wider uppercase">
              Lead Architect & Full-Stack AI Engineer
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Engineered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8384F] via-rose-600 to-indigo-600">Aditya Singh</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
            3rd Year B.Tech in CSE (AI & ML) at Sharda University. Sole architect and systems engineer behind the Certus AI Finance Controller.
          </p>
        </div>

        {/* 🪞 3D Holographic Master Bento Studio */}
        <div className="relative bg-white/75 backdrop-blur-3xl border border-white/90 rounded-[36px] p-6 sm:p-10 shadow-2xl shadow-slate-900/5 overflow-hidden transition-all duration-300">
          
          {/* Dynamic Specular Mouse Refraction Spotlight */}
          <div
            className="absolute -inset-px pointer-events-none rounded-[36px] opacity-60 transition-opacity duration-300"
            style={{
              background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(232, 56, 79, 0.08), rgba(99, 102, 241, 0.04), transparent 60%)`,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
            
            {/* =========================================================================
                LEFT COLUMN: 3D Optical Glass Prism Avatar Chamber (4 Cols)
               ========================================================================= */}
            <div className="lg:col-span-4 flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-900 via-[#10121A] to-slate-950 text-white shadow-xl relative overflow-hidden group">
              
              {/* Prismatic Lighting Aura */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#E8384F]/30 via-indigo-500/20 to-transparent rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Status Header Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  CORE NODE #001
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  19 YRS · ARCHITECT
                </span>
              </div>

              {/* 3D Photo Vessel Frame */}
              <div className="relative z-10 my-6 flex flex-col items-center">
                <div className="relative w-48 h-64 sm:w-52 sm:h-72 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-800 group-hover:border-rose-500/40 transition-colors duration-500">
                  <img
                    src="/aditya-singh.png"
                    alt="Aditya Singh"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Glass bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Name Overlay */}
                  <div className="absolute bottom-3 inset-x-3 text-left">
                    <p className="text-sm font-display font-bold text-white tracking-tight">
                      Aditya Singh
                    </p>
                    <p className="text-[10px] font-mono text-rose-300">
                      Sole Lead AI Systems Architect
                    </p>
                  </div>
                </div>
              </div>

              {/* University & Identity Tag Footer */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-sans">
                  <GraduationCap className="w-4 h-4 text-[#E8384F]" />
                  <span>Sharda University</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  B.Tech CSE (AI/ML)
                </span>
              </div>

            </div>

            {/* =========================================================================
                RIGHT COLUMN: 3D Kinetic Bento Matrix & Innovations (8 Cols)
               ========================================================================= */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              
              {/* Dynamic Identity & Vision Bar */}
              <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-2 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E8384F] animate-pulse" />
                    <h3 className="text-sm font-display font-bold text-slate-900 uppercase tracking-wide">
                      Architectural Vision & System Philosophy
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-semibold">
                    100% Deterministic Financial OS
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Built the <strong>Certus AI Finance Controller</strong> to replace fragile batch reconciliation with continuous mathematical certainty. By unifying 16-D Hilbert Space tensor convergence, zero-knowledge STARK proofs, and a 0.00ms state mesh, Certus makes financial discrepancy mathematically impossible.
                </p>
              </div>

              {/* 🔬 4 Core Architectural Innovations (2x2 3D Grid) */}
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#E8384F]" />
                    4 Core Sovereign Innovations in Certus
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    ALL 4 SYSTEMS OPERATIONAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INNOVATIONS.map((item) => {
                    const Icon = item.icon;
                    const isHovered = hoveredInnovation === item.id;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredInnovation(item.id)}
                        onMouseLeave={() => setHoveredInnovation(null)}
                        className={`p-4 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm transition-all duration-300 transform hover:-translate-y-1 ${item.borderClass}`}
                        style={{
                          background: isHovered
                            ? `linear-gradient(135deg, white 0%, ${item.glowColor} 100%)`
                            : 'white',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-${item.color}-50 text-[#E8384F]`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="text-xs font-display font-bold text-slate-900">
                              {item.title}
                            </h4>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 🚀 Production Projects Ticker (3 Cards) */}
              <div className="space-y-2 text-left">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  Other Engineered Production Projects
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MILESTONES.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.title}
                        className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-slate-700" />
                            <span className="text-[11px] font-display font-bold text-slate-900 truncate max-w-[120px]">
                              {m.title}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {m.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans leading-snug">
                          {m.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* =========================================================================
              BOTTOM ROW: "From the Architect's Desk" Manifesto & Cryptographic Seal
             ========================================================================= */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
            
            {/* Personal Manifesto Quote */}
            <div className="lg:col-span-8 p-4 rounded-2xl bg-gradient-to-r from-rose-50/60 via-slate-50/60 to-indigo-50/40 border border-rose-200/60">
              <p className="text-xs font-display italic text-slate-800 leading-relaxed">
                "True financial sovereignty isn't achieved by adding more layers of reconciliation; it is engineered by mapping capital into a mathematically deterministic geometry where discrepancies cannot physically exist."
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-200/40 text-[10px] font-mono text-slate-500">
                <span className="font-bold text-[#E8384F]">— Aditya Singh</span>
                <span className="flex items-center gap-1">
                  <Fingerprint className="w-3 h-3 text-indigo-500" />
                  SIGNATURE: <strong className="text-slate-700">0x7F38A...9E01</strong>
                </span>
              </div>
            </div>

            {/* Sovereign GitHub Connection Terminal Button */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-center gap-2">
              <a
                href="https://github.com/adityasingh1786/certus-ai-finance-controller"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="shimmer-btn px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-display font-bold shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Github className="w-4 h-4 text-white" />
                <span>Inspect GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500">
                <span>Direct Node:</span>
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
    </section>
  );
}
