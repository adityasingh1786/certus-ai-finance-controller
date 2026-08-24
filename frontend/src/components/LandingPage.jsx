import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Copy,
  Lock,
  Cpu,
  ShieldAlert,
  ArrowDown,
  ExternalLink,
  Zap,
  Activity,
  Code,
  Terminal,
} from 'lucide-react';
import ParticleCanvasBackground from './ParticleCanvasBackground';
import CertusLogo from './CertusLogo';
import { soundManager } from '../lib/soundFx';

export default function LandingPage({ onOpenAuth, onOpenArchitecture, onOpenSwagger }) {
  const [activeTab, setActiveTab] = useState('Matched');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    try { soundManager.playClick(); } catch (_) {}
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchClick = () => {
    try { soundManager.playClick(); } catch (_) {}
    if (onOpenAuth) onOpenAuth();
  };

  const handleArchClick = () => {
    try { soundManager.playClick(); } catch (_) {}
    if (onOpenArchitecture) onOpenArchitecture();
  };

  const handleSwaggerClick = () => {
    try { soundManager.playClick(); } catch (_) {}
    if (onOpenSwagger) onOpenSwagger();
  };

  // Section 4: 20 Enterprise Scenarios Catalog
  const ALL_SCENARIOS = [
    { id: 1, name: 'D2C Fashion Flash Sale', sector: 'E-Commerce', bank: 'HDFC CMS', erp: 'Tally Prime' },
    { id: 2, name: 'B2B SaaS Milestone Invoicing', sector: 'SaaS', bank: 'ICICI Bank', erp: 'NetSuite' },
    { id: 3, name: 'Quick Commerce 10-Min Delivery', sector: 'E-Commerce', bank: 'Axis Bank', erp: 'SAP S/4HANA' },
    { id: 4, name: 'NBFC Loan EMI Disbursals', sector: 'FinTech', bank: 'SBI Corporate', erp: 'Oracle GL' },
    { id: 5, name: 'Hospital TPA Insurance Co-Pay', sector: 'Healthcare', bank: 'Kotak Bank', erp: 'SAP ERP' },
    { id: 6, name: 'EdTech Subscription Platform', sector: 'SaaS', bank: 'HDFC Bank', erp: 'Zoho Books' },
    { id: 7, name: 'FoodTech Marketplace Split', sector: 'E-Commerce', bank: 'ICICI CMS', erp: 'Tally Prime' },
    { id: 8, name: 'Ride-Hailing Fleet Cashouts', sector: 'FinTech', bank: 'Axis Bank', erp: 'Custom GL' },
    { id: 9, name: 'Cross-Border IT Services Wire', sector: 'SaaS', bank: 'Citibank N.A.', erp: 'Oracle Fusion' },
    { id: 10, name: 'Luxury Hotel Pre-Auth Capture', sector: 'Hospitality', bank: 'HDFC CMS', erp: 'Opera Cloud' },
    { id: 11, name: 'Automotive EV Dealership Advance', sector: 'Industrial', bank: 'SBI Bank', erp: 'SAP S/4HANA' },
    { id: 12, name: 'Freight Logistics COD Batches', sector: 'Logistics', bank: 'ICICI Bank', erp: 'Tally Prime' },
    { id: 13, name: 'Solar Renewable IPP Tariffs', sector: 'Industrial', bank: 'PFC Bank', erp: 'SAP ERP' },
    { id: 14, name: 'Gaming In-App Currency Tokens', sector: 'FinTech', bank: 'Yes Bank', erp: 'Postgres' },
    { id: 15, name: 'Real Estate Escrow Pool RERA', sector: 'FinTech', bank: 'HDFC Escrow', erp: 'NetSuite' },
    { id: 16, name: 'Pharma Wholesale E-Way Bills', sector: 'Healthcare', bank: 'Kotak Bank', erp: 'SAP S/4HANA' },
    { id: 17, name: 'Telecom Postpaid Auto-Mandate', sector: 'SaaS', bank: 'SBI CMS', erp: 'Oracle BRM' },
    { id: 18, name: 'Omnichannel POS Terminal Swipes', sector: 'E-Commerce', bank: 'Axis Bank', erp: 'Tally Prime' },
    { id: 19, name: 'OTT Media Recurring Subscriptions', sector: 'SaaS', bank: 'HDFC Bank', erp: 'Chargebee' },
    { id: 20, name: 'Supply Chain Invoice Factoring', sector: 'FinTech', bank: 'ICICI TReDS', erp: 'SAP S/4HANA' },
  ];

  const filteredScenarios = selectedSector === 'ALL'
    ? ALL_SCENARIOS
    : ALL_SCENARIOS.filter(s => s.sector === selectedSector);

  // Section 5 Live Verdict Examples Data
  const VERDICT_EXAMPLES = {
    Matched: {
      status: 'Matched',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      gateway: { label: 'pay_Lw92K182', amount: '₹14,500.00', date: '2026-08-14', extra: 'Net: ₹14,210.00' },
      bank: { label: 'UTR90128391823', amount: '₹14,210.00', date: '2026-08-15', extra: 'CMS/RAZORPAYSETTLE' },
      erp: { label: 'INV-2026-0891', amount: '₹14,500.00', date: '2026-08-14', extra: 'Ledger: Cloud Kitchens' },
      reason: 'Three-way match: Gateway ↔ Bank (UTR90128391823, confidence 0.98) ↔ ERP (INV-2026-0891, confidence 0.95). Auto-reconciled.',
    },
    Mismatched: {
      status: 'Mismatched',
      badgeClass: 'bg-rose-50 text-[#E8384F] border-rose-200',
      gateway: { label: 'pay_M812A901', amount: '₹5,000.00', date: '2026-08-14', extra: 'Fee: ₹100.00' },
      bank: { label: 'UTR44910283910', amount: '₹4,899.50', date: '2026-08-15', extra: 'Fee ded: ₹100.50' },
      erp: { label: 'INV-2026-0902', amount: '₹5,000.00', date: '2026-08-14', extra: 'Ledger: Fresh Farms' },
      reason: 'UTR matched (UTR44910283910) but bank net credit (₹4,899.50) differs from gateway net (₹4,900.00) by ₹0.50 MDR delta.',
    },
    Missing: {
      status: 'Missing',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      gateway: { label: 'pay_X4410291', amount: '₹22,000.00', date: '2026-08-12', extra: 'Settlement: Pending' },
      bank: { label: 'None Found', amount: '—', date: '—', extra: 'No UTR counterpart' },
      erp: { label: 'INV-2026-0774', amount: '₹22,000.00', date: '2026-08-12', extra: 'Ledger: QuickRetail' },
      reason: 'Gateway and ERP records matched, but no settlement credit was found in bank statements within T+3 window.',
    },
    Duplicate: {
      status: 'Duplicate',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      gateway: { label: 'pay_D1102931', amount: '₹8,450.00', date: '2026-08-15', extra: 'First ingest @ 10:14' },
      bank: { label: 'UTR11928301923', amount: '₹8,281.00', date: '2026-08-16', extra: 'Single deposit line' },
      erp: { label: 'INV-2026-0941', amount: '₹8,450.00', date: '2026-08-15', extra: 'Duplicated voucher #2' },
      reason: 'Same transaction ID and reference appeared twice across separate batch uploads. Isolated from financial totals.',
    },
  };

  const currentVerdict = VERDICT_EXAMPLES[activeTab];

  return (
    <div className="relative min-h-screen bg-[#FAFAF9] text-slate-900 font-sans selection:bg-[#E8384F] selection:text-white aurora-canvas">
      
      {/* 🌌 Interactive Background: Crystal Particle Mesh + Ambient Aurora */}
      <ParticleCanvasBackground />

      {/* =========================================================================
          SECTION 1 — Fixed Frosted Glass Nav
         ========================================================================= */}
      <header
        className={`fixed top-0 inset-x-0 h-16 z-40 px-6 lg:px-12 flex items-center justify-between transition-all duration-300 ${
          hasScrolled
            ? 'bg-white/85 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]'
            : 'bg-white/70 backdrop-blur-xl border-b border-slate-200/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <CertusLogo className="w-7 h-7" textClassName="text-lg font-bold" />
          <span className="text-slate-300 text-xs">|</span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold">
            Sovereign OS
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <button
            onClick={() => scrollToSection('architecture')}
            className="hover:text-slate-900 transition-colors"
          >
            6-Layer Blueprint
          </button>
          <button
            onClick={() => scrollToSection('scenarios')}
            className="hover:text-slate-900 transition-colors"
          >
            20 Enterprise Scenarios
          </button>
          <button
            onClick={() => scrollToSection('verdicts')}
            className="hover:text-slate-900 transition-colors"
          >
            Double-Lock Engine
          </button>
          <button
            onClick={handleSwaggerClick}
            className="hover:text-slate-900 transition-colors font-mono flex items-center gap-1 text-slate-700"
          >
            <span>REST API</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-[#E8384F] border border-rose-200 font-bold">v1</span>
          </button>
        </nav>

        {/* Right CTA: Strictly Enterprise Login */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchClick}
            className="shimmer-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Enterprise Login</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E8384F]" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          SECTION 2 — Hero Section with 3D Glass Elevation
         ========================================================================= */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 max-w-6xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#E8384F] breathing-dot" />
          <span>Lead Architect: <strong>Aditya Singh</strong></span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[11px] text-emerald-700 font-bold">55 / 55 Invariants Passing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.12] font-display">
          Autonomous Financial Controller & Sovereign Reconciler
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Zero-hallucination multi-model reconciliation across Razorpay Gateway, Bank CMS narrations, and ERP General Ledgers. Guaranteed by Layer 1 Deterministic Rules + Layer 2 Serial Consensus.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={handleLaunchClick}
            className="shimmer-btn flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#E8384F] hover:bg-[#d42d43] text-white text-sm font-bold shadow-md shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
          >
            <span>Launch Financial OS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleArchClick}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 text-sm font-bold shadow-xs backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
          >
            <Layers className="w-4 h-4 text-[#E8384F]" />
            <span>Explore 6-Layer Architecture</span>
          </button>
        </div>

        {/* 3D KPI Hero Grid */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="glass-3d hover-lift-3d p-5 rounded-2xl specular-top">
            <span className="text-xs font-semibold text-slate-500 block">Throughput Velocity</span>
            <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">4,666 /s</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block font-mono">Vectorized NumPy</span>
          </div>

          <div className="glass-3d hover-lift-3d p-5 rounded-2xl specular-top">
            <span className="text-xs font-semibold text-slate-500 block">Initial Relay Latency</span>
            <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">118 ms</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block font-mono">Groq LLaMA 3.3 70B</span>
          </div>

          <div className="glass-3d hover-lift-3d p-5 rounded-2xl specular-top">
            <span className="text-xs font-semibold text-slate-500 block">Double-Lock Gate</span>
            <span className="font-mono text-2xl font-bold text-[#E8384F] mt-1 block tabular-nums">≥ 0.75</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block font-mono">Zero Hallucination</span>
          </div>

          <div className="glass-3d hover-lift-3d p-5 rounded-2xl specular-top">
            <span className="text-xs font-semibold text-slate-500 block">Enterprise Scenarios</span>
            <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">20 Domains</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block font-mono">4-Channel Dense</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — 6-Layer Architecture Blueprint Teardown
         ========================================================================= */}
      <section id="architecture" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            The 6-Layer Invariant Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every transaction is mathematically bound through deterministic rules and serial multi-agent consensus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              layer: 'Layer 0',
              title: 'Streaming Ingestion Engine',
              desc: 'Normalizes Gateway JSON, Indian Bank CSVs, and ERP ledgers into unified immutable vectors.',
              icon: Database,
            },
            {
              layer: 'Layer 1',
              title: 'Deterministic Invariant Rules',
              desc: 'Vectorized NumPy engine trapping negative credits, MDR fee deviations >50 bps, and impossible dates.',
              icon: ShieldCheck,
            },
            {
              layer: 'Layer 2',
              title: 'Serial Consensus Relay',
              desc: 'Groq LLaMA 3.3 (118ms) → Gemini 2.5 Pro early exit with Claude & GPT-4o dissent escalation.',
              icon: Cpu,
            },
            {
              layer: 'Layer 3',
              title: 'Autonomous HITL Quarantine',
              desc: 'Isolates exceptions with interactive UTR override, MDR fee write-off, and manual match workflows.',
              icon: ShieldAlert,
            },
            {
              layer: 'Layer 4',
              title: 'Continuous Cash Forecaster',
              desc: '14-day hybrid moving average tracking in-flight gateway settlement transit in T+1/T+2 bank windows.',
              icon: Activity,
            },
            {
              layer: 'Layer 5',
              title: 'Read-Only MCP Copilot',
              desc: 'Natural language treasury analyst enforcing mandatory transaction citations on every answer.',
              icon: Sparkles,
            },
          ].map((item, idx) => (
            <div key={idx} className="glass-3d hover-lift-3d p-6 rounded-2xl specular-top space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-100 text-[#E8384F]">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{item.layer}</span>
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — 20 Enterprise Scenarios Showcase (With Target ID)
         ========================================================================= */}
      <section id="scenarios" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="glass-3d-elevated p-8 rounded-3xl specular-top shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                20 Enterprise Financial Scenarios
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Pre-configured dense 4-channel datasets covering high-volume e-commerce, milestone SaaS, credit, and trade.
              </p>
            </div>

            {/* Sector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'E-Commerce', 'SaaS', 'FinTech', 'Healthcare', 'Industrial'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    try { soundManager.playClick(); } catch (_) {}
                    setSelectedSector(sec);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedSector === sec
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {filteredScenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={handleLaunchClick}
                className="glass-3d hover-lift-3d p-4 rounded-2xl cursor-pointer border border-slate-200/80 bg-white/70 hover:bg-white text-left space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#E8384F]">#{String(sc.id).padStart(2, '0')}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 uppercase">{sc.sector}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#E8384F] transition-colors line-clamp-1">{sc.name}</h4>
                <p className="text-[10px] font-mono text-slate-400">{sc.bank} ↔ {sc.erp}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={handleLaunchClick}
              className="shimmer-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Test All 20 Scenarios in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E8384F]" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — Interactive Live Verdict Explorer
         ========================================================================= */}
      <section id="verdicts" className="py-20 px-6 lg:px-12 max-w-5xl mx-auto z-10 relative">
        <div className="glass-3d-elevated p-8 rounded-3xl specular-top shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Interactive Double-Lock Signal Verdicts
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Select a match classification to view real-world 3-way stream alignment and diagnostic proofs.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
              {['Matched', 'Mismatched', 'Missing', 'Duplicate'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    try { soundManager.playClick(); } catch (_) {}
                    setActiveTab(tab);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 3-Stream Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gateway Record</span>
              <p className="font-mono text-xs font-bold text-slate-900">{currentVerdict.gateway.label}</p>
              <p className="font-mono text-sm font-bold text-slate-900">{currentVerdict.gateway.amount}</p>
              <p className="text-[11px] text-slate-500">{currentVerdict.gateway.extra}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bank Statement</span>
              <p className="font-mono text-xs font-bold text-slate-900">{currentVerdict.bank.label}</p>
              <p className="font-mono text-sm font-bold text-slate-900">{currentVerdict.bank.amount}</p>
              <p className="text-[11px] text-slate-500">{currentVerdict.bank.extra}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ERP Ledger</span>
              <p className="font-mono text-xs font-bold text-slate-900">{currentVerdict.erp.label}</p>
              <p className="font-mono text-sm font-bold text-slate-900">{currentVerdict.erp.amount}</p>
              <p className="text-[11px] text-slate-500">{currentVerdict.erp.extra}</p>
            </div>
          </div>

          {/* Reason Card */}
          <div className={`p-4 rounded-2xl border ${currentVerdict.badgeClass} text-xs leading-relaxed font-sans`}>
            <span className="font-bold block mb-1">Double-Lock Diagnostic Reason:</span>
            {currentVerdict.reason}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — Footer with Aditya Singh attribution & GitHub link
         ========================================================================= */}
      <footer className="py-12 border-t border-slate-200/60 bg-white/70 backdrop-blur-xl text-xs text-slate-500 px-6 lg:px-12 z-10 relative">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CertusLogo className="w-5 h-5" />
            <span className="font-semibold text-slate-900">Certus AI Finance Controller</span>
            <span className="text-slate-300">•</span>
            <span>Designed & Built by <strong>Aditya Singh</strong></span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/adityasingh1786/certus-ai-finance-controller"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-700 hover:text-[#E8384F] font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[11px]">MIT License</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
