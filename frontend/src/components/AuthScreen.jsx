import React from 'react';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Section 5: Thin Auth Screen
 * Centered 480px glass panel, single-click "Continue as Demo User".
 */
export default function AuthScreen({ onLoginSuccess }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-[480px] p-8 border border-white/10 rounded-2xl space-y-6 text-center shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 flex items-center justify-center text-[#FF3B3B]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[#F7F5F2]">Certus</h1>
          <p className="text-sm text-[#9A9AA5]">Sign in to run autonomous reconciliations.</p>
        </div>

        {/* Primary Demo Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onLoginSuccess}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm font-semibold py-3"
          >
            <span>Continue as Demo User</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={onLoginSuccess}
            className="text-xs text-[#5C5C68] hover:text-[#9A9AA5] transition-colors"
          >
            Email sign-in (or continue as guest)
          </button>
        </div>

        {/* Bounded Authority Notice */}
        <div className="pt-4 border-t border-white/5 text-[11px] text-[#5C5C68] leading-relaxed">
          <span>Razorpay AI Buildathon 2026 • Dual-Layer Validation Engine • Strictly Read-Only Tools</span>
        </div>

      </div>
    </div>
  );
}
