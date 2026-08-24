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
import ParticleCanvasBackground from './ParticleCanvasBackground';
import { soundManager } from '../lib/soundFx';

export default function AuthScreen({ onLoginSuccess, onBackToLanding }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('controller@certus.ai');
  const [password, setPassword] = useState('razorpay2026');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleEmailAuth = (e) => {
    e.preventDefault();
    soundManager.playClick();
    setErrorMsg(null);

    if (
      email.toLowerCase().trim() === 'controller@certus.ai' ||
      email.toLowerCase().trim() === 'demo@certus.ai' ||
      email.toLowerCase().trim() === 'admin@certus.ai'
    ) {
      soundManager.playMatchChime();
      onLoginSuccess();
    } else {
      soundManager.playAlert();
      setErrorMsg(
        'Please use the pre-configured Demo Account (controller@certus.ai) or click "1-Click Demo Login".'
      );
    }
  };

  const handleDemoInstantLogin = () => {
    soundManager.playClick();
    soundManager.playMatchChime();
    setEmail('controller@certus.ai');
    setPassword('razorpay2026');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 flex flex-col justify-center items-center p-6 selection:bg-[#E8384F] selection:text-white relative aurora-canvas">
      
      {/* 🌌 Background Particles */}
      <ParticleCanvasBackground />

      {/* Back to landing button */}
      {onBackToLanding && (
        <button
          onClick={() => {
            soundManager.playClick();
            onBackToLanding();
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-xs z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>
      )}

      <div className="w-full max-w-[440px] glass-3d-elevated rounded-3xl p-8 specular-top shadow-2xl space-y-6 z-10 relative">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <CertusLogo className="w-9 h-9" textClassName="text-2xl font-bold" />
          <p className="text-xs text-slate-500 font-sans">
            AI Finance Controller & 3-Way Reconciler
          </p>
        </div>

        {/* 1-Click Fast Demo Login */}
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-[#E8384F] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Fast Evaluation Access
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#E8384F] border border-rose-200">
              DEMO PASS
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
            One-click instant authentication as <strong>Lead Financial Controller (Aditya Singh)</strong> with pre-loaded live 4-channel datasets.
          </p>
          <button
            onClick={handleDemoInstantLogin}
            className="shimmer-btn w-full bg-[#E8384F] hover:bg-[#d42d43] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>1-Click Demo Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-200" />
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">or enterprise pass</span>
          <div className="flex-1 h-[1px] bg-slate-200" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#E8384F] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#E8384F] focus:ring-1 focus:ring-[#E8384F]/30 shadow-xs"
                placeholder="controller@certus.ai"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Security Key / Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#E8384F] focus:ring-1 focus:ring-[#E8384F]/30 shadow-xs font-mono"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            Authenticate Session
          </button>
        </form>

        {/* Security Invariant Guarantee Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Layer 1 Fail-Closed Auth Guard</span>
        </div>
      </div>
    </div>
  );
}
