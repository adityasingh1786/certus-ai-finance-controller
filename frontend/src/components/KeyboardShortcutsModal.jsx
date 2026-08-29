import React from 'react';
import {
  X,
  Command,
  Search,
  Zap,
  Bot,
  Terminal,
  Volume2,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import CertusLogo from './CertusLogo';
import { soundManager } from '../lib/soundFx';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const SHORTCUT_GROUPS = [
    {
      title: 'Global Navigation & Actions',
      items: [
        { key: '⌘ / Ctrl + K', description: 'Spotlight Search & Command Palette', icon: Search },
        { key: '?', description: 'Toggle Keyboard Shortcuts HUD', icon: HelpCircle },
        { key: 'M', description: 'Toggle Web Audio Synthesizer Sound', icon: Volume2 },
        { key: 'Esc', description: 'Close any active modal or panel', icon: X },
      ],
    },
    {
      title: 'Reconciliation & Invariant Controls',
      items: [
        { key: 'R', description: 'Run Multi-Rail 3-Way Reconciliation', icon: Zap },
        { key: '1 – 9', description: 'Quick-Jump to Enterprise Scenarios 1–9', icon: Sparkles },
        { key: 'A', description: 'Open ReAct Sovereign Copilot', icon: Bot },
        { key: 'E', description: 'Open Native OpenAPI 3.1 REST Explorer', icon: Terminal },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-rose-50 border border-rose-200/80 text-[#E8384F]">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Keyboard Navigation Cheatsheet
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Power-user shortcuts for autonomous controller workflows
              </p>
            </div>
          </div>

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

        {/* Shortcuts Lists */}
        <div className="space-y-5">
          {SHORTCUT_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-sans text-slate-700 truncate">
                          {item.description}
                        </span>
                      </div>
                      <kbd className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-900 shadow-2xs shrink-0">
                        {item.key}
                      </kbd>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px] font-bold">?</kbd> anywhere to toggle</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-[#E8384F] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
