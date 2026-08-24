import React, { useState, useRef } from 'react';
import {
  Zap,
  Landmark,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { reconcileThreeFiles, reconcileDemoDataset } from '../lib/api';

export default function UploadReconcileWidget({ onReconcileSuccess, isProcessing, setIsProcessing }) {
  const [gatewayFile, setGatewayFile] = useState(null);
  const [bankFile, setBankFile] = useState(null);
  const [erpFile, setErpFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [progressStep, setProgressStep] = useState(null);

  const gwInputRef = useRef(null);
  const bankInputRef = useRef(null);
  const erpInputRef = useRef(null);

  const handleFileChange = async (setter, file) => {
    setErrorMsg(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg(`"${file.name}" is not a CSV file. Please upload a standard .csv export.`);
      return;
    }

    if (file.size === 0) {
      setErrorMsg(`"${file.name}" is completely empty (0 bytes).`);
      return;
    }

    // Inspect content to detect header-only / zero-valid-rows files
    try {
      const textPreview = await file.slice(0, 8192).text();
      const lines = textPreview.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setErrorMsg(
          `No usable records found in "${file.name}" — file contains a header line but 0 valid data rows.`
        );
        return;
      }
    } catch (e) {
      // Fallback to standard upload
    }

    setter(file);
  };

  const handleDrop = (e, setter) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(setter, e.dataTransfer.files[0]);
    }
  };

  const handleRunReconcile = async () => {
    if (!gatewayFile || !bankFile || !erpFile) {
      setErrorMsg('Please select all 3 CSV files (Gateway, Bank, and ERP) or click "1-Click Demo".');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      setProgressStep('Reading & parsing CSV headers...');
      await new Promise((r) => setTimeout(r, 200));

      setProgressStep('Detecting dynamic columns & normalizing records...');
      await new Promise((r) => setTimeout(r, 200));

      setProgressStep('Executing double-lock reconciliation engine...');
      const result = await reconcileThreeFiles(gatewayFile, bankFile, erpFile);

      setProgressStep('Finalizing 4-status classifications...');
      await new Promise((r) => setTimeout(r, 150));

      if (onReconcileSuccess) {
        onReconcileSuccess(result);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Reconciliation failed. Please verify your file format.');
    } finally {
      setIsProcessing(false);
      setProgressStep(null);
    }
  };

  const handleRunDemo = async () => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      setProgressStep('Loading bundled 60-record synthetic datasets...');
      await new Promise((r) => setTimeout(r, 200));

      setProgressStep('Detecting dynamic columns across Gateway, Bank, and ERP...');
      await new Promise((r) => setTimeout(r, 200));

      setProgressStep('Evaluating precision signals & double-lock gate...');
      const result = await reconcileDemoDataset();

      setProgressStep('Classifications complete!');
      await new Promise((r) => setTimeout(r, 150));

      if (onReconcileSuccess) {
        onReconcileSuccess(result);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load synthetic demo datasets.');
    } finally {
      setIsProcessing(false);
      setProgressStep(null);
    }
  };

  const renderDropCard = (label, sublabel, icon, file, setter, inputRef) => {
    const IconComponent = icon;
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, setter)}
        className={`flex-1 border rounded-lg p-5 transition-fast flex flex-col justify-between ${
          file
            ? 'border-emerald-300 bg-emerald-50/40'
            : 'border-border-subtle bg-surface hover:border-border-strong'
        }`}
      >
        <input
          type="file"
          accept=".csv"
          ref={inputRef}
          className="hidden"
          onChange={(e) => handleFileChange(setter, e.target.files?.[0])}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-page border border-border-subtle flex items-center justify-center text-ink-primary">
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-ink-primary">{label}</h4>
                <p className="text-xs text-ink-muted">{sublabel}</p>
              </div>
            </div>
            {file && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setter(null);
                }}
                className="text-ink-muted hover:text-sterling p-1 rounded hover:bg-page transition-fast"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {file ? (
            <div className="bg-surface border border-emerald-200 rounded-md p-2.5 flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-mono text-ink-primary truncate">{file.name}</span>
              </div>
              <span className="text-[11px] font-mono text-ink-muted shrink-0 ml-2">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="border border-dashed border-border-strong rounded-md p-4 text-center cursor-pointer hover:bg-page/70 transition-fast mt-2 flex flex-col items-center justify-center gap-1.5"
            >
              <UploadCloud className="w-5 h-5 text-ink-muted" />
              <span className="text-xs font-medium text-ink-secondary">
                Drop CSV file here or <span className="text-sterling font-semibold">browse</span>
              </span>
              <span className="text-[11px] text-ink-muted">Any column headers auto-detected</span>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-800">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Ready for reconciliation
            </span>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-ink-secondary hover:text-ink-primary underline"
            >
              Replace
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-6 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
        <div>
          <h2 className="font-display font-bold text-lg text-ink-primary">
            Multi-Source Settlement Ingestion
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Drop your three CSV files. The backend automatically identifies amounts, dates, and UTRs across all columns.
          </p>
        </div>

        <button
          onClick={handleRunDemo}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-sterling bg-sterling-light/40 hover:bg-sterling-light text-sterling text-xs font-semibold transition-fast shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-sterling" />
          <span>Load 60-Record Demo Dataset</span>
        </button>
      </div>

      {/* 3 Drop-Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        {renderDropCard(
          '1. Razorpay Gateway',
          'Payment & MDR Fee Records',
          Zap,
          gatewayFile,
          setGatewayFile,
          gwInputRef
        )}
        {renderDropCard(
          '2. Bank Statement',
          'UTR & Credit Settled Lines',
          Landmark,
          bankFile,
          setBankFile,
          bankInputRef
        )}
        {renderDropCard(
          '3. Accounting / ERP',
          'Invoices & Ledger Books',
          FileSpreadsheet,
          erpFile,
          setErpFile,
          erpInputRef
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-md bg-status-mismatched-bg border border-status-mismatched-border flex items-center gap-2.5 text-xs text-status-mismatched-text">
          <AlertCircle className="w-4 h-4 text-sterling shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-ink-muted flex items-center gap-2">
          {progressStep ? (
            <div className="flex items-center gap-2 text-sterling font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{progressStep}</span>
            </div>
          ) : (
            <span>Zero pre-formatting needed • Dynamic column type detection enabled</span>
          )}
        </div>

        <button
          onClick={handleRunReconcile}
          disabled={isProcessing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-sterling hover:bg-sterling-hover text-white text-xs font-semibold shadow-subtle transition-fast disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Reconciling Streams...</span>
            </>
          ) : (
            <>
              <span>Compare & Reconcile</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
