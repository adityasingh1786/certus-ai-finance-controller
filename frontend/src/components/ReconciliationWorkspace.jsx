import React from 'react';
import ReconciliationHub from './ReconciliationHub';

/**
 * ReconciliationWorkspace — Dedicated 3-Way Multi-Rail Reconciliation Workspace
 * Unites Matrix, Upload Ingestion, and Baseline Comparison under one clean shell.
 */
export default function ReconciliationWorkspace(props) {
  return (
    <div className="space-y-6">
      <ReconciliationHub {...props} />
    </div>
  );
}
