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
  Award,
  BookOpen,
} from 'lucide-react';
import { soundManager } from '../lib/soundFx';
import MagneticButton from './MagneticButton';

export default function AboutDeveloperSection() {
  const [hoveredInnovation, setHoveredInnovation] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  const handleContainerMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Calculate 3D tilt angles
    const rotateX = -(y / (rect.height / 2)) * 10;
    const rotateY = (x / (rect.width / 2)) * 10;
    setCardTilt({ rotateX, rotateY });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0 });
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
      borderClass: 'hover:border-rose-400 hover:shadow-rose-500/10',
      glowColor: 'rgba(232, 56, 79, 0.12)',
      desc: 'Maps multi-rail financial transactions into continuous geometric vectors for sub-millisecond convergence proofs.',
    },
    {
      id: 'zk',
      title: 'ZK-STARK Solvency Proofs',
      tag: 'ZERO-KNOWLEDGE',
      icon: Lock,
      color: 'indigo',
      borderClass: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
      glowColor: 'rgba(99, 102, 241, 0.12)',
      desc: 'Generates non-interactive polynomial receipts proving zero ledger variance without leaking private merchant payloads.',
    },
    {
      id: 'mesh',
      title: '0.00ms Jitter State Mesh',
      tag: 'REAL-TIME KERNEL',
      icon: Activity,
      color: 'emerald',
      borderClass: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      glowColor: 'rgba(16, 185, 129, 0.12)',
      desc: 'Central runtime state machine over SQLite WAL synchronizing all 5 operational hubs with zero temporal drift.',
    },
    {
      id: 'gates',
      title: 'Double-Lock Invariant Gates',
      tag: '55 FORMAL RULES',
      icon: ShieldCheck,
      color: 'amber',
      borderClass: 'hover:border-amber-400 hover:shadow-amber-500/10',
      glowColor: 'rgba(245, 158, 11, 0.12)',
      desc: 'Enforces 55 mathematical compiler-level rules (exact paisa quantization, Section 194-O TDS, RBI cutoffs).',
    },
  ];

  const MILESTONES = [
    {
      title: 'Certus Sovereign Finance OS',
      date: 'Aug 2026',
      icon: ShieldCheck,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      desc: 'Engineered sovereign 3-way multi-rail reconciliation engine for Razorpay AI Buildathon 2026 Track 4.',
    },
    {
      title: 'Alzheimer’s ML Diagnostic Framework',
      date: 'Jan – Apr 2026',
      icon: Brain,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      desc: 'Deep learning early-detection ML pipeline correlating neuroimaging (MRI/PET) and speech features.',
    },
    {
      title: 'B.Tech in Computer Science & Engineering',
      date: '2023 – 2027',
      icon: GraduationCap,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      desc: 'Specializing in Distributed Systems, Mathematical Invariants, and Autonomous AI Agent architectures.',
    },
  ];

  return (
    <section
      id="about-developer"
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className="relative w-full py-16 sm:py-24 bg-white border-t border-slate-200/80 overflow-hidden"
    >
      {/* Interactive Cursor Spotlight Beam */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-60"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(232, 56, 79, 0.05), transparent 80%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E8384F]" />
            <span className="text-xs font-mono font-semibold text-[#E8384F] uppercase tracking-wider">
              LEAD SYSTEM ARCHITECT
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
            Engineered by <span className="text-[#E8384F]">Aditya Singh</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-sans">
            Full-Stack AI Systems Engineer & Mathematical Invariant Architect.
          </p>
        </div>

        {/* Top Split Layout: 3D Tilt Persona Card + Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* 3D Tilt Persona Card */}
          <div className="lg:col-span-5 flex justify-center perspective-[1000px]">
            <div
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                transition: cardTilt.rotateX === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
                transformStyle: 'preserve-3d',
              }}
              className="luxury-glass-card w-full max-w-md rounded-2xl p-6 sm:p-8 bg-white border border-slate-200/90 relative group shadow-xl shadow-slate-200/50"
            >
              {/* Ambient Ruby Halo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-gradient-to-br from-[#E8384F] to-[#9F1239] flex items-center justify-center text-white text-2xl font-display font-bold">
                    AS
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                      Aditya Singh
                    </h3>
                    <p className="text-xs font-mono text-[#E8384F] font-semibold">
                      Full-Stack AI & Distributed Systems
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-mono text-slate-500">
                        Razorpay AI Buildathon 2026
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core Architectural Pillars */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 font-medium">Reconciliation Engine</span>
                    <span className="font-bold text-slate-900">Hybrid Multi-Signal</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 font-medium">Mathematical Invariants</span>
                    <span className="font-bold text-[#E8384F]">55 Formal Rules</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 font-medium">Deterministic Isolation</span>
                    <span className="font-bold text-emerald-700">Fail-Closed</span>
                  </div>
                </div>

                {/* Magnetic Social Links */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                  <MagneticButton
                    onClick={() => {
                      playClick();
                      window.open('https://github.com/adityasingh1786', '_blank');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-[#E8384F] transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    GitHub Profile
                  </MagneticButton>

                  <MagneticButton
                    onClick={() => {
                      playClick();
                      window.open('https://github.com/adityasingh1786/certus-ai-finance-controller', '_blank');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-200/80 flex items-center justify-center gap-1.5"
                  >
                    <Code2 className="w-4 h-4" />
                    Repo
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Philosophy & Story */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="luxury-glass-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200/90 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Fingerprint className="w-5 h-5 text-[#E8384F]" />
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                    ARCHITECTURAL PHILOSOPHY
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight leading-snug">
                  "Provable Reliability at the Boundary — Never Trust a Hallucinated Number."
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
                  Most financial AI demos are simple chatbots connected to CSV parsers that silently guess values when numbers disagree.
                </p>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
                  <strong>Certus</strong> is built from the ground up on the principle of <em>strict mathematical invariants</em>. The probabilistic intelligence of LLMs is strictly restricted to read-only forensic analysis, while deterministic double-lock gates enforce integer paisa precision across Razorpay, Bank CMS, and ERP General Ledgers.
                </p>
              </div>

              {/* Badges Cluster */}
              <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-slate-100">
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                  ⚡ Python 3.11 / FastAPI
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                  ⚛️ React 18 / Vite / Tailwind
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                  🔄 GSAP / Lenis / Three.js
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                  🛡️ SQLite WAL Air-Gap
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Innovations Grid: 4 Core Engines */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              Four Core Invariant Innovations
            </h3>
            <span className="text-xs font-mono text-[#E8384F] font-semibold">
              HOVER TO INSPECT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INNOVATIONS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => {
                    setHoveredInnovation(item.id);
                    playClick();
                  }}
                  onMouseLeave={() => setHoveredInnovation(null)}
                  className={`luxury-glass-card rounded-2xl p-6 bg-white border border-slate-200/90 transition-all duration-300 relative group cursor-pointer ${item.borderClass}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E8384F] flex items-center justify-center border border-rose-100 shadow-xs group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>

                  <h4 className="text-base font-display font-bold text-slate-900 tracking-tight group-hover:text-[#E8384F] transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="luxury-glass-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200/90">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-[#E8384F]" />
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight">
              Engineering Trajectory & Milestones
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MILESTONES.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${m.color}`}>
                      {m.date}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-display font-bold text-slate-900">
                    {m.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
