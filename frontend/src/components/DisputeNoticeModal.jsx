import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import CertusLogo from './CertusLogo';
import { soundManager } from '../lib/soundFx';

export default function DisputeNoticeModal({ isOpen, onClose, disputeData }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !disputeData) return null;

  const {
    notice_id = 'CERTUS/DISP/20260829/PAY_MDR9',
    record_id = 'pay_M812A901',
    utr = 'HDFC44910283910',
    variance_formatted = '₹217.50',
    issue_date = '29 August 2026',
    letter_markdown = '',
  } = disputeData;

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(letter_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundManager.playClick();
    const element = document.createElement('a');
    const file = new Blob([letter_markdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${notice_id.replace(/\//g, '_')}_Demand_Notice.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    soundManager.playMatchChime();
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-rose-50 border border-rose-200 text-[#E8384F]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Autonomous Bank Dispute Demand Notice
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-[#E8384F] border border-rose-200">
                  LEGAL DRAFT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Ref: <strong className="font-mono text-slate-700">{notice_id}</strong> • Disputed Variance: <strong className="text-[#E8384F]">{variance_formatted}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Letter Viewer Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-slate-50/50 font-sans text-xs leading-relaxed text-slate-800 space-y-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 font-mono text-[11px]">
            <pre className="whitespace-pre-wrap font-mono text-slate-800 leading-relaxed">
              {letter_markdown}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>72-Hour Contractual SLA Enforcement Active</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-[#E8384F] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
}
