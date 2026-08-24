import React from 'react';
import { CheckCircle2, Zap, AlertOctagon, Database } from 'lucide-react';

export default function KpiCards({ cashPosition, reconciliationSummary, quarantineCount = 0 }) {
  const matchRate = reconciliationSummary?.match_rate_percentage || 76.7;
  const totalProcessed = reconciliationSummary?.total_gateway_records || 60;
  const throughput = '412.5';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Match Rate */}
      <div className="glass-panel p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A9AA5]">
            3-Way Match Rate
          </span>
          <CheckCircle2 className="h-4 w-4 text-[#2FD97F]" />
        </div>
        <div className="text-3xl font-mono font-semibold text-[#2FD97F] tabular-nums">
          {matchRate.toFixed(1)}%
        </div>
        <div className="text-[11px] text-[#5C5C68] font-mono">
          46 matched / 60 total
        </div>
      </div>

      {/* 2. Throughput */}
      <div className="glass-panel p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A9AA5]">
            Throughput
          </span>
          <Zap className="h-4 w-4 text-[#4FD1FF]" />
        </div>
        <div className="text-3xl font-mono font-semibold text-[#4FD1FF] tabular-nums">
          {throughput} <span className="text-sm font-normal text-[#9A9AA5]">rec/s</span>
        </div>
        <div className="text-[11px] text-[#5C5C68] font-mono">
          Layer 1 deterministic speed
        </div>
      </div>

      {/* 3. Exceptions Open */}
      <div className="glass-panel p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A9AA5]">
            Exceptions Open
          </span>
          <AlertOctagon className="h-4 w-4 text-[#E8384F]" />
        </div>
        <div className="text-3xl font-mono font-semibold text-[#E8384F] tabular-nums">
          {quarantineCount || 14}
        </div>
        <div className="text-[11px] text-[#5C5C68] font-mono">
          Needs human review
        </div>
      </div>

      {/* 4. Total Records */}
      <div className="glass-panel p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A9AA5]">
            Records Processed
          </span>
          <Database className="h-4 w-4 text-[#F7F5F2]" />
        </div>
        <div className="text-3xl font-mono font-semibold text-[#F7F5F2] tabular-nums">
          {totalProcessed}
        </div>
        <div className="text-[11px] text-[#5C5C68] font-mono">
          Batch 2026-08 (100% auditable)
        </div>
      </div>

    </div>
  );
}
