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
  X,
  Play,
} from 'lucide-react';
import ParticleCanvasBackground from './ParticleCanvasBackground';
import ThreeRailCanvas from './ThreeRailCanvas';
import ScrollyReconcileDemo from './ScrollyReconcileDemo';
import AnomalySimulatorWidget from './AnomalySimulatorWidget';
import MagneticButton from './MagneticButton';
import CertusLogo from './CertusLogo';
import AboutDeveloperSection from './AboutDeveloperSection';
import { initLenis, destroyLenis } from '../lib/lenis';
import { soundManager } from '../lib/soundFx';

export default function LandingPage({ onOpenAuth, onOpenArchitecture, onOpenSwagger }) {
  const [activeTab, setActiveTab] = useState('Matched');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [previewScenario, setPreviewScenario] = useState(null);

  // Initialize Lenis Smooth Momentum Scrolling
  useEffect(() => {
    const lenis = initLenis();

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      destroyLenis();
    };
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

  // 20 Enterprise Scenarios Catalog
  const ALL_SCENARIOS = [
    { id: 1, name: 'D2C Fashion Flash Sale', sector: 'E-Commerce', bank: 'HDFC CMS', erp: 'Tally Prime', vol: '12,500 rec/mo', matchRate: '98.5%', mdr: '2.00%' },
    { id: 2, name: 'B2B SaaS Milestone Invoicing', sector: 'SaaS', bank: 'ICICI Bank', erp: 'NetSuite', vol: '1,200 rec/mo', matchRate: '99.2%', mdr: '1.80%' },
    { id: 3, name: 'Quick Commerce 10-Min Delivery', sector: 'E-Commerce', bank: 'Axis Bank', erp: 'SAP S/4HANA', vol: '85,000 rec/mo', matchRate: '97.8%', mdr: '2.10%' },
    { id: 4, name: 'NBFC Loan EMI Disbursals', sector: 'FinTech', bank: 'SBI Corporate', erp: 'Oracle GL', vol: '34,000 rec/mo', matchRate: '99.6%', mdr: '1.50%' },
    { id: 5, name: 'Hospital TPA Insurance Co-Pay', sector: 'Healthcare', bank: 'Kotak Bank', erp: 'SAP ERP', vol: '6,400 rec/mo', matchRate: '96.4%', mdr: '2.25%' },
    { id: 6, name: 'EdTech Subscription Platform', sector: 'SaaS', bank: 'HDFC Bank', erp: 'Zoho Books', vol: '18,200 rec/mo', matchRate: '98.9%', mdr: '1.95%' },
    { id: 7, name: 'FoodTech Marketplace Split', sector: 'E-Commerce', bank: 'ICICI CMS', erp: 'Tally Prime', vol: '142,000 rec/mo', matchRate: '97.2%', mdr: '2.00%' },
    { id: 8, name: 'Ride-Hailing Fleet Cashouts', sector: 'FinTech', bank: 'Axis Bank', erp: 'Custom GL', vol: '92,000 rec/mo', matchRate: '99.1%', mdr: '1.75%' },
    { id: 9, name: 'Cross-Border IT Services Wire', sector: 'SaaS', bank: 'Citibank N.A.', erp: 'Oracle Fusion', vol: '450 rec/mo', matchRate: '100.0%', mdr: '0.85%' },
    { id: 10, name: 'Luxury Hotel Pre-Auth Capture', sector: 'Hospitality', bank: 'HDFC CMS', erp: 'Opera Cloud', vol: '3,800 rec/mo', matchRate: '98.1%', mdr: '2.40%' },
    { id: 11, name: 'Automotive EV Dealership Advance', sector: 'Industrial', bank: 'SBI Bank', erp: 'SAP S/4HANA', vol: '2,100 rec/mo', matchRate: '99.4%', mdr: '1.20%' },
    { id: 12, name: 'Freight Logistics COD Batches', sector: 'Logistics', bank: 'ICICI Bank', erp: 'Tally Prime', vol: '48,000 rec/mo', matchRate: '95.8%', mdr: '2.30%' },
    { id: 13, name: 'Solar Renewable IPP Tariffs', sector: 'Industrial', bank: 'PFC Bank', erp: 'SAP ERP', vol: '620 rec/mo', matchRate: '100.0%', mdr: '0.50%' },
    { id: 14, name: 'Gaming In-App Currency Tokens', sector: 'FinTech', bank: 'Yes Bank', erp: 'Postgres', vol: '210,000 rec/mo', matchRate: '98.4%', mdr: '2.20%' },
    { id: 15, name: 'Real Estate Escrow Pool RERA', sector: 'FinTech', bank: 'HDFC Escrow', erp: 'NetSuite', vol: '840 rec/mo', matchRate: '99.8%', mdr: '0.95%' },
    { id: 16, name: 'Pharma Wholesale E-Way Bills', sector: 'Healthcare', bank: 'Kotak Bank', erp: 'SAP S/4HANA', vol: '14,500 rec/mo', matchRate: '97.9%', mdr: '1.90%' },
    { id: 17, name: 'Telecom Postpaid Auto-Mandate', sector: 'SaaS', bank: 'SBI CMS', erp: 'Oracle BRM', vol: '320,000 rec/mo', matchRate: '99.3%', mdr: '1.40%' },
    { id: 18, name: 'Omnichannel POS Terminal Swipes', sector: 'E-Commerce', bank: 'Axis Bank', erp: 'Tally Prime', vol: '65,000 rec/mo', matchRate: '98.0%', mdr: '1.85%' },
    { id: 19, name: 'OTT Media Recurring Subscriptions', sector: 'SaaS', bank: 'HDFC Bank', erp: 'Chargebee', vol: '180,000 rec/mo', matchRate: '98.7%', mdr: '1.90%' },
    { id: 20, name: 'Supply Chain Invoice Factoring', sector: 'FinTech', bank: 'ICICI TReDS', erp: 'SAP S/4HANA', vol: '4,200 rec/mo', matchRate: '99.5%', mdr: '1.10%' },
  ];

  const filteredScenarios = selectedSector === 'ALL'
    ? ALL_SCENARIOS
    : ALL_SCENARIOS.filter(s => s.sector === selectedSector);

  // Verdict Examples Data
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
      {/* 🌌 Background Particle Canvas */}
      <ParticleCanvasBackground />

      {/* =========================================================================
          SECTION 1 — Fixed Frosted Glass Nav
         ========================================================================= */}
      <header
        className={`fixed top-0 inset-x-0 h-16 z-40 px-6 lg:px-12 flex items-center justify-between transition-all duration-300 ${
          hasScrolled
            ? 'bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]'
            : 'bg-white/70 backdrop-blur-xl border-b border-slate-200/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <CertusLogo className="w-7 h-7" textClassName="text-lg font-bold" />
          <span className="text-slate-300 text-xs">|</span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-[#E8384F] font-bold">
            Track 4 Buildathon
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <button
            onClick={() => scrollToSection('simulator')}
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-[#E8384F]" />
            <span>Stress-Tester</span>
          </button>
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
            onClick={() => scrollToSection('about-developer')}
            className="hover:text-[#E8384F] transition-colors font-bold text-slate-800 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8384F]" />
            <span>Lead Architect</span>
          </button>
          <button
            onClick={handleSwaggerClick}
            className="hover:text-slate-900 transition-colors font-mono flex items-center gap-1 text-slate-700"
          >
            <span>REST API</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-[#E8384F] border border-rose-200 font-bold">v1</span>
          </button>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <MagneticButton
            onClick={handleLaunchClick}
            className="shimmer-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#E8384F] text-white text-xs font-bold shadow-xs transition-all"
          >
            <span>Enterprise Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </MagneticButton>
        </div>
      </header>

      {/* =========================================================================
          HIGH-VELOCITY FINANCIAL TELEMETRY MARQUEE TAPE
         ========================================================================= */}
      <div className="pt-16 bg-slate-900 text-white overflow-hidden py-2 border-b border-slate-800 relative z-20">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee font-mono text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            RAZORPAY ↔ HDFC CMS: 729 OPS/S
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-rose-400 font-bold">55 / 55 INVARIANTS ARMED</span>
          <span className="text-slate-500">•</span>
          <span>LATENCY: 1.37 ms / RECORD</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-400">ZERO NETWORK AIR-GAP: ENFORCED (SQLITE WAL)</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400">TALLY PRIME 4.0 & SAP S/4HANA SYNC: 0.00ms JITTER</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400">DOUBLE-LOCK CONSENSUS GATE: ≥ 0.75 PASSED</span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2 — Hero Section with 3D WebGL Multi-Rail Spatial Canvas
         ========================================================================= */}
      <section className="relative pt-16 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center z-10">
        {/* Architect Attribution Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-xs text-xs font-semibold text-slate-700 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#E8384F] breathing-dot" />
          <span>Lead Architect: <strong>Aditya Singh</strong></span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[11px] text-emerald-700 font-bold">60 / 60 Backend Invariants Passing</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.12] font-display">
          Sovereign Autonomous <span className="text-[#E8384F]">AI Financial Controller</span> & Multi-Rail Reconciler
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-sans">
          Zero-hallucination multi-model reconciliation across Razorpay Gateways, Corporate Bank CMS statements, and ERP General Ledgers. Guaranteed by Layer 1 Deterministic Invariants + Layer 2 Double-Lock Consensus.
        </p>

        {/* Hero Actions (Magnetic Buttons) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <MagneticButton
            onClick={handleLaunchClick}
            className="shimmer-btn flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#E8384F] hover:bg-[#d42d43] text-white text-sm font-bold shadow-lg shadow-rose-500/25 transition-all w-full sm:w-auto"
          >
            <span>Launch Sovereign Controller</span>
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>

          <MagneticButton
            onClick={handleArchClick}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200/90 text-sm font-bold shadow-xs backdrop-blur-md transition-all hover:border-rose-200 w-full sm:w-auto"
          >
            <Layers className="w-4 h-4 text-[#E8384F]" />
            <span>Explore 6-Layer Architecture</span>
          </MagneticButton>
        </div>

        {/* 3D WebGL Multi-Rail Spatial Canvas Container */}
        <div className="mt-12 relative w-full h-[380px] sm:h-[450px] rounded-3xl overflow-hidden luxury-glass-card border border-slate-200/90 bg-white/60 shadow-2xl">
          <ThreeRailCanvas className="w-full h-full" />
          
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 border border-slate-200/90 shadow-md text-xs font-mono font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#E8384F] animate-pulse" />
            <span>LIVE 3D RAIL TOPOLOGY: GLIDING SETTLEMENT PACKETS</span>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs text-[11px] font-mono text-slate-500">
            <span>Hover to Inspect Dynamic Spatial Depth</span>
          </div>
        </div>

        {/* 3D KPI Hero Grid */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="luxury-glass-card hover-lift-3d p-5 rounded-2xl bg-white">
            <span className="text-xs font-semibold text-slate-500 block font-sans">Throughput Velocity</span>
            <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">729 ops/s</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block font-mono">1.37 ms / Record</span>
          </div>

          <div className="luxury-glass-card hover-lift-3d p-5 rounded-2xl bg-white">
            <span className="text-xs font-semibold text-slate-500 block font-sans">Invariant Engine</span>
            <span className="font-mono text-2xl font-bold text-[#E8384F] mt-1 block tabular-nums">55 Rules</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block font-mono">Layer 1 Deterministic</span>
          </div>

          <div className="luxury-glass-card hover-lift-3d p-5 rounded-2xl bg-white">
            <span className="text-xs font-semibold text-slate-500 block font-sans">Double-Lock Consensus</span>
            <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">≥ 0.75 Gate</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block font-mono">Zero Hallucination</span>
          </div>

          <div className="luxury-glass-card hover-lift-3d p-5 rounded-2xl bg-white">
            <span className="text-xs font-semibold text-slate-500 block font-sans">Enterprise Datasets</span>
            <span className="font-mono text-2xl font-bold text-slate-900 mt-1 block tabular-nums">20 Domains</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block font-mono">Dense 4-Channel Ingest</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — Interactive Invariant Stress-Tester Simulator
         ========================================================================= */}
      <section id="simulator" className="py-12 px-6 lg:px-12 max-w-7xl mx-auto z-10 relative">
        <AnomalySimulatorWidget onLaunchDashboard={handleLaunchClick} />
      </section>

      {/* =========================================================================
          SECTION 4 — GSAP Pinned Scrollytelling Reconciliation Walkthrough
         ========================================================================= */}
      <ScrollyReconcileDemo />

      {/* =========================================================================
          SECTION 5 — 6-Layer Architecture Blueprint Teardown
         ========================================================================= */}
      <section id="architecture" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 shadow-xs mb-3">
            <Layers className="w-3.5 h-3.5 text-[#E8384F]" />
            <span className="text-xs font-mono font-semibold text-[#E8384F] uppercase tracking-wider">
              SYSTEM TOPOLOGY
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            The 6-Layer Invariant Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-sans">
            Every transaction is mathematically bound through deterministic rules and serial multi-agent consensus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              layer: 'Layer 0',
              title: 'Streaming Ingestion Engine',
              desc: 'Normalizes Gateway JSON, Indian Bank CSVs, and ERP ledgers into unified immutable integer paisa vectors.',
              icon: Database,
            },
            {
              layer: 'Layer 1',
              title: 'Deterministic Invariant Rules',
              desc: '55 mathematical invariant checks trapping negative credits, MDR deviations >50 bps, and impossible dates.',
              icon: ShieldCheck,
            },
            {
              layer: 'Layer 2',
              title: 'Hybrid Multi-Signal Consensus',
              desc: 'RapidFuzz token matching + weighted composite score (50% Amount, 30% Ref, 20% Date) with double-lock gate.',
              icon: Cpu,
            },
            {
              layer: 'Layer 3',
              title: 'Fail-Closed Quarantine Engine',
              desc: 'Isolates discrepancies with exact paisa variances, UTR overrides, and audit log generation.',
              icon: ShieldAlert,
            },
            {
              layer: 'Layer 4',
              title: 'Sovereign Treasury Forecaster',
              desc: '14-day hybrid moving average tracking in-flight gateway settlement transit in T+1/T+2 bank windows.',
              icon: Activity,
            },
            {
              layer: 'Layer 5',
              title: 'Dual-Loop ReAct AI Copilot',
              desc: 'Read-only treasury analyst delivering 4-tier forensic audit reports with air-gapped SQLite WAL fallback.',
              icon: Sparkles,
            },
          ].map((item, idx) => (
            <div key={idx} className="luxury-glass-card hover-lift-3d p-6 rounded-2xl bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-rose-50 text-[#E8384F] border border-rose-100">
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
          SECTION 6 — 20 Enterprise Scenarios Showcase with Live Preview Drawer
         ========================================================================= */}
      <section id="scenarios" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="luxury-glass-card p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                20 Enterprise Financial Scenarios
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Click any scenario to inspect its live dense 4-channel parameters and simulate instant multi-rail reconciliation.
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
                onClick={() => {
                  try { soundManager.playClick(); } catch (_) {}
                  setPreviewScenario(sc);
                }}
                className="luxury-glass-card hover-lift-3d p-4 rounded-2xl cursor-pointer border border-slate-200/80 bg-white/70 hover:bg-white text-left space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#E8384F]">#{String(sc.id).padStart(2, '0')}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 uppercase">{sc.sector}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#E8384F] transition-colors line-clamp-1">{sc.name}</h4>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                  <span>{sc.bank.split(' ')[0]} ↔ {sc.erp.split(' ')[0]}</span>
                  <span className="text-emerald-700 font-bold">{sc.matchRate}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <MagneticButton
              onClick={handleLaunchClick}
              className="shimmer-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-[#E8384F] text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Test All 20 Scenarios in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E8384F]" />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCENARIO PREVIEW SLIDE-OVER DRAWER
         ========================================================================= */}
      {previewScenario && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-rose-50 text-[#E8384F] border border-rose-200">
                    DS-#{String(previewScenario.id).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">{previewScenario.sector}</span>
                </div>
                <button
                  onClick={() => setPreviewScenario(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-6 space-y-4">
                <h3 className="text-xl font-display font-bold text-slate-900">
                  {previewScenario.name}
                </h3>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Settlement Rail</span>
                    <span className="text-xs font-bold font-mono text-slate-900 mt-1 block">{previewScenario.bank}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">ERP General Ledger</span>
                    <span className="text-xs font-bold font-mono text-slate-900 mt-1 block">{previewScenario.erp}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Monthly Volume</span>
                    <span className="text-xs font-bold font-mono text-slate-900 mt-1 block">{previewScenario.vol}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Contracted MDR</span>
                    <span className="text-xs font-bold font-mono text-[#E8384F] mt-1 block">{previewScenario.mdr}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dense 4-Channel Invariant Match Profile</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                    Pre-calibrated with exact integer paisa mappings, Section 194-O TDS deductions, and T+1/T+2 bank clearance windows.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <MagneticButton
                onClick={() => {
                  setPreviewScenario(null);
                  handleLaunchClick();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#E8384F] hover:bg-[#d42d43] text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Simulate Scenario in Dashboard</span>
              </MagneticButton>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 7 — Revolutionized About Developer Section
         ========================================================================= */}
      <AboutDeveloperSection />

      {/* =========================================================================
          SECTION 8 — Footer with Aditya Singh attribution & GitHub link
         ========================================================================= */}
      <footer className="py-12 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl text-xs text-slate-500 px-6 lg:px-12 z-10 relative">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CertusLogo className="w-5 h-5" />
            <span className="font-semibold text-slate-900">Certus AI Finance Controller</span>
            <span className="text-slate-300">•</span>
            <span>Architected & Built by <strong>Aditya Singh</strong></span>
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
