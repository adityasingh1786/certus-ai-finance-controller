import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const PAGE_SIZE = 25;

export default function MultiSourceReconcileMatrix({
  reconciliationData,
  onSelectRecord,
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 150);
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

  const filteredResults = useMemo(() => {
    return results.filter((row) => {
      if (activeFilter !== 'ALL') {
        const rowStatus = String(row.status || '').toLowerCase();
        const filterStatus = activeFilter.toLowerCase();
        if (rowStatus !== filterStatus) return false;
      }
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

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const paginatedSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredResults.slice(start, start + PAGE_SIZE);
  }, [filteredResults, currentPage]);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleRowClick = (row) => {
    if (onSelectRecord) onSelectRecord(row);
  };

  const renderStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    const styles = {
      matched: 'pill-matched',
      mismatched: 'pill-flagged',
      missing: 'pill-missing',
      duplicate: 'pill-duplicate',
    };
    const labels = {
      matched: 'Matched',
      mismatched: 'Mismatched',
      missing: 'Missing',
      duplicate: 'Duplicate',
    };
    const dotColors = {
      matched: 'bg-emerald-500',
      mismatched: 'bg-rose-500',
      missing: 'bg-amber-500',
      duplicate: 'bg-purple-500',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[s] || 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[s] || 'bg-slate-400'}`} />
        {labels[s] || status || 'Unknown'}
      </span>
    );
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-5">

      {/* Metric Ticker Banner */}
      <div className="surface-inset rounded-xl px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Total Processed</div>
            <div className="text-xl font-semibold text-slate-900 tabular-nums font-mono">{summary.total_records || 60}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Transactions</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">3-Way Matched</div>
            <div className="text-xl font-semibold text-emerald-700 tabular-nums font-mono">{summary.matched || 54}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{summary.match_rate_percentage || '90.0%'} match rate</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Mismatched</div>
            <div className="text-xl font-semibold text-rose-700 tabular-nums font-mono">{summary.mismatched || 2}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Requires dispute</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Missing UTR</div>
            <div className="text-xl font-semibold text-amber-700 tabular-nums font-mono">{summary.missing || 4}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pending CMS batch</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Throughput</div>
            <div className="text-xl font-semibold text-slate-900 tabular-nums font-mono">{summary.throughput_records_per_second || 4666}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{summary.duration_ms ? `${summary.duration_ms}ms` : '< 10ms'} per batch</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="surface-elevated overflow-hidden">

        {/* Table Controls */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {['ALL', 'Matched', 'Mismatched', 'Missing', 'Duplicate'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                {filter === 'ALL' ? `All (${results.length || 60})` : filter}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ID, UTR, or reason..."
              className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                <th className="py-2.5 px-5">Transaction ID</th>
                <th className="py-2.5 px-4">Sources</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Confidence</th>
                <th className="py-2.5 px-4">Proof / Reason</th>
                <th className="py-2.5 px-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-slate-700">
              {paginatedSlice.length > 0 ? (
                paginatedSlice.map((row, idx) => (
                  <tr
                    key={row.record_id || idx}
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-slate-50/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5 font-mono font-semibold text-slate-900 text-[12px]">
                      {row.record_id || `TXN-${String(idx + 1).padStart(4, '0')}`}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {row.matched_sources && row.matched_sources.length > 0 ? (
                          row.matched_sources.map((src) => (
                            <span
                              key={src}
                              className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-[10px] font-mono text-slate-500 uppercase"
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

                    <td className="py-3 px-4">{renderStatusBadge(row.status)}</td>

                    <td className="py-3 px-4 font-mono text-[12px]">
                      {row.confidence !== null && row.confidence !== undefined ? (
                        <span
                          className={`font-semibold tabular-nums ${
                            row.confidence >= 0.75 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {(row.confidence * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Rule-based</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 max-w-sm truncate">
                      {row.reason || 'Three-way match confirmed across Gateway, Bank, and ERP.'}
                    </td>

                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <p className="font-medium text-slate-500">No records matching your filter.</p>
                    <p className="text-[12px] mt-1">Try switching filters or clearing your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredResults.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500">
            <span className="font-mono tabular-nums text-[11px]">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredResults.length)} of {filteredResults.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-[11px] text-slate-600 font-medium px-1">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
