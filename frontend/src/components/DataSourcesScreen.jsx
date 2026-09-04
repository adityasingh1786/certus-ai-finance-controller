import React, { useState } from 'react';
import {
  Search,
  Plus,
  Building2,
  Cloud,
  FolderOpen,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowRight,
  Database,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const SOURCES = [
  {
    id: 1,
    name: 'Razorpay Payment Gateway API',
    type: 'Payment Gateway Rail',
    protocol: 'REST Webhooks (HMAC-SHA256)',
    detail: 'Auth: rzp_live_8829... • Port 443',
    recordsProcessed: '14,250 records / mo',
    lastSync: '12 seconds ago',
    latency: '28ms',
    status: 'Healthy',
    icon: Zap,
    error: null,
  },
  {
    id: 2,
    name: 'HDFC Corporate Bank CMS',
    type: 'Bank Statement Rail',
    protocol: 'Encrypted SFTP (SSH-ED25519)',
    detail: 'Host: sftp.hdfcbank.com:22 • 16-Digit UTR Batch',
    recordsProcessed: '12,890 credits / mo',
    lastSync: '2 mins ago',
    latency: '62ms',
    status: 'Healthy',
    icon: Building2,
    error: null,
  },
  {
    id: 3,
    name: 'ICICI Corporate CMS Direct Rail',
    type: 'Bank Statement Rail',
    protocol: 'Direct Host-to-Host API',
    detail: 'H2H API v2 • RTGS / NEFT / IMPS Stream',
    recordsProcessed: '6,400 credits / mo',
    lastSync: '5 mins ago',
    latency: '45ms',
    status: 'Healthy',
    icon: Building2,
    error: null,
  },
  {
    id: 4,
    name: 'Tally Prime 4.0 ERP Mesh',
    type: 'General Ledger Rail',
    protocol: 'Local XML / ODBC Bridge',
    detail: 'Endpoint: localhost:9000 • Sales Journal #401',
    recordsProcessed: '14,250 vouchers / mo',
    lastSync: '1 min ago',
    latency: '12ms',
    status: 'Healthy',
    icon: Database,
    error: null,
  },
  {
    id: 5,
    name: 'SAP S/4HANA Finance Enterprise',
    type: 'General Ledger Rail',
    protocol: 'OData REST / RFC Connector',
    detail: 'SAP Gateway • Balanced Journal Voucher Mesh',
    recordsProcessed: 'Standby Mirror',
    lastSync: '10 mins ago',
    latency: '74ms',
    status: 'Standby',
    icon: Cloud,
    error: null,
  },
];

export default function DataSourcesScreen() {
  const [search, setSearch] = useState('');
  const [syncingId, setSyncingId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const handleSync = (id) => {
    setSyncingId(id);
    setTimeout(() => setSyncingId(null), 1200);
  };

  const filtered = SOURCES.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.protocol.toLowerCase().includes(search.toLowerCase());
    
    if (selectedFilter === 'ALL') return matchesSearch;
    if (selectedFilter === 'GATEWAY') return matchesSearch && s.type.includes('Gateway');
    if (selectedFilter === 'BANK') return matchesSearch && s.type.includes('Bank');
    if (selectedFilter === 'ERP') return matchesSearch && s.type.includes('General Ledger');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">
            Multi-Rail Data Sources & Integrations
          </h1>
          <p className="text-xs text-ink-muted mt-0.5 font-sans">
            Live connection topology across Payment Gateways, Bank CMS settlement streams, and ERP General Ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSync('all')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-page hover:bg-surface border border-border-subtle text-ink-secondary hover:text-ink-primary text-xs font-medium shadow-subtle transition-fast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingId === 'all' ? 'animate-spin' : ''}`} />
            <span>Poll All Rails</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          <input
            type="text"
            placeholder="Filter data rails, protocols, or ports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border-subtle rounded-md text-xs font-sans text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-border-strong shadow-subtle"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-surface border border-border-subtle rounded-md">
          {['ALL', 'GATEWAY', 'BANK', 'ERP'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-fast ${
                selectedFilter === f
                  ? 'bg-ink-primary text-white shadow-subtle font-semibold'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Source Cards List */}
      <div className="space-y-3">
        {filtered.map((src) => {
          const Icon = src.icon;
          const isSyncing = syncingId === src.id || syncingId === 'all';

          return (
            <div
              key={src.id}
              className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle hover:border-border-strong transition-fast space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-page border border-border-subtle flex items-center justify-center text-ink-primary shrink-0">
                    <Icon className="w-4 h-4 text-ink-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-sm text-ink-primary">{src.name}</h3>
                      <span className="text-[10px] font-mono text-ink-muted bg-page px-1.5 py-0.2 rounded border border-border-subtle">
                        {src.protocol}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted font-mono mt-0.5">{src.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right font-mono text-xs hidden sm:block">
                    <span className="text-[10px] text-ink-muted uppercase block">Throughput / Mo</span>
                    <span className="text-ink-primary font-medium">{src.recordsProcessed}</span>
                  </div>

                  <div className="text-right font-mono text-xs hidden md:block">
                    <span className="text-[10px] text-ink-muted uppercase block">Last Sync</span>
                    <span className="text-ink-primary">{src.lastSync}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {src.status} ({src.latency})
                    </span>

                    <button
                      onClick={() => handleSync(src.id)}
                      disabled={isSyncing}
                      className="p-1.5 rounded-md hover:bg-page border border-border-subtle text-ink-muted hover:text-ink-primary transition-fast"
                      title="Sync rail now"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-ink-primary' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-status line */}
              <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>55 Invariant Rules Validated • 0.00ms Jitter Mesh</span>
                </span>
                <span className="text-ink-secondary">SLA: 99.99% Uptime</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
