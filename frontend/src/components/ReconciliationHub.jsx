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
    return reconciliationData?.results || [];
  }, [reconciliationData]);

  // Sub-tab definitions
  const tabs = [
    {
      id: 'matrix',
      label: '3-Way Match Matrix',
      icon: Layers,
      badge: records.length ? records.length : undefined,
    },
    {
      id: 'ingest',
      label: 'Drop & Ingest',
      icon: Upload,
      badge: '3 Streams',
    },
    {
      id: 'audit',
      label: 'Double-Lock Trail',
      icon: ShieldCheck,
      badge: '0.75 Gate',
    },
  ];

  // Export CSV handler
  const handleExportCsv = () => {
    if (!records.length) {
      alert('No reconciliation data available to export. Run a reconciliation run first.');
      return;
    }

    const headers = ['Transaction ID', 'Gateway ID', 'Bank UTR', 'ERP Invoice', 'Amount', 'Status', 'Confidence', 'Reason'];
    const rows = records.map((r) => [
      r.transaction_id || '',
      r.gateway_record?.payment_id || r.gateway_id || '',
      r.bank_record?.utr || r.bank_utr || '',
      r.erp_record?.invoice_id || r.erp_id || '',
      r.amount || r.gateway_record?.amount || 0,
      r.status || 'UNKNOWN',
      r.confidence_score !== undefined ? r.confidence_score : 1.0,
      `"${(r.explanation || r.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `certus_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Nested Sub-Tab Navigation Bar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        searchTerm={searchTerm}
        onSearchChange={activeSubTab === 'matrix' ? setSearchTerm : null}
        searchPlaceholder="Filter by ID, UTR, invoice..."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onRunDemo}
              disabled={isReconciling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sterling hover:bg-sterling-hover text-white text-xs font-semibold shadow-subtle transition-fast disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isReconciling ? 'Reconciling...' : '1-Click Demo'}</span>
            </button>

            {activeSubTab === 'matrix' && (
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-page text-ink-secondary hover:text-ink-primary border border-border-subtle text-xs font-semibold transition-fast"
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
          {/* Active Enterprise Scenario Banner */}
          {reconciliationData?.scenario_name && (
            <div className="p-4 rounded-2xl border border-border-subtle bg-gradient-to-r from-surface to-page shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-sterling/10 text-sterling border border-sterling/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {reconciliationData.sector || 'E-Commerce'}
                    </span>
                    <span className="text-xs font-mono font-bold text-sterling">
                      SCENARIO #{String(reconciliationData.scenario_id || 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-ink-primary mt-0.5 font-display">
                    {reconciliationData.scenario_name}
                  </h4>
                  <p className="text-xs text-ink-muted line-clamp-1">{reconciliationData.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-ink-secondary">
                  {reconciliationData.primary_bank || 'HDFC Bank CMS'}
                </span>
                <span className="text-border-subtle">↔</span>
                <span className="px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-ink-secondary">
                  {reconciliationData.erp_system || 'Tally Prime'}
                </span>
              </div>
            </div>
          )}

          <MultiSourceReconcileMatrix
            reconciliationData={reconciliationData}
            onSelectAuditRecord={onSelectAuditRecord}
            externalFilter={searchTerm}
          />
        </div>
      )}

      {/* Sub-View 2: Drop & Ingest */}
      {activeSubTab === 'ingest' && (
        <div className="space-y-6">
          {/* 20-Scenario Enterprise Preset Selector */}
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-ink-primary">
                  Select from 20 Enterprise Financial Scenarios
                </h4>
                <p className="text-xs text-ink-muted">
                  Test Certus with 4-channel real-world data profiles across D2C, B2B SaaS, Quick Commerce, NBFC, and more.
                </p>
              </div>
              <button
                onClick={() => onRunDemo && onRunDemo(null)}
                disabled={isReconciling}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sterling hover:bg-sterling-hover text-white text-xs font-semibold shadow-subtle transition-fast disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎲 Random Scenario</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                { id: 1, name: 'D2C Fashion Flash Sale', sector: 'Retail' },
                { id: 2, name: 'B2B SaaS Milestone Invoicing', sector: 'SaaS' },
                { id: 3, name: 'Quick Commerce 10-Min Delivery', sector: 'Q-Comm' },
                { id: 4, name: 'NBFC Loan EMI Disbursals', sector: 'Credit' },
                { id: 5, name: 'Hospital TPA Insurance Co-Pay', sector: 'Health' },
                { id: 6, name: 'EdTech Subscription Platform', sector: 'EdTech' },
                { id: 7, name: 'FoodTech Marketplace Split', sector: 'Food' },
                { id: 8, name: 'Ride-Hailing Fleet Cashouts', sector: 'Mobility' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => onRunDemo && onRunDemo(sc.id)}
                  disabled={isReconciling}
                  className="p-3 rounded-xl border border-border-subtle bg-page hover:bg-surface hover:border-sterling/40 text-left transition-fast group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sterling">#{String(sc.id).padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-ink-muted uppercase">{sc.sector}</span>
                  </div>
                  <p className="text-xs font-semibold text-ink-primary mt-1 group-hover:text-sterling transition-fast line-clamp-1">{sc.name}</p>
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

      {/* Sub-View 3: Double-Lock Trail & Consensus Specs */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Double-Lock Gating Matrix & Consensus Specifications
                </h3>
                <p className="text-xs text-ink-muted">
                  Every auto-resolved record requires both deterministic rule clearance and AI consensus.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                THRESHOLD: ≥ 0.75
              </span>
            </div>

            {/* Signal Weights Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-page rounded-xl border border-border-subtle space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-ink-primary">Signal 1: Exact Amount</span>
                  <span className="font-mono font-bold text-sterling">50% Weight</span>
                </div>
                <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
                  <div className="bg-sterling h-full rounded-full" style={{ width: '50%' }} />
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Gross invoice match with gateway net settlement adjustment for MDR and TDS deductions.
                </p>
              </div>

              <div className="p-4 bg-page rounded-xl border border-border-subtle space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-ink-primary">Signal 2: Reference & UTR</span>
                  <span className="font-mono font-bold text-sterling">30% Weight</span>
                </div>
                <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
                  <div className="bg-sterling h-full rounded-full" style={{ width: '30%' }} />
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Bank UTR checksum extraction and RapidFuzz entity matching on vendor/customer names.
                </p>
              </div>

              <div className="p-4 bg-page rounded-xl border border-border-subtle space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-ink-primary">Signal 3: Date Proximity</span>
                  <span className="font-mono font-bold text-sterling">20% Weight</span>
                </div>
                <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
                  <div className="bg-sterling h-full rounded-full" style={{ width: '20%' }} />
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Settlement transit window verification within standard T+1 / T+2 banking cycles.
                </p>
              </div>
            </div>

            {/* Consensus Relay Architecture Summary */}
            <div className="p-4 bg-page rounded-xl border border-border-subtle space-y-3">
              <span className="text-xs font-display font-bold text-ink-primary block">
                Layer 2 Consensus Relay Pipeline (Serial Escalation)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-surface rounded-lg border border-border-subtle text-center">
                  <span className="text-[10px] text-ink-muted uppercase block">Hop 1 (Speed)</span>
                  <span className="font-bold text-ink-primary">Groq LLaMA 3.3</span>
                  <span className="text-[10px] text-emerald-600 block mt-1">~120ms Latency</span>
                </div>
                <div className="p-3 bg-surface rounded-lg border border-border-subtle text-center">
                  <span className="text-[10px] text-ink-muted uppercase block">Hop 2 (Independent)</span>
                  <span className="font-bold text-ink-primary">Google Gemini 2.5</span>
                  <span className="text-[10px] text-emerald-600 block mt-1">Early Exit Gate</span>
                </div>
                <div className="p-3 bg-surface rounded-lg border border-border-subtle text-center">
                  <span className="text-[10px] text-ink-muted uppercase block">Hop 3 (Dissent)</span>
                  <span className="font-bold text-ink-primary">OpenAI GPT-4o</span>
                  <span className="text-[10px] text-amber-600 block mt-1">Tiebreaker Hop</span>
                </div>
                <div className="p-3 bg-surface rounded-lg border border-border-subtle text-center">
                  <span className="text-[10px] text-ink-muted uppercase block">Hop 4 (Senior)</span>
                  <span className="font-bold text-ink-primary">Claude 3.5 Sonnet</span>
                  <span className="text-[10px] text-purple-600 block mt-1">Final Authority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
