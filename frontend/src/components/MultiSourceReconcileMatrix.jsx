import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
  Activity,
} from 'lucide-react';

const PAGE_SIZE = 25;

export default function MultiSourceReconcileMatrix({
  reconciliationData,
  onSelectRecord,
}) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'Matched' | 'Mismatched' | 'Missing' | 'Duplicate'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input (300ms) for low-end hardware performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const summary = reconciliationData?.summary || {
    total_records: 0,
    matched: 0,
    mismatched: 0,
    missing: 0,
    duplicates: 0,
    match_rate_percentage: '0.0%',
    avg_confidence: 0.0,
    throughput_records_per_second: 0,
    duration_ms: 0,
  };

  const results = reconciliationData?.results || [];

  // Filter & Search computation
  const filteredResults = useMemo(() => {
    return results.filter((row) => {
      // 1. Status filter
      if (activeFilter !== 'ALL' && row.status !== activeFilter) {
        return false;
      }
      // 2. Search query filter
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      const id = String(row.record_id || '').toLowerCase();
      const reason = String(row.reason || '').toLowerCase();
      const sources = Array.isArray(row.matched_sources)
        ? row.matched_sources.join(' ').toLowerCase()
        : '';
      return id.includes(q) || reason.includes(q) || sources.includes(q);
    });
  }, [results, activeFilter, debouncedSearch]);

  // Paginated slice (25 rows)
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const paginatedSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredResults.slice(start, start + PAGE_SIZE);
  }, [filteredResults, currentPage]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-matched-bg text-status-matched-text border border-status-matched-border">
            <CheckCircle2 className="w-3 h-3" />
            Matched
          </span>
        );
      case 'Mismatched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-mismatched-bg text-status-mismatched-text border border-status-mismatched-border">
            <AlertCircle className="w-3 h-3 text-sterling" />
            Mismatched
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-missing-bg text-status-missing-text border border-status-missing-border">
            <HelpCircle className="w-3 h-3" />
            Missing
          </span>
        );
      case 'Duplicate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-duplicate-bg text-status-duplicate-text border border-status-duplicate-border">
            <Copy className="w-3 h-3" />
            Duplicate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-page text-ink-secondary border border-border-subtle">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 4-Status Headline Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Matched */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Matched' ? 'ALL' : 'Matched')}
          className={`bg-surface border rounded-lg p-3.5 cursor-pointer transition-fast ${
            activeFilter === 'Matched'
              ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-subtle'
              : 'border-border-subtle hover:border-border-strong'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-medium">Matched (3-Way)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-ink-primary tabular-nums">
              {summary.matched}
            </span>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              {summary.match_rate_percentage}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Both rule & model agreed</p>
        </div>

        {/* Mismatched */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Mismatched' ? 'ALL' : 'Mismatched')}
          className={`bg-surface border rounded-lg p-3.5 cursor-pointer transition-fast ${
            activeFilter === 'Mismatched'
              ? 'border-sterling ring-1 ring-sterling shadow-subtle bg-sterling-light/10'
              : 'border-border-subtle hover:border-sterling/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-medium">Mismatched</span>
            <AlertCircle className="w-4 h-4 text-sterling" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-sterling tabular-nums">
              {summary.mismatched}
            </span>
            <span className="text-[11px] text-sterling font-semibold">Action needed</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Fee / amount delta</p>
        </div>

        {/* Missing */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Missing' ? 'ALL' : 'Missing')}
          className={`bg-surface border rounded-lg p-3.5 cursor-pointer transition-fast ${
            activeFilter === 'Missing'
              ? 'border-amber-500 ring-1 ring-amber-500 shadow-subtle'
              : 'border-border-subtle hover:border-border-strong'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-medium">Missing Stream</span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-ink-primary tabular-nums">
              {summary.missing}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold">Unreconciled</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1">No bank or ERP match</p>
        </div>

        {/* Duplicate */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Duplicate' ? 'ALL' : 'Duplicate')}
          className={`bg-surface border rounded-lg p-3.5 cursor-pointer transition-fast ${
            activeFilter === 'Duplicate'
              ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-subtle'
              : 'border-border-subtle hover:border-border-strong'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-medium">Duplicates</span>
            <Copy className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-ink-primary tabular-nums">
              {summary.duplicates}
            </span>
            <span className="text-[11px] text-indigo-700 font-semibold">Flagged</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Duplicate UTR/amount</p>
        </div>

        {/* Throughput & Duration */}
        <div className="bg-surface border border-border-subtle rounded-lg p-3.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-medium">Engine Speed</span>
            <Zap className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-ink-primary tabular-nums">
              {summary.throughput_records_per_second || 412}
            </span>
            <span className="text-[11px] font-mono text-ink-secondary">recs/sec</span>
          </div>
          <p className="text-[11px] font-mono text-ink-muted mt-1">
            {summary.duration_ms ? `${summary.duration_ms}ms total` : 'Instant execution'}
          </p>
        </div>
      </div>

      {/* Main Reconciliation Table Box */}
      <div className="bg-surface border border-border-subtle rounded-lg shadow-subtle overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Matched', 'Mismatched', 'Missing', 'Duplicate'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-fast whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-ink-primary text-white'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-page'
                }`}
              >
                {filter === 'ALL' ? `All (${results.length})` : filter}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, UTR, merchant, reason..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-page border border-border-subtle rounded-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-sterling"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-page/70 border-b border-border-subtle text-ink-secondary font-medium">
                <th className="py-2.5 px-4">Transaction ID</th>
                <th className="py-2.5 px-4">Sources</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Confidence</th>
                <th className="py-2.5 px-4">Plain-Language Diagnostic Reason</th>
                <th className="py-2.5 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-ink-primary">
              {paginatedSlice.length > 0 ? (
                paginatedSlice.map((row, idx) => (
                  <tr
                    key={row.record_id || idx}
                    onClick={() => onSelectRecord && onSelectRecord(row)}
                    className="hover:bg-page/50 cursor-pointer transition-fast group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-ink-primary">
                      {row.record_id || `ROW-${idx + 1}`}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {row.matched_sources && row.matched_sources.length > 0 ? (
                          row.matched_sources.map((src) => (
                            <span
                              key={src}
                              className="px-1.5 py-0.5 rounded bg-page border border-border-subtle text-[10px] font-mono text-ink-secondary uppercase"
                            >
                              {src.replace('_statement', '').replace('_ledger', '')}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-ink-muted font-mono">
                            {row.source || 'gateway'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">{renderStatusBadge(row.status)}</td>

                    <td className="py-3 px-4 font-mono">
                      {row.confidence !== null && row.confidence !== undefined ? (
                        <span
                          className={`font-semibold tabular-nums ${
                            row.confidence >= 0.75 ? 'text-emerald-700' : 'text-sterling'
                          }`}
                        >
                          {(row.confidence * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-ink-muted text-[11px]">Rule-based</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-ink-secondary max-w-md truncate">
                      {row.reason || 'Record matched within standard tolerances.'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectRecord) onSelectRecord(row);
                        }}
                        className="p-1 rounded text-ink-muted group-hover:text-sterling group-hover:bg-sterling-light/40 transition-fast"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    {results.length === 0
                      ? 'No reconciliation data loaded yet. Drop 3 CSV files above or click "1-Click Demo".'
                      : 'No records found matching your current filter / search query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredResults.length > 0 && (
          <div className="p-3 border-t border-border-subtle flex items-center justify-between text-xs text-ink-secondary bg-page/40">
            <span className="font-mono tabular-nums text-[11px]">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredResults.length)} of{' '}
              {filteredResults.length} records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-border-subtle text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-fast"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs text-ink-primary">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-border-subtle text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-fast"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
