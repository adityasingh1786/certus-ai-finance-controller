import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ReconciliationHub from './components/ReconciliationHub';
import QuarantineHub from './components/QuarantineHub';
import TreasuryHub from './components/TreasuryHub';
import CopilotHub from './components/CopilotHub';
import GovernanceHub from './components/GovernanceHub';
import DashboardScreen from './components/DashboardScreen';
import DataSourcesScreen from './components/DataSourcesScreen';
import AuditLogsScreen from './components/AuditLogsScreen';
import LedgerAnalysisScreen from './components/LedgerAnalysisScreen';
import SettingsScreen from './components/SettingsScreen';
import RecordAuditDrawer from './components/RecordAuditDrawer';
import PipelineTelemetryModal from './components/PipelineTelemetryModal';
import CommandPaletteModal from './components/CommandPaletteModal';
import ErrorToast from './components/ErrorToast';
import SingularityBootScreen from './components/SingularityBootScreen';
import {
  fetchCashPosition,
  fetchCashForecast,
  fetchQuarantineRecords,
  reconcileDemoDataset,
  fetchScenarioCatalog,
} from './lib/api';
import { soundManager } from './lib/soundFx';

// Lazy-loaded secondary modals to preserve fast bundle load
const ArchitectureModal = lazy(() => import('./components/ArchitectureModal'));
const SwaggerModal = lazy(() => import('./components/SwaggerModal'));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal'));

export default function App() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing' | 'auth' | 'dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('recon'); // 'recon' | 'quarantine' | 'treasury' | 'copilot' | 'governance'

  // Modal Visibility States
  const [showArchModal, setShowArchModal] = useState(false);
  const [showSwaggerModal, setShowSwaggerModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState(null);

  // Live Operational Financial Data States
  const [reconciliationData, setReconciliationData] = useState(null);
  const [quarantineRecords, setQuarantineRecords] = useState([]);
  const [cashPosition, setCashPosition] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [scenarioCatalog, setScenarioCatalog] = useState([]);
  const [pendingDemoData, setPendingDemoData] = useState(null);

  // Loading & Processing States
  const [isReconciling, setIsReconciling] = useState(false);
  const [apiError, setApiError] = useState(null);

  // 1. Load Initial Live Backend Data & Scenario Catalog
  const loadInitialData = useCallback(async () => {
    try {
      const [cashRes, forecastRes, qRes, reconRes, scRes] = await Promise.allSettled([
        fetchCashPosition(),
        fetchCashForecast(),
        fetchQuarantineRecords(),
        reconcileDemoDataset(1),
        fetchScenarioCatalog(),
      ]);

      if (cashRes.status === 'fulfilled') setCashPosition(cashRes.value);
      if (forecastRes.status === 'fulfilled') setForecastData(forecastRes.value);
      if (qRes.status === 'fulfilled' && qRes.value?.records) {
        setQuarantineRecords(qRes.value.records);
      }
      if (reconRes.status === 'fulfilled' && reconRes.value) {
        setReconciliationData(reconRes.value);
        if (reconRes.value.exceptions && reconRes.value.exceptions.length > 0) {
          setQuarantineRecords(reconRes.value.exceptions);
        }
      }
      if (scRes.status === 'fulfilled' && scRes.value?.scenarios) {
        setScenarioCatalog(scRes.value.scenarios);
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  }, []);

  // Mute sound effects by default for a professional experience
  useEffect(() => {
    try { soundManager.mute(); } catch (_) {}
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated, loadInitialData]);

  // 3. Global Keyboard Shortcuts Listener (Cmd/Ctrl + K, Hotkeys 1-5)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K -> Toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      // Hotkeys 1-5 for hub switching (only if not typing in inputs)
      const targetTag = document.activeElement?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        try { soundManager.playClick(); } catch (_) {}
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey) {
        try { soundManager.playClick(); } catch (_) {}
        setShowSwaggerModal((prev) => !prev);
      } else if (e.key === '0') {
        try { soundManager.playClick(); } catch (_) {}
        setActiveTab('dashboard');
      } else if (e.key === '1') {
        try { soundManager.playClick(); } catch (_) {}
        setActiveTab('recon');
      } else if (e.key === '2') {
        try { soundManager.playClick(); } catch (_) {}
        setActiveTab('quarantine');
      } else if (e.key === '3') {
        try { soundManager.playClick(); } catch (_) {}
        setActiveTab('treasury');
      } else if (e.key === '4') {
        try { soundManager.playClick(); } catch (_) {}
        setActiveTab('copilot');
      } else if (e.key === '5') {
        try { soundManager.playClick(); } catch (_) {}
        setActiveTab('governance');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 4. Handle 1-Click Demo Execution — Launches Cinematic Telemetry HUD
  const handleRunDemo = async (scenarioId = null) => {
    try { soundManager.playClick(); } catch (_) {}
    setIsReconciling(true);
    setApiError(null);
    setShowTelemetryModal(true);

    // Compute random non-repeating scenario ID if null
    let targetId = scenarioId;
    if (!targetId) {
      const currentId = reconciliationData?.scenario_id || 1;
      const available = Array.from({ length: 20 }, (_, i) => i + 1).filter((id) => id !== currentId);
      targetId = available[Math.floor(Math.random() * available.length)] || (currentId === 20 ? 1 : currentId + 1);
    }

    try {
      const res = await reconcileDemoDataset(targetId);
      setPendingDemoData(res);
      setReconciliationData(res);
      if (res.exceptions && res.exceptions.length > 0) {
        setQuarantineRecords(res.exceptions);
      }

      // Synchronously refresh Treasury & Cash Position for new scenario
      try {
        const [cashRes, forecastRes] = await Promise.allSettled([
          fetchCashPosition(),
          fetchCashForecast(),
        ]);
        if (cashRes.status === 'fulfilled') setCashPosition(cashRes.value);
        if (forecastRes.status === 'fulfilled') setForecastData(forecastRes.value);
      } catch (_) {}

      try { soundManager.playMatchChime(); } catch (_) {}
    } catch (err) {
      console.error('Demo execution error:', err);
      setApiError(err.message || 'Demo reconciliation failed.');
      try { soundManager.playErrorBuzzer(); } catch (_) {}
    } finally {
      setIsReconciling(false);
    }
  };

  const handleTelemetryComplete = async () => {
    if (pendingDemoData) {
      setReconciliationData(pendingDemoData);
      if (pendingDemoData.exceptions && pendingDemoData.exceptions.length > 0) {
        setQuarantineRecords(pendingDemoData.exceptions);
      }
    }
    setActiveTab('recon');
    setShowTelemetryModal(false);
  };

  // Quarantine exception resolution handler with atomic summary sync
  const handleRecordResolved = (recordId, action, updatedSummary = null) => {
    try { soundManager.playMatchChime(); } catch (_) {}
    setQuarantineRecords((prev) =>
      prev.map((r) =>
        (r.record_id === recordId || r.transaction_id === recordId)
          ? { ...r, is_resolved: true, resolved: true, resolution_action: action }
          : r
      )
    );

    if (updatedSummary) {
      setReconciliationData((prev) => (prev ? { ...prev, summary: updatedSummary } : prev));
    }
  };

  const activeExceptions = quarantineRecords.filter((r) => !r.is_resolved && !r.resolved);
  const unresCount = activeExceptions.length > 0 ? activeExceptions.length : (reconciliationData?.exceptions?.length || 4);

  return (
    <>
      {/* =========================================================================
          STEP 1: 3D Holographic Singularity Booting Screen
         ========================================================================= */}
      {currentScreen === 'boot' && (
        <SingularityBootScreen
          onBootComplete={() => setCurrentScreen('landing')}
        />
      )}

      {/* =========================================================================
          STEP 2: Interactive Particle Landing Page
         ========================================================================= */}
      {currentScreen === 'landing' && (
        <LandingPage
          onOpenAuth={() => setCurrentScreen('auth')}
          onOpenArchitecture={() => setShowArchModal(true)}
          onOpenSwagger={() => setShowSwaggerModal(true)}
        />
      )}

      {/* =========================================================================
          STEP 3: Enterprise Auth Screen
         ========================================================================= */}
      {currentScreen === 'auth' && (
        <AuthScreen
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setCurrentScreen('dashboard');
          }}
          onBackToLanding={() => setCurrentScreen('landing')}
        />
      )}

      {/* =========================================================================
          STEP 4: Fixed Sovereign Financial Controller Operating System Workspace
         ========================================================================= */}
      {currentScreen === 'dashboard' && isAuthenticated && (
        <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col antialiased select-none">
          
          {/* Fixed Sovereign TopBar (64px) */}
          <TopBar
            activeTab={activeTab}
            reconciliationData={reconciliationData}
            scenarioCatalog={scenarioCatalog}
            onRunScenario={handleRunDemo}
            onOpenArchitecture={() => setShowArchModal(true)}
            onOpenSwagger={() => setShowSwaggerModal(true)}
            onLoadDemo={() => handleRunDemo(null)}
            isReconciling={isReconciling}
            onOpenLanding={() => setCurrentScreen('landing')}
            onLogout={() => {
              setIsAuthenticated(false);
              setCurrentScreen('landing');
            }}
            onOpenCommandPalette={() => setShowCommandPalette(true)}
          />

          {/* Fixed Sovereign Viewport Body Split */}
          <div className="flex-1 flex w-full relative">
            {/* Fixed Acrylic Sidebar (260px) */}
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              exceptionCount={unresCount}
            />

            {/* Fluid Momentum Central Workspace */}
            <main className="ml-60 mt-14 h-[calc(100vh-56px)] flex-1 p-8 overflow-y-auto overflow-x-hidden space-y-6">
              
              {/* Screen 0: Executive Dashboard */}
              {activeTab === 'dashboard' && (
                <DashboardScreen
                  reconciliationData={reconciliationData}
                  cashPosition={cashPosition}
                  quarantineRecords={quarantineRecords}
                  onNavigateTab={setActiveTab}
                />
              )}

              {/* Hub 1: 3-Way Match Matrix Hub */}
              {activeTab === 'recon' && (
                <ReconciliationHub
                  reconciliationData={reconciliationData}
                  scenarioCatalog={scenarioCatalog}
                  onSelectAuditRecord={setSelectedAuditRecord}
                  onRunDemo={handleRunDemo}
                  onRunScenario={handleRunDemo}
                  isReconciling={isReconciling}
                  onReconcileSuccess={(data) => {
                    setReconciliationData(data);
                    if (data.exceptions) setQuarantineRecords(data.exceptions);
                    loadInitialData();
                  }}
                  setIsProcessing={setIsReconciling}
                />
              )}

              {/* Hub 2: Quarantine & Exceptions Hub */}
              {activeTab === 'quarantine' && (
                <QuarantineHub
                  records={quarantineRecords}
                  reconciliationData={reconciliationData}
                  onRecordResolved={handleRecordResolved}
                  onRefresh={loadInitialData}
                  onInspectRecord={setSelectedAuditRecord}
                />
              )}

              {/* Hub 3: Treasury & Liquidity Hub */}
              {activeTab === 'treasury' && (
                <TreasuryHub
                  reconciliationData={reconciliationData}
                  forecastData={forecastData}
                  cashPosition={cashPosition}
                  onRefresh={loadInitialData}
                />
              )}

              {/* Hub 4: Autonomous Copilot Hub */}
              {activeTab === 'copilot' && (
                <CopilotHub
                  reconciliationData={reconciliationData}
                  quarantineRecords={quarantineRecords}
                  onInspectRecord={setSelectedAuditRecord}
                />
              )}

              {/* Hub 5: System Governance Hub */}
              {activeTab === 'governance' && (
                <GovernanceHub
                  reconciliationData={reconciliationData}
                  onOpenArchitecture={() => setShowArchModal(true)}
                  onOpenSwagger={() => setShowSwaggerModal(true)}
                />
              )}

              {/* Screen 6: Ledger Variance & Financial Analytics */}
              {activeTab === 'ledger' && (
                <LedgerAnalysisScreen />
              )}

              {/* Screen 7: Multi-Rail Data Sources & Connectors */}
              {activeTab === 'datasources' && (
                <DataSourcesScreen />
              )}

              {/* Screen 8: Immutable Cryptographic Audit Logs */}
              {activeTab === 'audit' && (
                <AuditLogsScreen onInspectRecord={setSelectedAuditRecord} />
              )}

              {/* Screen 9: System & Invariant Policy Settings */}
              {activeTab === 'settings' && (
                <SettingsScreen />
              )}
            </main>
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL MODALS ACCESSIBLE FROM ANY SCREEN (Landing, Auth, or Dashboard)
         ========================================================================= */}

      {/* 1. Double-Lock Audit Slide-Over Drawer */}
      <RecordAuditDrawer
        record={selectedAuditRecord}
        isOpen={Boolean(selectedAuditRecord)}
        onClose={() => setSelectedAuditRecord(null)}
      />

      {/* 2. Global Spotlight Command Palette Modal (Cmd/Ctrl + K) */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectTab={(tab) => {
          setIsAuthenticated(true);
          setCurrentScreen('dashboard');
          setActiveTab(tab);
        }}
        onRunScenario={(scId) => {
          setIsAuthenticated(true);
          setCurrentScreen('dashboard');
          handleRunDemo(scId);
        }}
        scenarios={scenarioCatalog}
      />

      {/* 3. Architecture Blueprint Modal */}
      <Suspense fallback={null}>
        {showArchModal && (
          <ArchitectureModal
            isOpen={showArchModal}
            onClose={() => setShowArchModal(false)}
          />
        )}
      </Suspense>

      {/* 4. Interactive Swagger REST API Modal */}
      <Suspense fallback={null}>
        {showSwaggerModal && (
          <SwaggerModal
            isOpen={showSwaggerModal}
            onClose={() => setShowSwaggerModal(false)}
          />
        )}
      </Suspense>

      {/* 5. Keyboard Navigation Cheatsheet HUD Modal */}
      <Suspense fallback={null}>
        {showShortcutsModal && (
          <KeyboardShortcutsModal
            isOpen={showShortcutsModal}
            onClose={() => setShowShortcutsModal(false)}
          />
        )}
      </Suspense>

      {/* 5. Autonomous Execution Telemetry Flowchart HUD Modal */}
      <PipelineTelemetryModal
        isOpen={showTelemetryModal}
        onClose={() => setShowTelemetryModal(false)}
        onComplete={handleTelemetryComplete}
        runData={pendingDemoData}
      />

      {/* 6. Dismissible Error Toast */}
      {apiError && (
        <ErrorToast
          title={apiError.title}
          message={apiError.message}
          onRetry={apiError.onRetry}
          onDismiss={() => setApiError(null)}
        />
      )}
    </>
  );
}
