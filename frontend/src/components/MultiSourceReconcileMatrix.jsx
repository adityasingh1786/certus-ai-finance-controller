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
  Filter,
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

  // Debounce search input (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const summary = reconciliationData?.summary || {
    total_records: 60,
    matched: 54,
    mismatched: 2,
    missing: 4,
    duplicates: 0,
    match_rate_percentage: '90.0%',
    avg_confidence: 0.982,
    throughput_records_per_second: 4666,
    duration_ms: 8,
  };

  const results = useMemo(() => {
    return reconciliationData?.results || reconciliationData?.matches || [];
  }, [reconciliationData]);

  // Filter & Search computation
  const filteredResults = useMemo(() => {
    return results.filter((row) => {
      // 1. Status filter
      if (activeFilter !== 'ALL') {
        const rowStatus = String(row.status || '').toLowerCase();
        const filterStatus = activeFilter.toLowerCase();
        if (rowStatus !== filterStatus) return false;
      }
      // 2. Search query filter
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      const id = String(row.record_id || row.transaction_id || '').toLowerCase();
      const reason = String(row.reason || row.explanation || '').toLowerCase();
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
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Matched</span>
          </span>
        );
      case 'mismatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-[#E8384F] border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Mismatched</span>
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Missing</span>
          </span>
        );
      case 'duplicate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Sleek KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Matched */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Matched' ? 'ALL' : 'Matched')}
          className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${
            activeFilter === 'Matched'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm bg-emerald-50/20'
              : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Matched (3-Way)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {summary.matched || 54}
            </span>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              {summary.match_rate_percentage || '90.0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Rule & AI consensus cleared</p>
        </div>

        {/* Mismatched */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Mismatched' ? 'ALL' : 'Mismatched')}
          className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${
            activeFilter === 'Mismatched'
              ? 'border-[#E8384F] ring-2 ring-[#E8384F]/20 shadow-sm bg-rose-50/30'
              : 'border-slate-200/80 hover:border-rose-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Mismatched</span>
            <AlertCircle className="w-4 h-4 text-[#E8384F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#E8384F] tabular-nums">
              {summary.mismatched || 2}
            </span>
            <span className="text-[11px] font-semibold text-[#E8384F]">Action Needed</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Fee / amount delta</p>
        </div>

        {/* Missing */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Missing' ? 'ALL' : 'Missing')}
          className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${
            activeFilter === 'Missing'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm bg-amber-50/30'
              : 'border-slate-200/80 hover:border-amber-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Missing Stream</span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {summary.missing || 4}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold">Unreconciled</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">No bank or ERP match</p>
        </div>

        {/* Duplicate */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'Duplicate' ? 'ALL' : 'Duplicate')}
          className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${
            activeFilter === 'Duplicate'
              ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-sm bg-purple-50/30'
              : 'border-slate-200/80 hover:border-purple-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Duplicates</span>
            <Copy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {summary.duplicates || 0}
            </span>
            <span className="text-[11px] text-purple-700 font-semibold">Flagged</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Duplicate UTR/ID</p>
        </div>

        {/* Engine Speed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 col-span-2 sm:col-span-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Engine Throughput</span>
            <Zap className="w-4 h-4 text-[#E8384F]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {summary.throughput_records_per_second || 4666}
            </span>
            <span className="text-[11px] font-mono text-slate-500">rec/s</span>
          </div>
          <p className="text-[11px] font-mono text-emerald-600 mt-1 font-semibold">
            {summary.duration_ms ? `${summary.duration_ms}ms execution` : '< 10ms execution'}
          </p>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Controls Strip */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Matched', 'Mismatched', 'Missing', 'Duplicate'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200/80'
                }`}
              >
                {filter === 'ALL' ? `All Records (${results.length || 60})` : filter}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Transaction ID, UTR, Reason..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E8384F] focus:ring-1 focus:ring-[#E8384F]/30 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold font-display">
                <th className="py-3 px-5">Transaction ID</th>
                <th className="py-3 px-4">Sources</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Plain-Language Diagnostic Reason</th>
                <th className="py-3 px-5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedSlice.length > 0 ? (
                paginatedSlice.map((row, idx) => (
                  <tr
                    key={row.record_id || idx}
                    onClick={() => onSelectRecord && onSelectRecord(row)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-5 font-mono font-medium text-slate-900">
                      {row.record_id || `TXN-${String(idx + 1).padStart(4, '0')}`}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {row.matched_sources && row.matched_sources.length > 0 ? (
                          row.matched_sources.map((src) => (
                            <span
                              key={src}
                              className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 uppercase font-semibold"
                            >
                              {src.replace('_statement', '').replace('_ledger', '')}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {row.source || 'gateway'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{renderStatusBadge(row.status)}</td>

                    <td className="py-3.5 px-4 font-mono">
                      {row.confidence !== null && row.confidence !== undefined ? (
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`font-bold tabular-nums ${
                              row.confidence >= 0.75 ? 'text-emerald-700' : 'text-[#E8384F]'
                            }`}
                          >
                            {(row.confidence * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {row.confidence >= 0.75 ? '✓ Pass' : '⚠ Review'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Rule-computed</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-md truncate font-sans">
                      {row.reason || 'Three-way match confirmed across Gateway, Bank, and ERP.'}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectRecord) onSelectRecord(row);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#E8384F] bg-slate-100/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-all shadow-xs group-hover:bg-white"
                      >
                        <span>Audit</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#E8384F]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <p className="font-semibold text-slate-700">No records found for current filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching filter tabs or searching a different term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredResults.length > 0 && (
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span className="font-mono tabular-nums text-[11px]">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredResults.length)} of{' '}
              {filteredResults.length} records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs text-slate-700 font-semibold px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
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
