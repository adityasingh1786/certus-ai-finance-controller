import React from 'react';

/**
 * SignalGridBackground — Lightweight Sovereign Dot-Grid Background Canvas
 * Provides subtle spatial texture without GPU drain or distracting animations.
 */
export default function SignalGridBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-40 select-none overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="subtle-dot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="0.75" fill="#94A3B8" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#subtle-dot-grid)" />
      </svg>
    </div>
  );
}
