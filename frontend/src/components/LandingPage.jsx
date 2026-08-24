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
} from 'lucide-react';
import SignalGridBackground from './SignalGridBackground';
import CertusLogo from './CertusLogo';

export default function LandingPage({ onOpenDashboard, onOpenArchitecture, onOpenSwagger }) {
  const [activeTab, setActiveTab] = useState('Matched');
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Section 5 Live Verdict Examples Data
  const VERDICT_EXAMPLES = {
    Matched: {
      status: 'Matched',
      badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
      gateway: { label: 'pay_Lw92K182', amount: '₹14,500.00', date: '2026-08-14', extra: 'Net: ₹14,210.00' },
      bank: { label: 'UTR90128391823', amount: '₹14,210.00', date: '2026-08-15', extra: 'CMS/RAZORPAYSETTLE' },
      erp: { label: 'INV-2026-0891', amount: '₹14,500.00', date: '2026-08-14', extra: 'Ledger: Cloud Kitchens' },
      reason: 'Three-way match: Gateway ↔ Bank (UTR90128391823, confidence 0.98) ↔ ERP (INV-2026-0891, confidence 0.95). Auto-reconciled.',
    },
    Mismatched: {
      status: 'Mismatched',
      badgeClass: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
      gateway: { label: 'pay_M812A901', amount: '₹5,000.00', date: '2026-08-14', extra: 'Fee: ₹100.00' },
      bank: { label: 'UTR44910283910', amount: '₹4,899.50', date: '2026-08-15', extra: 'Fee ded: ₹100.50' },
      erp: { label: 'INV-2026-0902', amount: '₹5,000.00', date: '2026-08-14', extra: 'Ledger: Fresh Farms' },
      reason: 'UTR matched (UTR44910283910) but bank net credit (₹4,899.50) differs from gateway net (₹4,900.00) by ₹0.50 MDR delta.',
    },
    Missing: {
      status: 'Missing',
      badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
      gateway: { label: 'pay_X4410291', amount: '₹22,000.00', date: '2026-08-12', extra: 'Settlement: Pending' },
      bank: { label: 'None Found', amount: '—', date: '—', extra: 'No UTR counterpart' },
      erp: { label: 'INV-2026-0774', amount: '₹22,000.00', date: '2026-08-12', extra: 'Ledger: QuickRetail' },
      reason: 'Gateway and ERP records matched, but no settlement credit was found in bank statements within T+3 window.',
    },
    Duplicate: {
      status: 'Duplicate',
      badgeClass: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]',
      gateway: { label: 'pay_D1102931', amount: '₹8,450.00', date: '2026-08-15', extra: 'First ingest @ 10:14' },
      bank: { label: 'UTR11928301923', amount: '₹8,281.00', date: '2026-08-16', extra: 'Single deposit line' },
      erp: { label: 'INV-2026-0941', amount: '₹8,450.00', date: '2026-08-15', extra: 'Duplicated voucher #2' },
      reason: 'Same transaction ID and reference appeared twice across separate batch uploads. Isolated from financial totals.',
    },
  };

  const currentVerdict = VERDICT_EXAMPLES[activeTab];

  return (
    <div className="relative min-h-screen bg-page text-ink-primary font-sans selection:bg-sterling selection:text-white">
      {/* Living Background: Signal Grid (<15% opacity behind whole page) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-12">
        <SignalGridBackground />
      </div>

      {/* =========================================================================
          SECTION 1 — Nav (fixed, white, soft shadow on scroll)
         ========================================================================= */}
      <header
        className={`fixed top-0 inset-x-0 h-16 z-40 px-6 lg:px-12 flex items-center justify-between transition-all duration-200 ${
          hasScrolled
            ? 'bg-surface/95 backdrop-blur-none border-b border-border-subtle shadow-card'
            : 'bg-surface border-b border-border-subtle'
        }`}
      >
        <div className="flex items-center gap-3">
          <CertusLogo className="w-7 h-7" textClassName="text-lg font-bold" />
          <span className="text-border-strong text-xs">|</span>
          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-page border border-border-subtle text-ink-secondary font-semibold">
            Enterprise Edition
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-ink-secondary">
          <button
            onClick={() => scrollToSection('problem')}
            className="hover:text-ink-primary transition-fast"
          >
            The Problem
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-ink-primary transition-fast"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('verdicts')}
            className="hover:text-ink-primary transition-fast"
          >
            Live Verdicts
          </button>
          <button
            onClick={onOpenArchitecture}
            className="hover:text-ink-primary transition-fast"
          >
            Architecture
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDashboard}
            className="bg-sterling hover:bg-sterling-hover text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-subtle flex items-center gap-1.5 transition-fast"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 pt-16">
        {/* =========================================================================
            SECTION 2 — Hero
           ========================================================================= */}
        <section className="pt-20 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sterling-light/60 border border-sterling-border text-sterling text-xs font-semibold tracking-wider uppercase font-mono">
              <span className="h-2 w-2 rounded-full bg-sterling animate-pulse" />
              <span>AUTONOMOUS FINANCIAL CONTROLLER — ENTERPRISE EDITION</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-ink-primary leading-[1.08]">
              Every record gets a verdict, <span className="text-sterling">not a guess.</span>
            </h1>

            <p className="text-base sm:text-lg text-ink-secondary max-w-2xl leading-relaxed">
              Certus ingests Razorpay gateway data, bank statements, and accounting ledgers, cross-checks all three, and tells you exactly which records match and which need a human look — never silently guessing.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenDashboard}
                className="bg-sterling hover:bg-sterling-hover text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-subtle flex items-center gap-2 transition-fast"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('problem')}
                className="bg-surface hover:bg-page text-ink-primary border border-border-strong text-sm font-semibold px-6 py-3 rounded-xl shadow-subtle flex items-center gap-2 transition-fast"
              >
                <span>See How It Works</span>
                <ArrowDown className="w-4 h-4 text-ink-muted" />
              </button>
            </div>
          </div>

          {/* Right Hero Demo Soft-Glass Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sterling" />
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-ink-primary">
                    Live Evaluation Demo
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  MATCHED (1.00)
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-page rounded-lg border border-border-subtle space-y-1">
                  <div className="flex justify-between text-ink-muted text-[11px]">
                    <span>1. Gateway Ingest</span>
                    <span>Exact Gross</span>
                  </div>
                  <div className="flex justify-between text-ink-primary font-semibold tabular-nums">
                    <span>pay_Live98124</span>
                    <span>₹14,500.00</span>
                  </div>
                </div>

                <div className="p-3 bg-page rounded-lg border border-border-subtle space-y-1">
                  <div className="flex justify-between text-ink-muted text-[11px]">
                    <span>2. Bank Settlement</span>
                    <span>UTR Verified</span>
                  </div>
                  <div className="flex justify-between text-ink-primary font-semibold tabular-nums">
                    <span>UTR90128391823</span>
                    <span>₹14,210.00</span>
                  </div>
                </div>

                <div className="p-3 bg-page rounded-lg border border-border-subtle space-y-1">
                  <div className="flex justify-between text-ink-muted text-[11px]">
                    <span>3. ERP Ledger</span>
                    <span>Invoice Book</span>
                  </div>
                  <div className="flex justify-between text-ink-primary font-semibold tabular-nums">
                    <span>INV-2026-0891</span>
                    <span>₹14,500.00</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-status-matched-bg/50 border border-status-matched-border text-[11px] text-status-matched-text leading-relaxed font-sans">
                <span className="font-semibold font-display">Double-Lock Gate Cleared:</span> Deterministic rule composite (0.98) and AI auditor consensus concurred.
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3 — The Problem
           ========================================================================= */}
        <section id="problem" className="py-20 border-t border-border-subtle bg-surface-subtle/40">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sterling">
                The Core Friction
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-ink-primary">
                Three records of the same payment. Three different numbers.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Razorpay Gateway */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sterling-light/60 border border-sterling-border flex items-center justify-center text-sterling font-display font-bold">
                  01
                </div>
                <h3 className="font-display font-bold text-lg text-ink-primary">
                  Razorpay Gateway
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                  Records the payment the instant it happens, before fees are deducted. Captured at gross value with gateway-specific payment IDs.
                </p>
                <div className="pt-2 border-t border-border-subtle font-mono text-xs text-ink-primary font-semibold tabular-nums">
                  ₹5,000.00 <span className="text-ink-muted font-normal text-[11px]">(Gross Charge)</span>
                </div>
              </div>

              {/* Card 2: Bank Statement */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sterling-light/60 border border-sterling-border flex items-center justify-center text-sterling font-display font-bold">
                  02
                </div>
                <h3 className="font-display font-bold text-lg text-ink-primary">
                  Bank Statement
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                  Shows the money 1-2 days later, after fees and TDS are already subtracted. Buried inside dense free-text NEFT/UPI narration lines.
                </p>
                <div className="pt-2 border-t border-border-subtle font-mono text-xs text-ink-primary font-semibold tabular-nums">
                  ₹4,899.70 <span className="text-ink-muted font-normal text-[11px]">(Net Settlement)</span>
                </div>
              </div>

              {/* Card 3: Accounting Ledger */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sterling-light/60 border border-sterling-border flex items-center justify-center text-sterling font-display font-bold">
                  03
                </div>
                <h3 className="font-display font-bold text-lg text-ink-primary">
                  Accounting Ledger
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                  Logged manually or semi-automatically, using its own invoice numbers and legal merchant names that don't match either of the above.
                </p>
                <div className="pt-2 border-t border-border-subtle font-mono text-xs text-ink-primary font-semibold tabular-nums">
                  INV-9021 <span className="text-ink-muted font-normal text-[11px]">(Internal Voucher)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface border border-border-subtle rounded-xl text-center max-w-4xl mx-auto text-xs text-ink-secondary leading-relaxed font-sans shadow-subtle">
              Today, someone on a finance team has to manually compare all three, line by line, to catch mistakes — <strong className="text-ink-primary">that's the actual job being automated here.</strong>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4 — How Certus Works (4 connected cards, horizontal on desktop)
           ========================================================================= */}
        <section id="how-it-works" className="py-20 border-t border-border-subtle bg-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sterling">
                Autonomous Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-ink-primary">
                A 4-stage verification pipeline.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Pipeline Stage 1 */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-3 relative hover:border-border-strong transition-fast">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sterling">STAGE 01</span>
                  <Database className="w-4 h-4 text-ink-muted" />
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Ingest & Validate
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Dynamic column detector normalizes heterogeneous CSVs; validates schema and isolates corrupted records into Quarantine.
                </p>
              </div>

              {/* Pipeline Stage 2 */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-3 relative hover:border-border-strong transition-fast">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sterling">STAGE 02</span>
                  <Layers className="w-4 h-4 text-ink-muted" />
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Match Across Sources
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Extracts bank UTRs from raw narrations and performs exact + fuzzy RapidFuzz alignment across gateway IDs and ERP invoices.
                </p>
              </div>

              {/* Pipeline Stage 3 */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-3 relative hover:border-border-strong transition-fast">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sterling">STAGE 03</span>
                  <Cpu className="w-4 h-4 text-ink-muted" />
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Confidence Gate
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Computes 50% amount, 30% reference, and 20% date weights. Runs serial multi-model Consensus Relay on ambiguous records.
                </p>
              </div>

              {/* Pipeline Stage 4 */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-3 relative hover:border-border-strong transition-fast">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sterling">STAGE 04</span>
                  <CheckCircle2 className="w-4 h-4 text-ink-muted" />
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Resolve or Escalate
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Auto-reconciles records clearing the 0.75 gate; routes discrepancies to the human quarantine resolution drawer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5 — Tabbed Live Examples (Tabs element)
           ========================================================================= */}
        <section id="verdicts" className="py-20 border-t border-border-subtle bg-surface-subtle/40">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sterling">
                Interactive Proof
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-ink-primary">
                See what a verdict actually looks like.
              </h2>
            </div>

            {/* 4 Status Tabs */}
            <div className="flex justify-center">
              <div className="inline-flex p-1 bg-surface border border-border-subtle rounded-xl shadow-subtle gap-1">
                {['Matched', 'Mismatched', 'Missing', 'Duplicate'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-fast font-display ${
                        isActive
                          ? 'bg-page text-ink-primary border border-border-strong shadow-subtle'
                          : 'text-ink-secondary hover:text-ink-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content Display Card */}
            <div className="max-w-3xl mx-auto bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <span className="font-display font-bold text-sm text-ink-primary">
                  Evaluation Outcome
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${currentVerdict.badgeClass}`}>
                  {currentVerdict.status.toUpperCase()}
                </span>
              </div>

              {/* 3 Source Values Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 bg-page rounded-xl border border-border-subtle space-y-1.5">
                  <span className="text-[10px] text-ink-muted uppercase font-sans font-semibold">1. Razorpay Gateway</span>
                  <p className="text-ink-primary font-bold">{currentVerdict.gateway.label}</p>
                  <p className="text-sm font-semibold text-ink-primary tabular-nums">{currentVerdict.gateway.amount}</p>
                  <p className="text-[11px] text-ink-muted">{currentVerdict.gateway.extra}</p>
                </div>

                <div className="p-4 bg-page rounded-xl border border-border-subtle space-y-1.5">
                  <span className="text-[10px] text-ink-muted uppercase font-sans font-semibold">2. Bank Statement</span>
                  <p className="text-ink-primary font-bold">{currentVerdict.bank.label}</p>
                  <p className="text-sm font-semibold text-ink-primary tabular-nums">{currentVerdict.bank.amount}</p>
                  <p className="text-[11px] text-ink-muted">{currentVerdict.bank.extra}</p>
                </div>

                <div className="p-4 bg-page rounded-xl border border-border-subtle space-y-1.5">
                  <span className="text-[10px] text-ink-muted uppercase font-sans font-semibold">3. Accounting ERP</span>
                  <p className="text-ink-primary font-bold">{currentVerdict.erp.label}</p>
                  <p className="text-sm font-semibold text-ink-primary tabular-nums">{currentVerdict.erp.amount}</p>
                  <p className="text-[11px] text-ink-muted">{currentVerdict.erp.extra}</p>
                </div>
              </div>

              {/* Plain English Verdict Reason */}
              <div className="p-4 rounded-xl bg-page border border-border-subtle text-xs text-ink-secondary leading-relaxed font-sans">
                <strong className="text-ink-primary font-display block mb-1">Certus Plain-English Reason:</strong>
                {currentVerdict.reason}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6 — Why You Can Trust It (Architecture/Trust)
           ========================================================================= */}
        <section id="trust" className="py-20 border-t border-border-subtle bg-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sterling">
                Governance & Safety
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-ink-primary">
                Built to never guess when it isn't sure.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Trust Card 1 */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sterling-light/60 border border-sterling-border flex items-center justify-center text-sterling">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Read-only by design
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  The AI can query and cross-check, but has zero ability to move money or alter records. All tools operate in strictly read-only execution modes.
                </p>
              </div>

              {/* Trust Card 2 */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sterling-light/60 border border-sterling-border flex items-center justify-center text-sterling">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Double-lock verification
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  A record only auto-resolves when a deterministic rule check AND an independent AI judgment both clear 0.75; either one alone isn't enough.
                </p>
              </div>

              {/* Trust Card 3 */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sterling-light/60 border border-sterling-border flex items-center justify-center text-sterling">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Fails closed, not open
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  If anything is uncertain, unclear, or errors out, the record goes to a human by default, every time. Zero silent data overrides.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7 — Live Metrics Strip
           ========================================================================= */}
        <section className="py-16 border-t border-border-subtle bg-surface-subtle/60">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card text-center space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted">
                3-Way Match Rate
              </span>
              <p className="text-3xl font-mono font-bold text-emerald-600 tabular-nums">
                76.7%
              </p>
              <span className="text-[10px] font-mono text-ink-muted">46 matched / 60 total</span>
            </div>

            <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card text-center space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted">
                Ingestion Throughput
              </span>
              <p className="text-3xl font-mono font-bold text-ink-primary tabular-nums">
                4,666 <span className="text-sm font-normal text-ink-muted">rec/s</span>
              </p>
              <span className="text-[10px] font-mono text-ink-muted">Layer 1 deterministic speed</span>
            </div>

            <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card text-center space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted">
                Batch Capacity
              </span>
              <p className="text-3xl font-mono font-bold text-ink-primary tabular-nums">
                12,450+
              </p>
              <span className="text-[10px] font-mono text-ink-muted">SQLite ACID Persisted</span>
            </div>

            <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card text-center space-y-1">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted">
                Anomalies Isolated
              </span>
              <p className="text-3xl font-mono font-bold text-sterling tabular-nums">
                100%
              </p>
              <span className="text-[10px] font-mono text-ink-muted">14 / 14 quarantine traps</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 8 — Footer
           ========================================================================= */}
        <footer className="py-12 border-t border-border-subtle bg-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-ink-muted font-sans">
            <div className="flex items-center gap-3">
              <CertusLogo className="w-6 h-6" textClassName="text-sm font-bold" />
              <span>Autonomous Financial Controller & 3-Way Reconciler</span>
            </div>

            <div className="flex items-center gap-6 font-mono text-[11px]">
              <button onClick={onOpenArchitecture} className="hover:text-ink-primary transition-fast">
                Architecture Blueprint
              </button>
              <button onClick={onOpenSwagger} className="hover:text-ink-primary transition-fast">
                Swagger API
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink-primary transition-fast flex items-center gap-1"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-[11px] font-mono text-ink-muted">
              Certus Autonomous Financial Operating System • Enterprise v2.4
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
