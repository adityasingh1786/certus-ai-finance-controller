'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { api, CashPosition, CashForecast, CashHistoryPoint } from '@/lib/api';

interface CashPositionChartProps {
  refreshTrigger: number;
}

export default function CashPositionChart({ refreshTrigger }: CashPositionChartProps) {
  const [position, setPosition] = useState<CashPosition | null>(null);
  const [forecast, setForecast] = useState<CashForecast | null>(null);
  const [history, setHistory] = useState<CashHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [posData, foreData, histData] = await Promise.all([
          api.getCashPosition(),
          api.getCashForecast(),
          api.getCashHistory('30d'),
        ]);
        setPosition(posData);
        setForecast(foreData);
        setHistory(histData.history || []);
      } catch (err) {
        console.error('Failed to load cash chart data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const chartData = history.map((h) => ({
    date: h.date.slice(5), // MM-DD
    balance: parseFloat(h.balance) || 0,
    inflows: parseFloat(h.inflows) || 0,
  }));

  // Format currency in Indian format
  const formatINR = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      {/* Header with Balance & Forecast Highlights */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Real-Time Treasury Position
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h2 className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {position ? formatINR(position.total_balance) : '₹0'}
            </h2>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              <TrendingUp className="w-3 h-3" /> Reconciled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {position?.total_records || 0} validated records across {position?.accounts.length || 1} currency streams
          </p>
        </div>

        {/* Forecast Card Badge */}
        {forecast && (
          <div className="bg-gradient-to-r from-blue-950/50 to-cyan-950/40 border border-cyan-500/30 rounded-xl p-3.5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-300 font-medium">7-Day Projected Position</span>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                  WMA Model
                </span>
              </div>
              <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                {formatINR(forecast.projected_balance)}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Band: {formatINR(forecast.confidence_band_low)} — {formatINR(forecast.confidence_band_high)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-[230px] w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            Loading telemetry series...
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3395FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="inflowGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.08)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(13, 19, 31, 0.95)',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any) => [formatINR(value), '']}
              />
              <Area type="monotone" dataKey="balance" stroke="#3395FF" strokeWidth={2.5} fillOpacity={1} fill="url(#balanceGlow)" name="Net Cash Balance" />
              <Area type="monotone" dataKey="inflows" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#inflowGlow)" name="Daily Inflow" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            No historical settlements available yet
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Net Position
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Inflows
          </span>
        </div>
        <span>Pending In-Flight: {position ? formatINR(position.total_pending) : '₹0'}</span>
      </div>
    </div>
  );
}
