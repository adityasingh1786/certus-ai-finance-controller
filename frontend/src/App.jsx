import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import BootScreen from './components/BootScreen';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import UploadReconcileWidget from './components/UploadReconcileWidget';
import MultiSourceReconcileMatrix from './components/MultiSourceReconcileMatrix';
import QuarantineQueue from './components/QuarantineQueue';
import CashForecastChart from './components/CashForecastChart';
import AgentChatPanel from './components/AgentChatPanel';
import RecordAuditDrawer from './components/RecordAuditDrawer';
import ErrorToast from './components/ErrorToast';

// Lazy-loaded heavy modal views
const ArchitectureModal = lazy(() => import('./components/ArchitectureModal'));
const SwaggerModal = lazy(() => import('./components/SwaggerModal'));

import {
  fetchCashPosition,
  fetchCashForecast,
  fetchQuarantineRecords,
  reconcileDemoDataset,
} from './lib/api';

export default function App() {
  // Navigation Flow State: 'boot' -> 'landing' -> 'auth' -> 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('boot');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isReconciling, setIsReconciling] = useState(false);

  // Core Data State
  const [cashPosition, setCashPosition] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [quarantineRecords, setQuarantineRecords] = useState([]);
  const [reconciliationData, setReconciliationData] = useState(null);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState(null);

  // Modals
  const [showArchModal, setShowArchModal] = useState(false);
  const [showSwaggerModal, setShowSwaggerModal] = useState(false);

  // Network Error Toast State
  const [apiError, setApiError] = useState(null);

  // Load Initial Live Backend Data
  const loadInitialData = useCallback(async () => {
    try {
      const [cashRes, forecastRes, qRes] = await Promise.allSettled([
        fetchCashPosition(),
        fetchCashForecast(),
        fetchQuarantineRecords(),
      ]);

      if (cashRes.status === 'fulfilled') setCashPosition(cashRes.value);
      if (forecastRes.status === 'fulfilled') setForecastData(forecastRes.value);
      if (qRes.status === 'fulfilled' && qRes.value?.records) {
        setQuarantineRecords(qRes.value.records);
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated, loadInitialData]);

  // Handle 1-Click Demo Execution from TopBar or Upload Widget
  const handleRunDemo = async () => {
    setIsReconciling(true);
    setApiError(null);
    try {
      const res = await reconcileDemoDataset();
      setReconciliationData(res);
      await loadInitialData();
      setActiveTab('reconcile');
    } catch (err) {
      console.error('Demo execution error:', err);
      setApiError({
        title: 'Reconciliation API Error',
        message: err.message || 'Failed to reach backend reconciliation service.',
        onRetry: handleRunDemo,
      });
    } finally {
      setIsReconciling(false);
    }
  };

  const handleRecordResolved = (recordId) => {
    setQuarantineRecords((prev) =>
      prev.map((r) =>
        r.record_id === recordId || r.transaction_id === recordId
          ? { ...r, is_resolved: true, resolved: true }
          : r
      )
    );
  };

  const unresCount = quarantineRecords.filter((r) => !r.is_resolved && !r.resolved).length;

  // =========================================================================
  // STEP 1: Booting Screen (2.4s sequence -> transitions to Landing Page)
  // =========================================================================
  if (currentScreen === 'boot') {
    return <BootScreen onBootComplete={() => setCurrentScreen('landing')} />;
  }

  // =========================================================================
  // STEP 2: Full 8-Section Long Scrolling Landing Page
  // =========================================================================
  if (currentScreen === 'landing') {
    return (
      <>
        <LandingPage
          onOpenDashboard={() => {
            if (isAuthenticated) {
              setCurrentScreen('dashboard');
            } else {
              setCurrentScreen('auth');
            }
          }}
          onOpenArchitecture={() => setShowArchModal(true)}
          onOpenSwagger={() => setShowSwaggerModal(true)}
        />
        {/* Modals */}
        <Suspense fallback={null}>
          {showArchModal && (
            <ArchitectureModal
              isOpen={showArchModal}
              onClose={() => setShowArchModal(false)}
            />
          )}
        </Suspense>
        <Suspense fallback={null}>
          {showSwaggerModal && (
            <SwaggerModal
              isOpen={showSwaggerModal}
              onClose={() => setShowSwaggerModal(false)}
            />
          )}
        </Suspense>
      </>
    );
  }

  // =========================================================================
  // STEP 3: Enterprise Auth Screen (1-Click Demo Login + Email Form)
  // =========================================================================
  if (currentScreen === 'auth') {
    return (
      <AuthScreen
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setCurrentScreen('dashboard');
        }}
        onBackToLanding={() => setCurrentScreen('landing')}
      />
    );
  }

  // =========================================================================
  // STEP 4: Live Enterprise Financial Controller Dashboard Workspace
  // =========================================================================
  return (
    <div className="min-h-screen bg-page text-ink-primary flex flex-col antialiased">
      {/* 1. Global Top Bar */}
      <TopBar
        onOpenArchitecture={() => setShowArchModal(true)}
        onOpenSwagger={() => setShowSwaggerModal(true)}
        onLoadDemo={handleRunDemo}
        isReconciling={isReconciling}
        onOpenLanding={() => setCurrentScreen('landing')}
      />

      {/* 2. Main App Shell with Navigation Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          exceptionCount={unresCount}
          onOpenArchitecture={() => setShowArchModal(true)}
          onOpenSwagger={() => setShowSwaggerModal(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 min-w-0 overflow-y-auto">
          {/* View 1: Drop & Reconcile (Dashboard) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <UploadReconcileWidget
                onReconcileSuccess={(data) => {
                  setReconciliationData(data);
                  loadInitialData();
                  setActiveTab('reconcile');
                }}
                isProcessing={isReconciling}
                setIsProcessing={setIsReconciling}
              />

              {reconciliationData && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-ink-primary">
                      Reconciliation Results
                    </h3>
                    <button
                      onClick={() => setActiveTab('reconcile')}
                      className="text-xs font-semibold text-sterling hover:underline"
                    >
                      View in Match Matrix →
                    </button>
                  </div>
                  <MultiSourceReconcileMatrix
                    reconciliationData={reconciliationData}
                    onSelectAuditRecord={setSelectedAuditRecord}
                  />
                </div>
              )}
            </div>
          )}

          {/* View 2: Match Matrix */}
          {activeTab === 'reconcile' && (
            <div className="space-y-6">
              <MultiSourceReconcileMatrix
                reconciliationData={reconciliationData}
                onSelectAuditRecord={setSelectedAuditRecord}
              />
            </div>
          )}

          {/* View 3: Quarantine Queue */}
          {activeTab === 'exceptions' && (
            <div className="space-y-6">
              <QuarantineQueue
                records={quarantineRecords}
                onRecordResolved={handleRecordResolved}
                onRefresh={loadInitialData}
                onInspectRecord={setSelectedAuditRecord}
              />
            </div>
          )}

          {/* View 4: Cash & Forecast */}
          {activeTab === 'cash-forecast' && (
            <div className="space-y-6">
              <CashForecastChart
                forecastData={forecastData}
                cashPosition={cashPosition}
                onRefresh={loadInitialData}
              />
            </div>
          )}

          {/* View 5: Financial Copilot */}
          {activeTab === 'copilot' && (
            <div className="space-y-6">
              <AgentChatPanel />
            </div>
          )}
        </main>
      </div>

      {/* 3. Double-Lock Audit Slide-Over Drawer */}
      <RecordAuditDrawer
        record={selectedAuditRecord}
        isOpen={Boolean(selectedAuditRecord)}
        onClose={() => setSelectedAuditRecord(null)}
      />

      {/* 4. Architecture Blueprint Modal */}
      <Suspense fallback={null}>
        {showArchModal && (
          <ArchitectureModal
            isOpen={showArchModal}
            onClose={() => setShowArchModal(false)}
          />
        )}
      </Suspense>

      {/* 5. Interactive Swagger Modal */}
      <Suspense fallback={null}>
        {showSwaggerModal && (
          <SwaggerModal
            isOpen={showSwaggerModal}
            onClose={() => setShowSwaggerModal(false)}
          />
        )}
      </Suspense>

      {/* 6. Dismissible Error Toast */}
      {apiError && (
        <ErrorToast
          title={apiError.title}
          message={apiError.message}
          onRetry={apiError.onRetry}
          onDismiss={() => setApiError(null)}
        />
      )}
    </div>
  );
}
