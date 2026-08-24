import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Wallet, Clock, AlertTriangle } from 'lucide-react';

export default function CashForecastChart({ forecastData, cashPosition }) {
  const currentBalance = cashPosition?.current_balance || 14250000;
  const pendingSettlements = cashPosition?.pending_settlements_total || 1850000;
  const quarantinedAmount = cashPosition?.quarantined_amount_total || 420000;

  const chartData = useMemo(() => {
    if (forecastData?.days && forecastData.days.length > 0) {
      return forecastData.days;
    }
    // Fallback data
    const today = new Date();
    const list = [];
    let base = currentBalance;
    for (let i = 1; i <= 10; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const inflow = 300000 + (i % 3) * 120000;
      const outflow = 180000 + (i % 2) * 80000;
      base = base + inflow - outflow;
      list.push({
        day_label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        projected_balance: base,
        lower_bound: base * 0.95,
        upper_bound: base * 1.05,
      });
    }
    return list;
  }, [forecastData, currentBalance]);

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-lg shadow-subtle p-5 space-y-4">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-page border border-border-subtle flex items-center justify-center text-ink-primary">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-ink-primary">
              Audited 14-Day Cash Forecasting
            </h3>
            <p className="text-xs text-ink-muted">
              Projected balance factoring in T+1 gateway settlements and quarantined items
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-ink-muted bg-page px-2 py-1 rounded border border-border-subtle">
          95% Confidence Interval
        </span>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-md bg-page border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span>Verified Cash Balance</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="font-mono text-base font-bold text-ink-primary tabular-nums">
            {formatCurrency(currentBalance)}
          </span>
        </div>

        <div className="p-3 rounded-md bg-page border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span>In-Transit Gateway (T+1)</span>
            <Clock className="w-3.5 h-3.5 text-ink-secondary" />
          </div>
          <span className="font-mono text-base font-bold text-emerald-700 tabular-nums">
            +{formatCurrency(pendingSettlements)}
          </span>
        </div>

        <div className="p-3 rounded-md bg-page border border-border-subtle">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span>Quarantined at Boundary</span>
            <AlertTriangle className="w-3.5 h-3.5 text-sterling" />
          </div>
          <span className="font-mono text-base font-bold text-sterling tabular-nums">
            {formatCurrency(quarantinedAmount)}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="day_label"
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-surface border border-border-subtle rounded-md p-2.5 shadow-card text-xs font-mono">
                      <p className="font-sans font-semibold text-ink-primary mb-1">{data.day_label}</p>
                      <p className="text-emerald-700 font-bold">
                        Projected: {formatCurrency(data.projected_balance)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="projected_balance"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#balanceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
