import React, { useState, useEffect } from "react";
import { Bell, Search, HelpCircle } from "lucide-react";
import SignalGridBackground from "./components/SignalGridBackground";
import BootScreen from "./components/BootScreen";
import Sidebar from "./components/Sidebar";
import CertusLogo from "./components/CertusLogo";

// Screens
import DashboardScreen from "./components/DashboardScreen";
import ReconciliationWorkspace from "./components/ReconciliationWorkspace";
import TransactionDetailView from "./components/TransactionDetailView";
import CashPositionScreen from "./components/CashPositionScreen";
import CopilotScreen from "./components/CopilotScreen";
import AuditLogsScreen from "./components/AuditLogsScreen";
import LedgerAnalysisScreen from "./components/LedgerAnalysisScreen";
import DataSourcesScreen from "./components/DataSourcesScreen";
import SettingsScreen from "./components/SettingsScreen";

function TopBar({ activeTab }) {
  const TAB_TITLES = {
    dashboard: "Executive Dashboard",
    reconciliation: "Reconciliation Workspace",
    "audit-logs": "Audit Logs",
    "ledger-analysis": "Ledger Analysis",
    copilot: "Certus AI Copilot",
    "cash-position": "Cash Position",
    settings: "Settings",
    support: "Support",
  };

  return (
    <header className="h-14 border-b border-border-subtle bg-surface flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Certus branding */}
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-lg text-sterling tracking-tight">Certus</span>
        <span className="text-border-strong text-xs">|</span>
        <div className="flex items-center gap-3 text-sm text-ink-muted font-sans">
          <button className="hover:text-ink-primary transition-colors font-medium">Q3 Audit</button>
          <button className="hover:text-ink-primary transition-colors font-medium">Live Feed</button>
        </div>
      </div>

      {/* Right: Search + Nav */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search records, entities..."
            className="pl-9 pr-4 py-1.5 bg-surface-subtle border border-border-subtle rounded-lg text-sm font-sans text-ink-primary placeholder-ink-muted outline-none focus:border-border-strong transition-colors w-60"
          />
        </div>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-sterling flex items-center justify-center text-white text-sm font-display font-bold flex-shrink-0">
          A
        </div>
      </div>
    </header>
  );
}

function MainContent({ activeTab, onTabChange }) {
  const [txnRecord, setTxnRecord] = useState(null);

  if (activeTab === "reconciliation" && txnRecord) {
    return (
      <main className="flex-1 overflow-y-auto min-h-0 bg-page">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          <TransactionDetailView record={txnRecord} onBack={() => setTxnRecord(null)} />
        </div>
      </main>
    );
  }

  const SCREENS = {
    dashboard: <DashboardScreen />,
    reconciliation: (
      <ReconciliationWorkspace
        onSelectRecord={(r) => {
          if (r.status === "MISMATCHED") setTxnRecord(r);
        }}
      />
    ),
    "audit-logs": <AuditLogsScreen />,
    "ledger-analysis": <LedgerAnalysisScreen />,
    copilot: <CopilotScreen />,
    "cash-position": <CashPositionScreen />,
    settings: <SettingsScreen />,
    support: (
      <div className="flex flex-col items-center justify-center py-24 text-ink-muted">
        <HelpCircle className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">Support documentation coming soon.</p>
      </div>
    ),
  };

  const screen = SCREENS[activeTab] || SCREENS.dashboard;

  const isCopilot = activeTab === "copilot";

  return (
    <main className="flex-1 overflow-y-auto min-h-0 bg-page relative">
      <SignalGridBackground />
      {isCopilot ? (
        <div className="relative z-10 h-full flex flex-col">{screen}</div>
      ) : (
        <div className="relative z-10 max-w-[1200px] mx-auto px-8 py-8">{screen}</div>
      )}
    </main>
  );
}

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-page text-ink-primary antialiased font-sans">
      {isBooting && <BootScreen onBootComplete={() => setIsBooting(false)} />}
      {!isBooting && (
        <div className="flex flex-col h-screen overflow-hidden">
          <TopBar activeTab={activeTab} />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <MainContent activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      )}
    </div>
  );
}
