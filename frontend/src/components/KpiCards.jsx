import React from 'react';
import { Layers, ShieldCheck, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export default function KpiCards({ summary, onCardClick }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Processed',
      value: '₹14,285,400.00',
      sublabel: `${summary?.total_records || 60} Total Transactions`,
      icon: Layers,
      color: 'text-ink-primary',
    },
    {
      id: 'matched',
      label: '3-Way Matched',
      value: '₹14,242,500.00',
      sublabel: `${summary?.match_rate_percentage || '90.0%'} Clearance Rate`,
      icon: ShieldCheck,
      color: 'text-emerald-700',
    },
    {
      id: 'drift',
      label: 'MDR Fee Drift',
      value: '₹4,120.00',
      sublabel: '2 Rate Card Overcharges',
      icon: AlertTriangle,
      color: 'text-sterling',
    },
    {
      id: 'missing',
      label: 'Missing Bank UTR',
      value: '₹38,780.00',
      sublabel: '4 Pending CMS Batches',
      icon: Clock,
      color: 'text-amber-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            onClick={() => onCardClick && onCardClick(c.id)}
            className="bg-surface border border-border-subtle rounded-lg p-4 shadow-subtle hover:border-border-strong transition-fast cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>{c.label}</span>
              <Icon className={`w-3.5 h-3.5 ${c.color}`} />
            </div>
            <p className="font-mono text-lg font-bold text-ink-primary tabular-nums">
              {c.value}
            </p>
            <p className={`text-[11px] font-medium ${c.color}`}>
              {c.sublabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}
