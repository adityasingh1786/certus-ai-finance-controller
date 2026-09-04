import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  DollarSign,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import CashForecastChart from './CashForecastChart';

export default function TreasuryHub({
  reconciliationData,
  forecastData,
  cashPosition,
  onRefresh,
}) {
  const [activeSubTab, setActiveSubTab] = useState('forecast');

  const scenarioNum = useMemo(() => {
    const raw = reconciliationData?.scenario_id;
    if (typeof raw === 'object' && raw !== null) return raw.id || 1;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') return parseInt(raw, 10) || 1;
    return 1;
  }, [reconciliationData]);

  const scenarioName = reconciliationData?.scenario_name || 'D2C Fashion & Apparel — Festive Flash Sale';
  const primaryBank = reconciliationData?.primary_bank || 'HDFC Bank CMS';
  const erpSystem = reconciliationData?.erp_system || 'Tally Prime 4.0';

  const tabs = [
    { id: 'forecast', label: 'Cash Forecast', icon: TrendingUp },
    { id: 'pipeline', label: 'Transit Pipeline', icon: Clock, badge: '3 Batches' },
    { id: 'variance', label: 'Balance Variance', icon: DollarSign, badge: '₹0.00' },
  ];

  const TRANSIT_PIPELINE = useMemo(() => {
    return [
      { id: `pay_Live_SC${String(scenarioNum).padStart(2, '0')}_01`, gross: 450000.0, fee: 9000.0, net: 441000.0, gateway: 'Razorpay', bank: primaryBank, batch: `BAT-2026-SC${String(scenarioNum).padStart(2, '0')}-A`, eta: '2026-08-16 11:30 AM', status: 'In Transit' },
      { id: `pay_Live_SC${String(scenarioNum).padStart(2, '0')}_02`, gross: 620000.0, fee: 12400.0, net: 607600.0, gateway: 'Razorpay', bank: primaryBank, batch: `BAT-2026-SC${String(scenarioNum).padStart(2, '0')}-B`, eta: '2026-08-16 02:00 PM', status: 'In Transit' },
      { id: `pay_Live_SC${String(scenarioNum).padStart(2, '0')}_03`, gross: 780000.0, fee: 15600.0, net: 764400.0, gateway: 'Razorpay', bank: primaryBank, batch: `BAT-2026-SC${String(scenarioNum).padStart(2, '0')}-C`, eta: '2026-08-17 10:00 AM', status: 'Scheduled' },
    ];
  }, [scenarioNum, primaryBank]);

  return (
    <div className="space-y-5">

      {/* Sub-Tab Bar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        actions={
          <button
            onClick={() => onRefresh && onRefresh()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-[12px] font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* KPI Metric Ticker */}
      <div className="surface-inset rounded-xl px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide block">Liquid Bank Settled</span>
            <span className="text-xl font-semibold text-slate-900 mt-1 block tabular-nums font-mono">
              ₹{((cashPosition?.total_liquid_cash || 28450000) / 100000).toFixed(2)}L
            </span>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">{primaryBank}</span>
          </div>

          <div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide block">In-Flight Transit</span>
            <span className="text-xl font-semibold text-amber-700 mt-1 block tabular-nums font-mono">
              ₹{((cashPosition?.in_transit_settlements || 1813000) / 100000).toFixed(2)}L
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">T+1 / T+2 Window</span>
          </div>

          <div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide block">3-Way Variance</span>
            <span className="text-xl font-semibold text-emerald-700 mt-1 block tabular-nums font-mono">
              ₹0.00
            </span>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Zero Unallocated</span>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      {activeSubTab === 'forecast' && (
        <div className="surface-elevated p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">14-Day Cash Trajectory</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Scenario #{String(scenarioNum).padStart(2, '0')} dynamic cash curve with in-flight settlement accruals.
              </p>
            </div>
            <span className="pill-matched px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold">
              R² = 0.984
            </span>
          </div>
          <CashForecastChart forecastData={forecastData} cashPosition={cashPosition} />
        </div>
      )}

      {/* Transit Pipeline */}
      {activeSubTab === 'pipeline' && (
        <div className="surface-elevated p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Settlement Batches In-Flight</h4>
              <p className="text-[12px] text-slate-500">
                Funds in transit to <strong>{primaryBank}</strong>.
              </p>
            </div>
            <span className="pill-missing px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold">
              3 Batches
            </span>
          </div>

          <div className="space-y-2 font-mono text-[12px]">
            {TRANSIT_PIPELINE.map((p, idx) => (
              <div key={idx} className="surface-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{p.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200 font-semibold uppercase">{p.batch}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Razorpay → <strong>{p.bank}</strong> · ETA: {p.eta}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Gross / Fee</span>
                    <span className="text-slate-600">₹{p.gross.toLocaleString()} / ₹{p.fee.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Net</span>
                    <span className="font-semibold text-slate-900">₹{p.net.toLocaleString()}</span>
                  </div>
                  <span className="pill-missing px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balance Variance */}
      {activeSubTab === 'variance' && (
        <div className="surface-elevated p-6 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900">3-Way General Ledger Reconciliation</h4>
          <p className="text-[12px] text-slate-500">
            {erpSystem} Book Balance = {primaryBank} Settled + In-Flight Gateway.
          </p>

          <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Perfect Balance (₹0.00 Variance)</span>
            </div>
            <p className="text-[12px] text-emerald-700">
              All ledger entries match bank deposits and pending settlements with zero unallocated credits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
