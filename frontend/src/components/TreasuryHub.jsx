import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import CashForecastChart from './CashForecastChart';

export default function TreasuryHub({
  forecastData,
  cashPosition,
  onRefresh,
}) {
  const [activeSubTab, setActiveSubTab] = useState('forecast');

  const tabs = [
    {
      id: 'forecast',
      label: '14-Day Cash Forecast',
      icon: TrendingUp,
      badge: '95% Confidence',
    },
    {
      id: 'pipeline',
      label: 'Settlement Pipeline',
      icon: Clock,
      badge: 'T+1 Transit',
    },
    {
      id: 'variance',
      label: 'Ledger Variance Analysis',
      icon: DollarSign,
      badge: 'Audited',
    },
  ];

  // In-flight transit pipeline mock dataset
  const TRANSIT_PIPELINE = [
    {
      id: 'pay_Live_98231',
      gross: 450000.0,
      fee: 9000.0,
      net: 441000.0,
      gateway: 'Razorpay PG',
      batch: 'BAT-2026-0814-A',
      eta: '2026-08-16 11:30 AM',
      status: 'In Transit',
    },
    {
      id: 'pay_Live_98232',
      gross: 620000.0,
      fee: 12400.0,
      net: 607600.0,
      gateway: 'Razorpay PG',
      batch: 'BAT-2026-0814-B',
      eta: '2026-08-16 02:00 PM',
      status: 'In Transit',
    },
    {
      id: 'pay_Live_98233',
      gross: 780000.0,
      fee: 15600.0,
      net: 764400.0,
      gateway: 'Razorpay PG',
      batch: 'BAT-2026-0815-A',
      eta: '2026-08-17 10:00 AM',
      status: 'Scheduled',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Nested Sub-Tab Navigation Bar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        actions={
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-page text-ink-secondary hover:text-ink-primary border border-border-subtle text-xs font-semibold transition-fast"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Balances</span>
          </button>
        }
      />

      {/* Sub-View 1: 14-Day Cash Forecast */}
      {activeSubTab === 'forecast' && (
        <div className="space-y-6">
          <CashForecastChart
            forecastData={forecastData}
            cashPosition={cashPosition}
            onRefresh={onRefresh}
          />
        </div>
      )}

      {/* Sub-View 2: In-Flight Settlement Pipeline */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  Razorpay In-Flight Transit Settlements (T+1 / T+2 Pipeline)
                </h3>
                <p className="text-xs text-ink-muted">
                  Funds captured at gateway pending bank NEFT nodal account credit. Included in 14-day cash projections.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-ink-muted uppercase">Total In-Transit</span>
                <p className="text-xl font-bold text-sterling tabular-nums">
                  ₹18,50,000.00
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-[11px] text-ink-muted uppercase">
                    <th className="pb-3 font-semibold">Payment ID</th>
                    <th className="pb-3 font-semibold">Batch</th>
                    <th className="pb-3 font-semibold text-right">Gross Captured</th>
                    <th className="pb-3 font-semibold text-right">MDR Fee</th>
                    <th className="pb-3 font-semibold text-right">Net Bank Credit</th>
                    <th className="pb-3 font-semibold">Estimated Credit</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {TRANSIT_PIPELINE.map((item, idx) => (
                    <tr key={idx} className="hover:bg-page/50 transition-fast">
                      <td className="py-3 font-bold text-ink-primary">{item.id}</td>
                      <td className="py-3 text-ink-muted">{item.batch}</td>
                      <td className="py-3 text-right font-semibold text-ink-primary tabular-nums">
                        ₹{item.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right text-sterling tabular-nums">
                        -₹{item.fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-600 tabular-nums">
                        ₹{item.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-ink-secondary font-sans text-xs">{item.eta}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 3: Ledger Variance Analysis */}
      {activeSubTab === 'variance' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="font-display font-bold text-base text-ink-primary">
                  3-Way Balance Variance & Reconciliation Summary
                </h3>
                <p className="text-xs text-ink-muted">
                  Audited comparison between ERP Book Value, Bank Settled Cash, and Gateway Ingest.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                VARIANCE: ₹0.00 (100% RECONCILED)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-page rounded-xl border border-border-subtle space-y-2">
                <span className="text-xs font-semibold text-ink-muted font-sans uppercase">
                  1. ERP Ledger Book
                </span>
                <p className="text-2xl font-mono font-bold text-ink-primary tabular-nums">
                  ₹1,42,50,000.00
                </p>
                <p className="text-[11px] text-ink-muted font-sans">
                  Total revenue recognized across sales invoices and receivables.
                </p>
              </div>

              <div className="p-5 bg-page rounded-xl border border-border-subtle space-y-2">
                <span className="text-xs font-semibold text-ink-muted font-sans uppercase">
                  2. Bank Settled Cash
                </span>
                <p className="text-2xl font-mono font-bold text-emerald-600 tabular-nums">
                  ₹1,24,00,000.00
                </p>
                <p className="text-[11px] text-ink-muted font-sans">
                  Liquid funds confirmed on bank statement balance.
                </p>
              </div>

              <div className="p-5 bg-page rounded-xl border border-border-subtle space-y-2">
                <span className="text-xs font-semibold text-ink-muted font-sans uppercase">
                  3. In-Flight Transit Settlements
                </span>
                <p className="text-2xl font-mono font-bold text-sterling tabular-nums">
                  ₹18,50,000.00
                </p>
                <p className="text-[11px] text-ink-muted font-sans">
                  Gateway collections currently in T+1 bank clearance window.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
