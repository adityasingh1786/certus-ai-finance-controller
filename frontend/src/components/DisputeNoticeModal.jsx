import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function DisputeNoticeModal({ isOpen, onClose, disputeData }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !disputeData) return null;

  const {
    notice_id = 'CERTUS/DISP/20260829/PAY_MDR9',
    variance_formatted = '₹217.50',
    letter_markdown = '',
  } = disputeData;

  const handleCopy = () => {
    navigator.clipboard.writeText(letter_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([letter_markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${notice_id.replace(/\//g, '_')}_Demand_Notice.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-primary/30 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-3xl bg-surface border border-border-subtle rounded-lg shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-page">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-surface border border-border-subtle text-sterling">
              <ShieldAlert className="w-4 h-4 text-sterling" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-ink-primary">
                  Bank Dispute Demand Notice
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-status-flagged-bg text-status-flagged-text border border-status-flagged-border">
                  LEGAL DRAFT
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Ref: <strong className="font-mono text-ink-secondary">{notice_id}</strong> • Disputed Variance: <strong className="text-sterling">{variance_formatted}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-surface hover:bg-page border border-border-subtle text-xs font-medium text-ink-secondary hover:text-ink-primary transition-fast"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-surface hover:bg-page border border-border-subtle text-xs font-medium text-ink-secondary hover:text-ink-primary transition-fast"
            >
              <Download className="w-3.5 h-3.5 text-ink-muted" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="text-ink-muted hover:text-ink-primary p-1 rounded-md hover:bg-page transition-fast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Letter Viewer Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-page font-sans text-xs leading-relaxed text-ink-primary space-y-4">
          <div className="bg-surface p-6 rounded-md border border-border-subtle shadow-subtle space-y-4 font-mono text-[11px]">
            <pre className="whitespace-pre-wrap font-mono text-ink-primary leading-relaxed">
              {letter_markdown}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border-subtle bg-surface flex items-center justify-between text-xs text-ink-muted font-mono">
          <span>72-Hour Contractual SLA Enforcement Active</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-ink-primary hover:bg-slate-800 text-white text-xs font-medium shadow-subtle transition-fast"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
}
