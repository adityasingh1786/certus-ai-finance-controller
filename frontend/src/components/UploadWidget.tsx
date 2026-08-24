'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api, BatchSummary } from '@/lib/api';

interface UploadWidgetProps {
  onUploadSuccess: (summary: BatchSummary) => void;
}

export default function UploadWidget({ onUploadSuccess }: UploadWidgetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const res = await api.ingestFile(file);
      const summary = await api.getBatchSummary(res.batch_id);
      onUploadSuccess(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to ingest file');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            Ingest Settlement Data
          </h3>
          <p className="text-xs text-slate-400">
            Accepts raw gateway exports, scanned PDFs, or messy bank narrations
          </p>
        </div>
        <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-500/20">
          CSV • PDF • TXT
        </span>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 shadow-glow-cyan'
            : 'border-slate-700/70 hover:border-cyan-500/50 hover:bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf,.txt,.json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-200">
              Processing through Dual-Layer Rules Engine...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Per-record schema validation & anomaly isolation in progress
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              <span className="text-cyan-400 hover:underline">Click to upload</span> or drag and drop settlement file
            </p>
            <p className="text-xs text-slate-500 mt-1.5 font-mono">
              Deterministic validation runs automatically • Bad records route to Quarantine
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
