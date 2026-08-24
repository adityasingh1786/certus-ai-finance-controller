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
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import MultiSourceReconcileMatrix from './MultiSourceReconcileMatrix';
import UploadReconcileWidget from './UploadReconcileWidget';

export default function ReconciliationHub({
  reconciliationData,
  onSelectAuditRecord,
  onRunDemo,
  isReconciling,
  onReconcileSuccess,
  setIsProcessing,
}) {
  const [activeSubTab, setActiveSubTab] = useState('matrix');
  const [searchTerm, setSearchTerm] = useState('');

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
      badge: records.length ? `${records.length} Records` : undefined,
    },
    {
      id: 'ingest',
      label: 'Drop & Ingest',
      icon: Upload,
      badge: '20 Scenarios',
    },
    {
      id: 'audit',
      label: 'Double-Lock Trail',
      icon: ShieldCheck,
      badge: '≥ 0.75 Gate',
    },
  ];

  // Export CSV handler
  const handleExportCsv = () => {
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
  };

  return (
    <div className="space-y-6">
      {/* SubTabBar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunDemo && onRunDemo(null)}
              disabled={isReconciling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8384F] hover:bg-[#d42d43] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isReconciling ? 'Reconciling...' : '🎲 Random Scenario'}</span>
            </button>

            {activeSubTab === 'matrix' && records.length > 0 && (
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-all"
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
          {/* Fluid Modern Active Scenario Header */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-50/50 to-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-[#E8384F]/10 text-[#E8384F] border border-[#E8384F]/20 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {reconciliationData?.sector || 'E-Commerce & Retail'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#E8384F]">
                    SCENARIO #{String(scenarioNum).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1 font-display">
                  {scenarioName}
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  {reconciliationData?.description || 'High-volume UPI & credit card sales spike with standard 2.0% MDR + 18% GST deductions.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start md:self-auto font-mono text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-xs">
                {reconciliationData?.primary_bank || 'HDFC Bank CMS'}
              </span>
              <span className="text-slate-300 font-bold">↔</span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-xs">
                {reconciliationData?.erp_system || 'Tally Prime 4.0'}
              </span>
            </div>
          </div>

          {/* Clean Integrated Match Matrix */}
          <MultiSourceReconcileMatrix
            reconciliationData={reconciliationData}
            onSelectRecord={onSelectAuditRecord}
          />
        </div>
      )}

      {/* Sub-View 2: Drop & Ingest */}
      {activeSubTab === 'ingest' && (
        <div className="space-y-6">
          {/* 20-Scenario Grid Selector */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900">
                  Select from 20 Enterprise Financial Scenarios
                </h4>
                <p className="text-xs text-slate-500 font-sans">
                  Click any scenario to instantly test Certus with domain-specific 4-channel real-world data streams.
                </p>
              </div>
              <button
                onClick={() => onRunDemo && onRunDemo(null)}
                disabled={isReconciling}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8384F] hover:bg-[#d42d43] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎲 Surprise Me</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 1, name: 'D2C Fashion Flash Sale', sector: 'Retail' },
                { id: 2, name: 'B2B SaaS Milestone Invoicing', sector: 'SaaS' },
                { id: 3, name: 'Quick Commerce 10-Min Delivery', sector: 'Q-Comm' },
                { id: 4, name: 'NBFC Loan EMI Disbursals', sector: 'Credit' },
                { id: 5, name: 'Hospital TPA Insurance Co-Pay', sector: 'Health' },
                { id: 6, name: 'EdTech Subscription Platform', sector: 'EdTech' },
                { id: 7, name: 'FoodTech Marketplace Split', sector: 'Food' },
                { id: 8, name: 'Ride-Hailing Fleet Cashouts', sector: 'Mobility' },
                { id: 9, name: 'Cross-Border IT Services Remittance', sector: 'Export' },
                { id: 10, name: 'Luxury Hotel Pre-Auth Capture', sector: 'Travel' },
                { id: 11, name: 'Automotive EV Dealership Advance', sector: 'Auto' },
                { id: 12, name: 'Freight Logistics COD Batches', sector: 'Logistics' },
                { id: 13, name: 'Solar Renewable IPP Tariffs', sector: 'Energy' },
                { id: 14, name: 'Gaming In-App Currency Tokens', sector: 'Gaming' },
                { id: 15, name: 'Real Estate Escrow Pool RERA', sector: 'Property' },
                { id: 16, name: 'Pharma Wholesale E-Way Bills', sector: 'Pharma' },
                { id: 17, name: 'Telecom Postpaid Auto-Mandate', sector: 'Telco' },
                { id: 18, name: 'Omnichannel POS Terminal Swipes', sector: 'POS' },
                { id: 19, name: 'OTT Media Recurring Subscriptions', sector: 'Media' },
                { id: 20, name: 'Supply Chain Invoice Factoring', sector: 'Trade' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    if (onRunDemo) onRunDemo(sc.id);
                    setActiveSubTab('matrix');
                  }}
                  disabled={isReconciling}
                  className={`p-3 rounded-xl border text-left transition-all group disabled:opacity-50 ${
                    scenarioNum === sc.id
                      ? 'border-[#E8384F] bg-rose-50/40 shadow-xs ring-1 ring-[#E8384F]/30'
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#E8384F]">#{String(sc.id).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 uppercase">{sc.sector}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1.5 group-hover:text-[#E8384F] transition-colors line-clamp-1">{sc.name}</p>
                </button>
              ))}
            </div>
          </div>

          <UploadReconcileWidget
            onReconcileSuccess={(data) => {
              if (onReconcileSuccess) onReconcileSuccess(data);
              setActiveSubTab('matrix');
            }}
            isProcessing={isReconciling}
            setIsProcessing={setIsProcessing}
          />
        </div>
      )}

      {/* Sub-View 3: Double-Lock Trail */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
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

            {/* Signal Weights Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
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

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
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

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
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
        </div>
      )}
    </div>
  );
}
