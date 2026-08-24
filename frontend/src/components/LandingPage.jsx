import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Layers, Cpu, AlertOctagon, Terminal, ExternalLink, Code2 } from 'lucide-react';
import LandingHeroCard from './LandingHeroCard';

export default function LandingPage({ onOpenDashboard, onOpenArchitecture, onOpenSwagger }) {
  const pipelineStages = [
    {
      step: '01',
      title: 'Ingest & Boundary Filter',
      desc: 'Layer 1 Deterministic Rules check schema, currency whitelist, non-future dates, and net <= gross at zero LLM cost.',
      icon: Layers,
    },
    {
      step: '02',
      title: '3-Way Multi-Source Match',
      desc: 'Cross-checks Razorpay Gateway, Bank UTR statements, and ERP Invoices with RapidFuzz token sorting.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Confidence Gating',
      desc: 'Dual gate requires rule agreement and LLM confidence > 0.75 with Pydantic post-validation.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Quarantine & Audit Trail',
      desc: 'Anomalies isolated in human-in-the-loop queue without crashing the remaining 50+ batch records.',
      icon: AlertOctagon,
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col z-10 text-[#F7F5F2]">
      
      {/* 6.1 Fixed Nav (72px) */}
      <header className="fixed top-0 inset-x-0 h-[72px] glass-panel border-b border-white/10 z-40 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#E8384F]/10 border border-[#E8384F]/40 flex items-center justify-center text-[#E8384F]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-[#F7F5F2]">
            Certus
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#9A9AA5]">
            Track 04
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#9A9AA5]">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <button onClick={onOpenArchitecture} className="hover:text-white transition-colors">Architecture</button>
          <button onClick={onOpenSwagger} className="hover:text-white transition-colors">API Contract</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDashboard}
            className="btn-primary text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* 6.2 Hero Section */}
      <section className="pt-36 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-[#E8384F]/10 border border-[#E8384F]/30 text-[#E8384F] text-xs font-semibold tracking-wider uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8384F] animate-ping" />
            <span>AI Finance Controller — Track 04</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-[1.08] text-[#F7F5F2]">
            Every record gets a verdict, <span className="text-[#E8384F]">not a guess.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#9A9AA5] max-w-2xl leading-relaxed font-sans">
            An autonomous financial ops agent that ingests messy multi-source settlement data, executes 3-way reconciliation, delivers audited cash forecasts, and never silently trusts a bad number.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onOpenDashboard}
              className="btn-primary text-sm font-semibold flex items-center gap-2"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenArchitecture}
              className="btn-secondary text-sm font-semibold flex items-center gap-2"
            >
              <Code2 className="h-4 w-4 text-[#4FD1FF]" />
              <span>View Architecture Blueprint</span>
            </button>
          </div>
        </div>

        {/* Hero Card: Signature Motion */}
        <div className="lg:col-span-5 flex justify-center">
          <LandingHeroCard />
        </div>

      </section>

      {/* 6.4 Live Metrics Strip */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel p-5 text-center">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A9AA5] block mb-1">
              3-Way Match Rate
            </span>
            <span className="text-3xl font-mono font-semibold text-[#2FD97F]">76.7%</span>
          </div>

          <div className="glass-panel p-5 text-center">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A9AA5] block mb-1">
              Ingestion Throughput
            </span>
            <span className="text-3xl font-mono font-semibold text-[#4FD1FF]">412.5 <span className="text-sm">rec/s</span></span>
          </div>

          <div className="glass-panel p-5 text-center">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A9AA5] block mb-1">
              Synthetic Batch Size
            </span>
            <span className="text-3xl font-mono font-semibold text-[#F7F5F2]">60</span>
          </div>

          <div className="glass-panel p-5 text-center">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A9AA5] block mb-1">
              Anomalies Isolated
            </span>
            <span className="text-3xl font-mono font-semibold text-[#E8384F]">14 / 14</span>
          </div>
        </div>
      </section>

      {/* 6.3 How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E8384F]">Deterministic Rules + Bounded AI</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-[#F7F5F2]">The 4-Stage Reconciliation Pipeline</h2>
          <p className="text-sm text-[#9A9AA5] max-w-xl mx-auto">
            Zero hallucinated figures. Every decision is attributable to an explicit Layer 1 rule or verified LLM schema extraction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={idx} className="glass-panel-interactive p-6 rounded-2xl space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#4FD1FF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-mono font-bold text-white/15">{stage.step}</span>
                </div>
                <h3 className="text-base font-bold font-display text-white">{stage.title}</h3>
                <p className="text-xs text-[#9A9AA5] leading-relaxed">{stage.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6.5 Footer */}
      <footer className="mt-auto border-t border-white/5 py-8 px-6 lg:px-12 text-center text-xs text-[#5C5C68] space-y-2">
        <p>Certus — Built for Razorpay AI Buildathon 2026 (Track 04)</p>
        <p className="font-mono text-[11px]">Strictly Read-Only Tools • 100% Provenance Audit Trail • Zero Hallucination Guarantee</p>
      </footer>

    </div>
  );
}
