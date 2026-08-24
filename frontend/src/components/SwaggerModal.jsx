import React from 'react';
import { X, ExternalLink, Terminal } from 'lucide-react';

export default function SwaggerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/30 transition-fast">
      <div className="w-full max-w-4xl bg-surface border border-border-subtle rounded-lg shadow-modal p-6 flex flex-col h-[80vh]">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sterling" />
            <h3 className="font-display font-bold text-base text-ink-primary">
              FastAPI OpenAPI Documentation
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-sterling hover:underline font-medium"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="text-ink-muted hover:text-ink-primary p-1 rounded hover:bg-page"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full mt-4 rounded border border-border-subtle overflow-hidden">
          <iframe
            src="http://127.0.0.1:8000/docs"
            title="FastAPI Swagger Explorer"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
