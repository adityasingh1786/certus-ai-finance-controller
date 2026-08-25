import { useState, useCallback, useEffect } from 'react';
import { fetchOperationalState, executeReconciliationRun, fetchQuarantineRecords } from '../lib/api';

/**
 * Custom React Hook for Managing 3-Way Reconciliation State & Scenario Switching
 */
export function useReconciliation(initialScenarioId = 1) {
  const [activeScenarioId, setActiveScenarioId] = useState(initialScenarioId);
  const [reconciliationData, setReconciliationData] = useState(null);
  const [quarantineRecords, setQuarantineRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadScenario = useCallback(async (scenarioId) => {
    setIsLoading(true);
    setError(null);
    try {
      const [stateRes, quarantineRes] = await Promise.all([
        fetchOperationalState(scenarioId),
        fetchQuarantineRecords(scenarioId),
      ]);
      setReconciliationData(stateRes);
      setQuarantineRecords(quarantineRes.records || []);
      setActiveScenarioId(scenarioId);
    } catch (err) {
      console.error('Failed to load scenario:', err);
      setError(err.message || 'Failed to fetch operational state');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerReconciliation = useCallback(async (scenarioId) => {
    setIsLoading(true);
    try {
      const result = await executeReconciliationRun(scenarioId || activeScenarioId);
      setReconciliationData((prev) => ({ ...prev, ...result }));
      return result;
    } catch (err) {
      console.error('Reconciliation run failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeScenarioId]);

  useEffect(() => {
    loadScenario(activeScenarioId);
  }, [activeScenarioId, loadScenario]);

  return {
    activeScenarioId,
    setActiveScenarioId,
    reconciliationData,
    quarantineRecords,
    isLoading,
    error,
    loadScenario,
    triggerReconciliation,
  };
}
