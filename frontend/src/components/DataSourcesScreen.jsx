import React, { useState } from "react";
import { Search, Plus, Building2, Cloud, FolderOpen, MoreVertical, CheckCircle, AlertTriangle } from "lucide-react";

const SOURCES = [
  {
    id: 1,
    name: "Global Corporate Bank",
    type: "Bank API",
    detail: "Acct: ****4892",
    lastSync: "10 mins ago",
    status: "Healthy",
    icon: Building2,
    iconBg: "#FEF2F2",
    iconColor: "#E8384F",
    error: null,
    borderLeft: false,
  },
  {
    id: 2,
    name: "NetSuite ERP",
    type: "ERP System",
    detail: "ID: 8891-ERP",
    lastSync: "1 hr ago",
    status: "Healthy",
    icon: Cloud,
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
    error: null,
    borderLeft: false,
  },
  {
    id: 3,
    name: "AWS S3 Invoices",
    type: "Cloud Storage",
    detail: "Auth Error",
    lastSync: "2 days ago",
    status: "Mismatched",
    icon: FolderOpen,
    iconBg: "#FEF2F2",
    iconColor: "#E8384F",
    error: "Auth Error",
    borderLeft: true,
  },
];

function StatusBadge({ status }) {
  if (status === "Healthy") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Healthy
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>
      <AlertTriangle className="w-3 h-3" />
      Mismatched
    </span>
  );
}

export default function DataSourcesScreen() {
  const [search, setSearch] = useState("");
  const filtered = SOURCES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-primary tracking-tight">Data Sources</h1>
          <p className="text-sm text-ink-muted mt-1 font-sans">Manage integrations with your financial systems.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg,#E8384F,#D02B41)", boxShadow: "0 2px 8px rgba(232,56,79,0.30)" }}>
          <Plus className="w-4 h-4" />
          Add New Source
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="text"
          placeholder="Search data sources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-sm font-sans text-ink-primary placeholder-ink-muted outline-none focus:border-border-strong transition-colors shadow-subtle"
        />
      </div>

      {/* Source Cards */}
      <div className="space-y-3">
        {filtered.map((src) => {
          const Icon = src.icon;
          return (
            <div
              key={src.id}
              className="bg-surface border border-border-subtle rounded-xl p-5 shadow-card hover:shadow-md transition-all cursor-pointer group"
              style={src.borderLeft ? { borderLeft: "3px solid #E8384F" } : {}}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: src.iconBg }}>
                  <Icon className="w-6 h-6" style={{ color: src.iconColor }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-base text-ink-primary">{src.name}</p>
                  </div>
                  <p className="text-sm text-ink-muted font-sans mt-0.5">
                    {src.type}{" · "}
                    {src.error ? (
                      <span className="font-semibold" style={{ color: "#E8384F" }}>{src.detail}</span>
                    ) : (
                      <span className="font-mono text-xs">{src.detail}</span>
                    )}
                  </p>
                </div>

                {/* Last Sync */}
                <div className="text-right mr-4">
                  <p className="text-xs text-ink-muted font-sans">Last Sync</p>
                  <p className="font-semibold text-sm text-ink-primary font-mono">{src.lastSync}</p>
                </div>

                {/* Status */}
                <StatusBadge status={src.status} />

                {/* More menu */}
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors ml-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
