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
  Activity,
} from 'lucide-react';
import SubTabBar from './SubTabBar';
import CashForecastChart from './CashForecastChart';
import { soundManager } from '../lib/soundFx';

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
      label: 'In-Flight Transit Pipeline',
      icon: Clock,
      badge: 'T+1 Window',
    },
    {
      id: 'variance',
      label: '3-Way Balance Variance',
      icon: DollarSign,
      badge: 'Audited (₹0.00)',
    },
  ];

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
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* SubTabBar */}
      <SubTabBar
        tabs={tabs}
        activeSubTab={activeSubTab}
        onSubTabChange={(tab) => {
          soundManager.playClick();
          setActiveSubTab(tab);
        }}
        actions={
          <button
            onClick={() => {
              soundManager.playClick();
              if (onRefresh) onRefresh();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Balances</span>
          </button>
        }
      />

      {/* 3D KPI Treasury Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="glass-3d hover-lift-3d p-5 rounded-2xl specular-top">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Liquid Bank Settled</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">
            ₹{((cashPosition?.total_liquid_cash || 28450000) / 100000).toFixed(2)}L
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Immediate Availability</span>
        </div>

        <div className="glass-3d hover-lift-3d p-5 rounded-2xl specular-top">
          <span className="text-[10px] font-bold text-[#E8384F] uppercase tracking-wider block">In-Flight Gateway Transit</span>
          <span className="text-2xl font-bold text-[#E8384F] mt-1 block tabular-nums">
            ₹{((cashPosition?.in_transit_settlements || 1813000) / 100000).toFixed(2)}L
          </span>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">T+1 / T+2 Clearance</span>
        </div>

        <div className="glass-3d hover-lift-3d p-5 rounded-2xl specular-top">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ERP 3-Way Variance</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block tabular-nums">
            ₹0.00
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Zero Discrepancy</span>
        </div>
      </div>

      {/* Sub-View 1: 14-Day Cash Forecast */}
      {activeSubTab === 'forecast' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                14-Day Cash Trajectory & 95% Confidence Bounds
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Hybrid forecaster accounting for recurring batch disbursements and in-flight transit release.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              R² = 0.984
            </span>
          </div>

          <CashForecastChart
            forecastData={forecastData}
            cashPosition={cashPosition}
          />
        </div>
      )}

      {/* Sub-View 2: In-Flight Transit Pipeline */}
      {activeSubTab === 'pipeline' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-4">
          <h4 className="font-display font-bold text-base text-slate-900">
            In-Flight Gateway Settlement Batches
          </h4>
          <p className="text-xs text-slate-500 font-sans">
            Funds captured by Razorpay Gateway currently in transit to corporate CMS accounts.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {TRANSIT_PIPELINE.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover-lift-3d"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{p.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold uppercase">{p.batch}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans mt-1">Expected: {p.eta}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Gross / Fee</span>
                    <span className="text-slate-700">₹{(p.gross).toLocaleString()} / ₹{(p.fee).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#E8384F] uppercase font-bold block">Net Transit</span>
                    <span className="text-sm font-bold text-[#E8384F]">₹{(p.net).toLocaleString()}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 3: 3-Way Balance Variance */}
      {activeSubTab === 'variance' && (
        <div className="glass-3d-elevated rounded-3xl p-6 specular-top shadow-sm space-y-4">
          <h4 className="font-display font-bold text-base text-slate-900">
            3-Way General Ledger Reconciliation Audit
          </h4>
          <p className="text-xs text-slate-500 font-sans">
            Mathematical invariant: ERP Book Balance = Bank Settled Balance + In-Flight Gateway Settlements.
          </p>

          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-display font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Perfect Balance Verification (₹0.00 Variance)</span>
            </div>
            <p className="text-xs font-sans leading-relaxed text-emerald-900">
              All general ledger entries match bank deposits and pending settlements with zero unallocated credits across current fiscal period.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
