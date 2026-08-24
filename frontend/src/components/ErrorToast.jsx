import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

export default function ErrorToast({ error, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-surface border border-sterling/30 rounded-lg shadow-modal p-4 transition-fast flex items-start gap-3 bg-white">
      <div className="w-8 h-8 rounded-md bg-status-mismatched-bg border border-status-mismatched-border flex items-center justify-center text-sterling shrink-0 mt-0.5">
        <AlertCircle className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-xs text-ink-primary">
            {error.title || 'Network / API Error'}
          </h4>
          <button
            onClick={onDismiss}
            className="text-ink-muted hover:text-ink-primary p-0.5 rounded transition-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-ink-secondary leading-snug">
          {error.message || 'Unable to connect to the backend server. Please verify the service is running.'}
        </p>

        {onRetry && (
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                onRetry();
                if (onDismiss) onDismiss();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-sterling hover:bg-sterling-hover text-white text-[11px] font-semibold transition-fast"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry Action</span>
            </button>

            <button
              onClick={onDismiss}
              className="px-2 py-1 text-[11px] text-ink-muted hover:text-ink-secondary"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
