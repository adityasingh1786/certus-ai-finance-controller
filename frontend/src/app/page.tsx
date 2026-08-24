'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import UploadWidget from '@/components/UploadWidget';
import SummaryCard from '@/components/SummaryCard';
import CashPositionChart from '@/components/CashPositionChart';
import ReconciliationMatrix from '@/components/ReconciliationMatrix';
import QuarantineQueue from '@/components/QuarantineQueue';
import ChatPanel from '@/components/ChatPanel';
import { api, BatchSummary } from '@/lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [latestSummary, setLatestSummary] = useState<BatchSummary | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUploadSuccess = (summary: BatchSummary) => {
    setLatestSummary(summary);
    setRefreshTrigger((prev) => prev + 1);
    showToast(`Batch processed: ${summary.passed} passed, ${summary.quarantined} quarantined`);
  };

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      const resp = await api.loadDemoDataset();
      setLatestSummary(resp.summary);
      setRefreshTrigger((prev) => prev + 1);
      showToast('✅ 60-Record Demo Batch Ingested: 53 Clean, 7 Quarantined');
    } catch (err: any) {
      showToast(`❌ Demo load failed: ${err.message}`);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <main className="min-h-screen pb-16">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadDemo={handleLoadDemo}
        loadingDemo={loadingDemo}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-xl shadow-glow-cyan text-xs font-mono animate-in fade-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-6">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Row: Ingestion Upload Widget + Ingestion Verification Report */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <UploadWidget onUploadSuccess={handleUploadSuccess} />
              </div>
              <div className="lg:col-span-7">
                <SummaryCard summary={latestSummary} />
              </div>
            </div>

            {/* Middle Row: Real-Time Cash Position & Predictive Forecasting Chart */}
            <CashPositionChart refreshTrigger={refreshTrigger} />

            {/* Bottom Row: Multi-Source 3-Way Reconciliation Matrix (Gateway ↔ Bank ↔ ERP) */}
            <ReconciliationMatrix refreshTrigger={refreshTrigger} />

            {/* Bottom Row: Quarantine Queue with Human-in-the-Loop Action */}
            <QuarantineQueue
              refreshTrigger={refreshTrigger}
              onRecordResolved={() => {
                setRefreshTrigger((prev) => prev + 1);
                showToast('Record resolved and updated in immutable audit log');
              }}
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <ChatPanel />
          </div>
        )}
      </div>
    </main>
  );
}
