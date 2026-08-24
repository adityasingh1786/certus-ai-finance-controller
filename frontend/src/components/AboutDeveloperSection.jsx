import React from 'react';
import {
  Github,
  Globe,
  Brain,
  Bot,
  ExternalLink,
  Code2,
  GraduationCap,
  Cpu,
  Lock,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export default function AboutDeveloperSection() {
  return (
    <section
      id="about-developer"
      className="w-full py-20 px-6 bg-gradient-to-b from-[#FAFAF9] to-white border-t border-slate-200/60"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Subtle Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono font-medium">
            <Code2 className="w-3.5 h-3.5 text-[#E8384F]" />
            <span>Project Architect</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 tracking-tight">
            About the Developer
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto font-sans">
            Created and engineered by Aditya Singh — student, builder, and AI software engineer.
          </p>
        </div>

        {/* Clean, Subtle Glassmorphic Profile Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Photo Column */}
            <div className="md:col-span-4 flex flex-col items-center sticky top-24">
              <div className="w-44 h-60 sm:w-48 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative group">
                <img
                  src="/aditya-singh.png"
                  alt="Aditya Singh"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-sm font-display font-bold text-slate-900">
                  Aditya Singh
                </h3>
                <p className="text-xs text-slate-500 font-sans flex items-center justify-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#E8384F]" />
                  Sharda University
                </p>
              </div>
            </div>

            {/* Information Column */}
            <div className="md:col-span-8 space-y-6 text-left">
              
              {/* Bio Summary */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-[#E8384F] border border-rose-200 text-xs font-mono font-semibold">
                    19 Years Old
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono">
                    3rd Year B.Tech CSE (AI & ML)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1">
                  Hi, I am Aditya. I built the <strong>Certus AI Finance Controller</strong> to tackle complex financial reconciliation challenges by combining multi-rail data normalization, continuous high-dimensional tensor matching, double-lock verification invariants, and intuitive autonomous copilot agents.
                </p>
              </div>

              {/* 4 Core Architectural Innovations in Certus */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  Core Engineering Innovations in Certus
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Innovation 1 */}
                  <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#E8384F]">
                      <Cpu className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-display font-bold text-slate-900">
                        16-D Hilbert Space Tensors
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Maps multi-rail financial transactions into continuous geometric vectors for sub-millisecond convergence proofs.
                    </p>
                  </div>

                  {/* Innovation 2 */}
                  <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-600">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-display font-bold text-slate-900">
                        ZK-STARK Solvency Proofs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Generates non-interactive polynomial receipts proving zero ledger variance without leaking private merchant data.
                    </p>
                  </div>

                  {/* Innovation 3 */}
                  <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <Activity className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-display font-bold text-slate-900">
                        Zero-Delay State Mesh (0.0ms)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Central runtime state machine over SQLite WAL synchronizing all 5 operational hubs in real-time.
                    </p>
                  </div>

                  {/* Innovation 4 */}
                  <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-display font-bold text-slate-900">
                        Double-Lock Invariant Gates
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Enforces 55 mathematical compiler-level rules (exact paisa quantization, Section 194-O TDS, RBI cutoffs).
                    </p>
                  </div>

                </div>
              </div>

              {/* Projects & Production Milestones */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  Other Work & Projects
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Item 1 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-display font-bold text-slate-900">Digital Web App</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block">Nov 2025</span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Customized mobile-responsive digital birthday web application.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-600">
                      <Brain className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-display font-bold text-slate-900">Alzheimer's ML</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block">Jan – Apr 2026</span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Early detection pipeline correlating neuroimaging & speech data.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <Bot className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-display font-bold text-slate-900">Sterling AI Portal</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block">May 2026</span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      3D avatar voice interview portal & enterprise automation.
                    </p>
                  </div>

                </div>
              </div>

              {/* GitHub Link */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <a
                  href="https://github.com/adityasingh1786/certus-ai-finance-controller"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#E8384F] transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>View Project on GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href="https://github.com/adityasingh1786"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
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
