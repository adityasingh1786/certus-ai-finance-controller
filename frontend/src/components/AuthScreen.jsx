import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Key,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import CertusLogo from './CertusLogo';

export default function AuthScreen({ onLoginSuccess, onBackToLanding }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('controller@certus.ai');
  const [password, setPassword] = useState('razorpay2026');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleEmailAuth = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Verify demo account credentials or allow standard demo login
    if (
      email.toLowerCase().trim() === 'controller@certus.ai' ||
      email.toLowerCase().trim() === 'demo@certus.ai' ||
      email.toLowerCase().trim() === 'admin@certus.ai'
    ) {
      onLoginSuccess();
    } else {
      setErrorMsg(
        'For Hackathon review, please use the pre-configured Demo Account (controller@certus.ai) or click "1-Click Demo Login".'
      );
    }
  };

  const handleDemoInstantLogin = () => {
    setEmail('controller@certus.ai');
    setPassword('razorpay2026');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-page text-ink-primary flex flex-col justify-center items-center p-6 selection:bg-sterling selection:text-white relative">
      {/* Back to landing button */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-fast"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>
      )}

      <div className="w-full max-w-[440px] bg-surface border border-border-subtle rounded-2xl p-8 shadow-card space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <CertusLogo className="w-9 h-9" textClassName="text-2xl font-bold" />
          <p className="text-xs text-ink-muted font-sans">
            AI Finance Controller & 3-Way Reconciler
          </p>
        </div>

        {/* 1-Click Fast Demo Login */}
        <div className="p-4 bg-sterling-light/40 border border-sterling-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-sterling flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Fast Evaluation Access
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-sterling border border-sterling-border">
              DEMO PASS
            </span>
          </div>
          <p className="text-[11px] text-ink-secondary leading-relaxed">
            One-click instant authentication as <strong>Senior Financial Controller</strong> with pre-loaded live transaction streams.
          </p>
          <button
            onClick={handleDemoInstantLogin}
            className="w-full bg-sterling hover:bg-sterling-hover text-white font-semibold py-2.5 px-4 rounded-lg text-xs shadow-subtle flex items-center justify-center gap-2 transition-fast"
          >
            <span>1-Click Demo Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-border-subtle" />
          <span className="text-[11px] font-mono text-ink-muted uppercase">or credentials</span>
          <div className="flex-1 h-[1px] bg-border-subtle" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#991B1B] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-sterling shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-ink-muted" />
              <span>Work Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-page border border-border-subtle rounded-lg text-xs font-mono text-ink-primary placeholder-ink-muted outline-none focus:border-border-strong transition-fast"
              placeholder="controller@certus.ai"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-ink-muted" />
                <span>Password</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setEmail('controller@certus.ai');
                  setPassword('razorpay2026');
                }}
                className="text-[10px] font-mono text-sterling hover:underline"
              >
                Auto-fill demo credentials
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-page border border-border-subtle rounded-lg text-xs font-mono text-ink-primary placeholder-ink-muted outline-none focus:border-border-strong transition-fast"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-ink-primary hover:bg-ink-secondary text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-fast"
          >
            {isSignUp ? 'Sign Up Demo Account' : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="text-center pt-1 border-t border-border-subtle">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-xs text-ink-muted hover:text-ink-primary transition-fast"
          >
            {isSignUp
              ? 'Already have access? Sign In'
              : 'Need a custom tenant? Request Access'}
          </button>
        </div>
      </div>

      {/* Governance Footer Note */}
      <p className="text-[11px] font-mono text-ink-muted mt-6 text-center">
        Razorpay AI Buildathon 2026 • Dual-Lock Gate • Read-Only MCP Tools
      </p>
    </div>
  );
}
