import React, { useState, useEffect } from 'react';

/**
 * Section 4: Boot / Loading Screen
 * 2.2–2.6s total timed sequence.
 * Wordmark + Confidence Sweep + Monospace typed logs + fade out.
 */
export default function BootScreen({ onBootComplete }) {
  const [logLines, setLogLines] = useState([]);
  const [sweepResolved, setSweepResolved] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const logs = [
    'connecting to razorpay mcp...',
    'loading matching engine...',
    'calibrating confidence gate...',
    'ready.',
  ];

  useEffect(() => {
    // 300ms: sweep resolves to signal-red glow
    const t1 = setTimeout(() => {
      setSweepResolved(true);
    }, 300);

    // 500ms - 1700ms: type logs
    const timers = logs.map((log, index) => {
      return setTimeout(() => {
        setLogLines((prev) => [...prev, log]);
      }, 500 + index * 320);
    });

    // 2100ms: fade out
    const tFade = setTimeout(() => {
      setFadingOut(true);
    }, 2100);

    // 2500ms: boot complete callback
    const tComplete = setTimeout(() => {
      if (onBootComplete) onBootComplete();
    }, 2500);

    return () => {
      clearTimeout(t1);
      timers.forEach(clearTimeout);
      clearTimeout(tFade);
      clearTimeout(tComplete);
    };
  }, [onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0D] transition-all duration-400 ${
        fadingOut ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Brand Box with Sweep Border */}
      <div className="relative flex flex-col items-center space-y-6">
        <div
          className={`relative px-8 py-3.5 rounded-xl border transition-all duration-500 ${
            sweepResolved
              ? 'border-[#E8384F] shadow-[0_0_30px_rgba(232,56,79,0.35)] bg-white/[0.03]'
              : 'border-white/10 bg-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold font-display text-[#F7F5F2] tracking-tight">
              Certus
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#E8384F]/20 text-[#E8384F] border border-[#E8384F]/40 font-semibold tracking-wider">
              Enterprise v2.4
            </span>
          </div>
        </div>

        {/* Typed Monospace Log Lines */}
        <div className="h-28 w-80 font-mono text-[13px] text-[#9A9AA5] space-y-1.5 px-2">
          {logLines.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[#4FD1FF] text-xs">›</span>
              <span className={idx === logs.length - 1 ? 'text-[#10B981] font-semibold' : ''}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
