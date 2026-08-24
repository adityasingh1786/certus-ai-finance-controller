import React, { useState, useMemo } from 'react';
import {
  Layers,
  Upload,
  ShieldCheck,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Copy,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
  Activity,
  Zap,
  ArrowRight,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import MultiSourceReconcileMatrix from './MultiSourceReconcileMatrix';
import UploadReconcileWidget from './UploadReconcileWidget';
import { soundManager } from '../lib/soundFx';

export default function ReconciliationHub({
  reconciliationData,
  onSelectAuditRecord,
  onRunDemo,
  isReconciling,
  onReconcileSuccess,
  setIsProcessing,
}) {
  const [activeSubTab, setActiveSubTab] = useState('matrix');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [timeTravelStage, setTimeTravelStage] = useState('T+2'); // 'T+0' | 'T+1' | 'T+2'

  const records = useMemo(() => {
    return reconciliationData?.results || reconciliationData?.matches || [];
  }, [reconciliationData]);

  // Clean scenario number and name extraction
  const scenarioNum = useMemo(() => {
    const raw = reconciliationData?.scenario_id;
    if (typeof raw === 'object' && raw !== null) return raw.id || 1;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') return parseInt(raw, 10) || 1;
    return 1;
  }, [reconciliationData]);

  const scenarioName = useMemo(() => {
    const raw = reconciliationData?.scenario_name;
    if (typeof raw === 'object' && raw !== null) return raw.name || 'D2C Fashion & Apparel — Festive Flash Sale';
    return raw || 'D2C Fashion & Apparel — Festive Flash Sale';
  }, [reconciliationData]);

  // Sub-tab definitions
  const tabs = [
    {
      id: 'matrix',
      label: '3-Way Match Matrix',
      icon: Layers,
      badge: records.length ? `${records.length} Records` : '60 Records',
    },
    {
      id: 'ingest',
      label: '20 Enterprise Scenarios',
      icon: Sparkles,
      badge: '4 Channels',
    },
    {
      id: 'upload',
      label: 'Drop & Ingest CSV',
      icon: Upload,
    },
    {
      id: 'audit',
      label: 'Double-Lock Trail',
      icon: ShieldCheck,
      badge: '≥ 0.75 Gate',
    },
  ];

  // 20 Scenarios organized into 5 sectors
  const ALL_SCENARIOS = [
    { id: 1, name: 'D2C Fashion Flash Sale', sector: 'E-Commerce', bank: 'HDFC Bank CMS', erp: 'Tally Prime' },
    { id: 2, name: 'B2B SaaS Milestone Invoicing', sector: 'SaaS', bank: 'ICICI Bank', erp: 'NetSuite' },
    { id: 3, name: 'Quick Commerce 10-Min Delivery', sector: 'E-Commerce', bank: 'Axis Bank', erp: 'SAP S/4HANA' },
    { id: 4, name: 'NBFC Loan EMI Disbursals', sector: 'FinTech', bank: 'State Bank of India', erp: 'Oracle GL' },
    { id: 5, name: 'Hospital TPA Insurance Co-Pay', sector: 'Healthcare', bank: 'Kotak Mahindra', erp: 'SAP ERP' },
    { id: 6, name: 'EdTech Subscription Platform', sector: 'SaaS', bank: 'HDFC Bank', erp: 'Zoho Books' },
    { id: 7, name: 'FoodTech Marketplace Split', sector: 'E-Commerce', bank: 'ICICI CMS', erp: 'Tally Prime' },
    { id: 8, name: 'Ride-Hailing Fleet Cashouts', sector: 'FinTech', bank: 'Axis Bank', erp: 'Custom GL' },
    { id: 9, name: 'Cross-Border IT Services Wire', sector: 'SaaS', bank: 'Citibank N.A.', erp: 'Oracle Fusion' },
    { id: 10, name: 'Luxury Hotel Pre-Auth Capture', sector: 'Hospitality', bank: 'HDFC CMS', erp: 'Opera Cloud' },
    { id: 11, name: 'Automotive EV Dealership Advance', sector: 'Industrial', bank: 'SBI Corporate', erp: 'SAP S/4HANA' },
    { id: 12, name: 'Freight Logistics COD Batches', sector: 'Logistics', bank: 'ICICI Bank', erp: 'Tally Prime' },
    { id: 13, name: 'Solar Renewable IPP Tariffs', sector: 'Industrial', bank: 'Power Finance', erp: 'SAP ERP' },
    { id: 14, name: 'Gaming In-App Currency Tokens', sector: 'FinTech', bank: 'Yes Bank', erp: 'Custom Postgres' },
    { id: 15, name: 'Real Estate Escrow Pool RERA', sector: 'FinTech', bank: 'HDFC Escrow', erp: 'NetSuite' },
    { id: 16, name: 'Pharma Wholesale E-Way Bills', sector: 'Healthcare', bank: 'Kotak Bank', erp: 'SAP S/4HANA' },
    { id: 17, name: 'Telecom Postpaid Auto-Mandate', sector: 'SaaS', bank: 'SBI CMS', erp: 'Oracle BRM' },
    { id: 18, name: 'Omnichannel POS Terminal Swipes', sector: 'E-Commerce', bank: 'Axis Bank', erp: 'Tally Prime' },
    { id: 19, name: 'OTT Media Recurring Subscriptions', sector: 'SaaS', bank: 'HDFC Bank', erp: 'Chargebee GL' },
    { id: 20, name: 'Supply Chain Invoice Factoring', sector: 'FinTech', bank: 'ICICI TReDS', erp: 'SAP S/4HANA' },
  ];

  const filteredScenarios = useMemo(() => {
    if (selectedSector === 'ALL') return ALL_SCENARIOS;
    return ALL_SCENARIOS.filter(s => s.sector === selectedSector);
  }, [selectedSector]);

  // Export CSV handler
  const handleExportCsv = () => {
    soundManager.playClick();
    if (!records.length) {
      alert('No reconciliation data available to export.');
      return;
    }

    const headers = ['Record ID', 'Source', 'Status', 'Confidence', 'Reason'];
    const rows = records.map((r) => [
      r.record_id || r.transaction_id || '',
      r.source || 'gateway',
      r.status || 'Matched',
      r.confidence !== undefined ? r.confidence : 1.0,
      `"${(r.reason || r.explanation || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `certus_scenario_${scenarioNum}_reconciliation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundManager.playMatchChime();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* SubTabBar Navigation */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={(tab) => {
          soundManager.playClick();
          setActiveSubTab(tab);
        }}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                if (onRunDemo) onRunDemo(null);
              }}
              disabled={isReconciling}
              className="shimmer-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E8384F] hover:bg-[#d42d43] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isReconciling ? 'Reconciling...' : '🎲 Random Scenario'}</span>
            </button>

            {records.length > 0 && (
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        }
      />

      {/* Sub-View 1: 3-Way Match Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          
          {/* 🌊 1. Liquid Settlement Flow Stream Visualizer */}
          <div className="glass-3d p-4 rounded-2xl specular-top space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#E8384F]" />
                <span className="font-display font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  4-Channel Liquid Settlement Stream
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● Live Streaming Sync
              </span>
            </div>

            {/* Liquid Channel Connectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block">Channel 1: Gateway</span>
                <span className="text-slate-900 font-bold mt-1 block">60 Captures (₹14.25M)</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Instant Auth</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block">Channel 2: Bank CMS</span>
                <span className="text-slate-900 font-bold mt-1 block">{reconciliationData?.primary_bank || 'HDFC Bank CMS'}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Net UTR Settled</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block">Channel 3: ERP Ledger</span>
                <span className="text-slate-900 font-bold mt-1 block">{reconciliationData?.erp_system || 'Tally Prime 4.0'}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Invoices Posted</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 shadow-xs">
                <span className="text-[10px] text-[#E8384F] font-bold block">Channel 4: Quarantine</span>
                <span className="text-[#E8384F] font-bold mt-1 block">4 Isolated Traps</span>
                <span className="text-[10px] text-[#E8384F] font-semibold">Layer 1 Fail-Closed</span>
              </div>
            </div>
          </div>

          {/* ⏳ 2. Active Scenario Command Header & Time-Travel Scrubber */}
          <div className="glass-3d-elevated p-5 rounded-3xl specular-top shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-[#E8384F] border border-rose-200 shadow-xs mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-mono">
                    {reconciliationData?.sector || 'E-Commerce & Retail'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#E8384F]">
                    SCENARIO #{String(scenarioNum).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1 font-display">
                  {scenarioName}
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5 max-w-xl">
                  {reconciliationData?.description || 'High-volume UPI & credit card sales spike with standard 2.0% MDR + 18% GST deductions.'}
                </p>
              </div>
            </div>

            {/* Time-Travel Transit Scrubber */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 font-mono text-xs self-start md:self-auto">
              <span className="text-[10px] text-slate-400 font-bold px-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Transit:
              </span>
              {['T+0', 'T+1', 'T+2'].map((stage) => (
                <button
                  key={stage}
                  onClick={() => {
                    soundManager.playClick();
                    setTimeTravelStage(stage);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    timeTravelStage === stage
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 3D Floating Match Matrix */}
          <MultiSourceReconcileMatrix
            reconciliationData={reconciliationData}
            onSelectRecord={onSelectAuditRecord}
          />
        </div>
      )}

      {/* Sub-View 2: 20 Enterprise Scenarios Switcher */}
      {activeSubTab === 'ingest' && (
        <div className="space-y-6">
          <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h4 className="font-display font-bold text-base text-slate-900">
                  Select from 20 Enterprise Financial Domains
                </h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Click any scenario to instantly test Certus with domain-specific 4-channel real-world data streams.
                </p>
              </div>

              {/* Sector Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'E-Commerce', 'SaaS', 'FinTech', 'Healthcare', 'Industrial'].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedSector(sec);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
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

            {/* 20 Scenarios Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {filteredScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    soundManager.playClick();
                    if (onRunDemo) onRunDemo(sc.id);
                    setActiveSubTab('matrix');
                  }}
                  disabled={isReconciling}
                  className={`p-4 rounded-2xl border text-left transition-all group disabled:opacity-50 hover-lift-3d ${
                    scenarioNum === sc.id
                      ? 'border-[#E8384F] bg-rose-50/50 shadow-xs ring-1 ring-[#E8384F]/30'
                      : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#E8384F]">#{String(sc.id).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 uppercase">{sc.sector}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-2 group-hover:text-[#E8384F] transition-colors line-clamp-1">{sc.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{sc.bank} ↔ {sc.erp}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 3: Drop & Ingest CSV */}
      {activeSubTab === 'upload' && (
        <UploadReconcileWidget
          onReconcileSuccess={(data) => {
            soundManager.playMatchChime();
            if (onReconcileSuccess) onReconcileSuccess(data);
            setActiveSubTab('matrix');
          }}
          isProcessing={isReconciling}
          setIsProcessing={setIsProcessing}
        />
      )}

      {/* Sub-View 4: Double-Lock Trail */}
      {activeSubTab === 'audit' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Double-Lock Gating Matrix & Consensus Specifications
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Every auto-resolved record requires both deterministic rule clearance and AI consensus.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              THRESHOLD: ≥ 0.75
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-3d p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800">Signal 1: Exact Amount</span>
                <span className="font-mono font-bold text-[#E8384F]">50% Weight</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#E8384F] h-full rounded-full" style={{ width: '50%' }} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Gross invoice match with gateway net settlement adjustment for MDR and TDS deductions.
              </p>
            </div>

            <div className="glass-3d p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800">Signal 2: Reference & UTR</span>
                <span className="font-mono font-bold text-[#E8384F]">30% Weight</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#E8384F] h-full rounded-full" style={{ width: '30%' }} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Bank UTR checksum extraction and RapidFuzz entity matching on vendor/customer names.
              </p>
            </div>

            <div className="glass-3d p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800">Signal 3: Date Proximity</span>
                <span className="font-mono font-bold text-[#E8384F]">20% Weight</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#E8384F] h-full rounded-full" style={{ width: '20%' }} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Settlement transit window verification within standard T+1 / T+2 banking cycles.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
