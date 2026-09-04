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
} from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const SHORTCUT_GROUPS = [
    {
      title: 'Global Navigation & Actions',
      items: [
        { key: '⌘ / Ctrl + K', description: 'Spotlight Search & Command Palette', icon: Search },
        { key: '?', description: 'Toggle Keyboard Shortcuts HUD', icon: HelpCircle },
        { key: 'Esc', description: 'Close any active modal or slide-over drawer', icon: X },
      ],
    },
    {
      title: 'Operational Hubs',
      items: [
        { key: '1', description: 'Jump to 3-Way Reconciliation Hub', icon: Zap },
        { key: '2', description: 'Jump to Quarantine & Exceptions Hub', icon: Sparkles },
        { key: '3', description: 'Jump to Treasury & Liquidity Forecaster', icon: Sparkles },
        { key: '4', description: 'Jump to Autonomous Financial Copilot', icon: Bot },
        { key: '5', description: 'Jump to Regulatory Governance Hub', icon: Terminal },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/30 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-lg bg-surface border border-border-subtle rounded-lg shadow-modal overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-page border border-border-subtle text-ink-primary">
              <Command className="w-4 h-4 text-ink-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-ink-primary">
                Keyboard Navigation
              </h3>
              <p className="text-xs text-ink-muted">
                Fast keyboard shortcuts for enterprise workflows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary p-1 rounded-md hover:bg-page transition-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Lists */}
        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h4 className="text-[10px] font-mono font-semibold text-ink-muted uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-md bg-page border border-border-subtle flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Icon className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                        <span className="text-xs font-sans text-ink-secondary truncate">
                          {item.description}
                        </span>
                      </div>
                      <kbd className="px-2 py-0.5 rounded bg-surface border border-border-subtle text-[11px] font-mono font-medium text-ink-primary shadow-subtle shrink-0">
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
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted font-mono">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-page border border-border-subtle text-[10px] font-bold">?</kbd> anywhere to toggle</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-ink-primary hover:bg-slate-800 text-white text-xs font-medium shadow-subtle transition-fast"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
