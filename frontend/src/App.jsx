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
import RecordAuditDrawer from './components/RecordAuditDrawer';
import PipelineTelemetryModal from './components/PipelineTelemetryModal';
import CommandPaletteModal from './components/CommandPaletteModal';
import ErrorToast from './components/ErrorToast';
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

export default function App() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState('boot'); // 'boot' | 'landing' | 'auth' | 'dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('recon'); // 'recon' | 'quarantine' | 'treasury' | 'copilot' | 'governance'

  // Modal Visibility States
  const [showArchModal, setShowArchModal] = useState(false);
  const [showSwaggerModal, setShowSwaggerModal] = useState(false);
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

  // 1. Initial 2.4s Booting Screen Transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen('landing');
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // 2. Load Initial Live Backend Data & Scenario Catalog
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
      }
      if (scRes.status === 'fulfilled' && scRes.value?.scenarios) {
        setScenarioCatalog(scRes.value.scenarios);
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

      if (e.key === '1') {
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

    try {
      const res = await reconcileDemoDataset(scenarioId);
      setPendingDemoData(res);
      setReconciliationData(res);
      try { soundManager.playMatchChime(); } catch (_) {}
    } catch (err) {
      console.error('Demo execution error:', err);
    } finally {
      setIsReconciling(false);
    }
  };

  const handleTelemetryComplete = async () => {
    if (pendingDemoData) {
      setReconciliationData(pendingDemoData);
    }
    setActiveTab('recon');
    setShowTelemetryModal(false);
  };

  // Quarantine exception resolution handler
  const handleRecordResolved = (recordId, action) => {
    try { soundManager.playMatchChime(); } catch (_) {}
    setQuarantineRecords((prev) =>
      prev.map((r) =>
        r.record_id === recordId ? { ...r, is_resolved: true, resolution_action: action } : r
      )
    );
  };

  const unresCount = quarantineRecords.filter((r) => !r.is_resolved).length || 4;

  return (
    <>
      {/* =========================================================================
          STEP 1: 3D Holographic Booting Screen (2.4s)
         ========================================================================= */}
      {currentScreen === 'boot' && (
        <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center relative overflow-hidden select-none aurora-canvas">
          <div className="relative flex flex-col items-center z-10 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-[#E8384F] flex items-center justify-center text-white text-2xl font-bold font-display shadow-2xl shadow-rose-500/40 animate-pulse">
                C
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-[#E8384F]/40 animate-ping" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight">
                CERTUS AUTONOMOUS OS
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Initializing Double-Lock Invariant Core v2.4...
              </p>
            </div>

            <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#E8384F] rounded-full animate-[ekgFlow_2s_ease-in-out_infinite]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
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
        <div className="h-screen w-screen overflow-hidden bg-[#FAFAF9] text-slate-900 flex flex-col antialiased select-none aurora-canvas">
          
          {/* Fixed Sovereign TopBar (64px) */}
          <TopBar
            activeTab={activeTab}
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
            <main className="ml-64 mt-16 h-[calc(100vh-64px)] flex-1 p-8 overflow-y-auto overflow-x-hidden space-y-6">
              
              {/* Hub 1: 3-Way Match Matrix Hub */}
              {activeTab === 'recon' && (
                <ReconciliationHub
                  reconciliationData={reconciliationData}
                  onSelectAuditRecord={setSelectedAuditRecord}
                  onRunDemo={handleRunDemo}
                  isReconciling={isReconciling}
                  onReconcileSuccess={(data) => {
                    setReconciliationData(data);
                    loadInitialData();
                  }}
                  setIsProcessing={setIsReconciling}
                />
              )}

              {/* Hub 2: Quarantine & Exceptions Hub */}
              {activeTab === 'quarantine' && (
                <QuarantineHub
                  records={quarantineRecords}
                  onRecordResolved={handleRecordResolved}
                  onRefresh={loadInitialData}
                  onInspectRecord={setSelectedAuditRecord}
                />
              )}

              {/* Hub 3: Treasury & Liquidity Hub */}
              {activeTab === 'treasury' && (
                <TreasuryHub
                  forecastData={forecastData}
                  cashPosition={cashPosition}
                  onRefresh={loadInitialData}
                />
              )}

              {/* Hub 4: Autonomous Copilot Hub */}
              {activeTab === 'copilot' && (
                <CopilotHub />
              )}

              {/* Hub 5: System Governance Hub */}
              {activeTab === 'governance' && (
                <GovernanceHub
                  onOpenArchitecture={() => setShowArchModal(true)}
                  onOpenSwagger={() => setShowSwaggerModal(true)}
                />
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
