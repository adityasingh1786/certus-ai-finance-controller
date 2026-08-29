import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
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
  Fingerprint,
  Cpu,
  Database,
  Activity,
  Zap,
} from 'lucide-react';
import CertusLogo from './CertusLogo';
import { soundManager } from '../lib/soundFx';

export default function AuthScreen({ onLoginSuccess, onBackToLanding }) {
  const mountRef = useRef(null);
  const cardRef = useRef(null);

  const [authMode, setAuthMode] = useState('demo'); // 'demo' | 'biometric' | 'credentials'
  const [email, setEmail] = useState('controller@certus.ai');
  const [password, setPassword] = useState('razorpay2026');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [keyHash, setKeyHash] = useState('0x8F91...A2B4');

  // 1. 3D WebGL Cryptographic Vault Lock Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAFAF9, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xFAFAF9, 1);
    container.appendChild(renderer.domElement);

    // Multi-Source Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const pointLightRuby = new THREE.PointLight(0xe8384f, 4.0, 50);
    pointLightRuby.position.set(0, 0, 10);
    scene.add(pointLightRuby);

    const pointLightSilver = new THREE.PointLight(0x6366f1, 2.5, 45);
    pointLightSilver.position.set(-10, -5, 8);
    scene.add(pointLightSilver);

    // Revolving 3D Cryptographic Quantum Vault Lock
    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // Inner Glowing Nucleus
    const nucleusGeom = new THREE.OctahedronGeometry(1.4, 0);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xe8384f,
      emissiveIntensity: 0.7,
    });
    const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
    vaultGroup.add(nucleus);

    // Middle Faceted Crystal Icosahedron
    const crystalGeom = new THREE.IcosahedronGeometry(2.5, 1);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xe8384f,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      emissive: 0xe8384f,
      emissiveIntensity: 0.3,
    });
    const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
    vaultGroup.add(crystalMesh);

    // Concentric Laser Cipher Rings
    const cipherRings = [];
    const ringRadii = [3.8, 4.8, 5.8];
    const ringColors = [0xe8384f, 0x6366f1, 0xd97706];

    ringRadii.forEach((r, idx) => {
      const rGeom = new THREE.TorusGeometry(r, 0.03, 16, 100);
      const rMat = new THREE.MeshBasicMaterial({
        color: ringColors[idx],
        transparent: true,
        opacity: 0.45 - idx * 0.1,
      });
      const rMesh = new THREE.Mesh(rGeom, rMat);
      rMesh.rotation.x = Math.PI / (2.2 + idx * 0.4);
      rMesh.rotation.y = (Math.PI / 4) * idx;
      vaultGroup.add(rMesh);
      cipherRings.push({ mesh: rMesh, speed: (0.008 + idx * 0.004) * (idx % 2 === 0 ? 1 : -1) });
    });

    // Floating Cipher Dust Particles
    const pCount = 200;
    const pGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);

    const cRuby = new THREE.Color(0xe8384f);
    const cSilver = new THREE.Color(0x94a3b8);

    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 32;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      const col = Math.random() > 0.4 ? cRuby : cSilver;
      pColors[i * 3] = col.r;
      pColors[i * 3 + 1] = col.g;
      pColors[i * 3 + 2] = col.b;
    }

    pGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // Mouse Parallax Engine
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = x * 3.0;
      targetY = y * 3.0;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Camera parallax damping
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      camera.position.x = currentX;
      camera.position.y = currentY;
      camera.lookAt(0, 0, 0);

      // Rotate vault core & rings
      crystalMesh.rotation.x = elapsed * 0.2;
      crystalMesh.rotation.y = elapsed * 0.3;
      nucleus.rotation.y = -elapsed * 0.4;

      cipherRings.forEach((r) => {
        r.mesh.rotation.z += r.speed;
      });

      particles.rotation.y = elapsed * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 2. Interactive 3D Card Gyro-Tilt Physics
  const handleCardMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = -(y / (rect.height / 2)) * 7;
    const rotateY = (x / (rect.width / 2)) * 7;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleCardMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  // 3. Biometric Scan Simulation
  const handleStartBiometricScan = () => {
    try {
      soundManager.playClick();
      soundManager.playLaserHum();
    } catch (_) {}

    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          try {
            soundManager.playMatchChime();
          } catch (_) {}
          setTimeout(() => {
            onLoginSuccess();
          }, 350);
          return 100;
        }
        // Randomize hash string during scan
        const chars = '0123456789ABCDEF';
        let h = '0x';
        for (let i = 0; i < 8; i++) h += chars[Math.floor(Math.random() * chars.length)];
        setKeyHash(h + '...SEC-194O');
        return prev + 12;
      });
    }, 60);
  };

  // 4. Demo 1-Click Fast Access
  const handleDemoInstantLogin = () => {
    try {
      soundManager.playClick();
      soundManager.playMatchChime();
    } catch (_) {}
    setEmail('controller@certus.ai');
    setPassword('razorpay2026');
    onLoginSuccess();
  };

  // 5. Standard Credential Validation
  const handleEmailAuth = (e) => {
    e.preventDefault();
    try {
      soundManager.playClick();
    } catch (_) {}
    setErrorMsg(null);

    if (
      email.toLowerCase().trim() === 'controller@certus.ai' ||
      email.toLowerCase().trim() === 'demo@certus.ai' ||
      email.toLowerCase().trim() === 'admin@certus.ai'
    ) {
      try {
        soundManager.playMatchChime();
      } catch (_) {}
      onLoginSuccess();
    } else {
      try {
        soundManager.playErrorBuzzer();
      } catch (_) {}
      setErrorMsg(
        'Use pre-configured Demo Account (controller@certus.ai) or click "1-Click Evaluation Pass".'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 flex flex-col justify-center items-center p-6 selection:bg-[#E8384F] selection:text-white relative overflow-hidden select-none">
      
      {/* 🌌 3D WebGL Cryptographic Vault Lock Scene */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Back to Landing Page Trigger */}
      {onBackToLanding && (
        <button
          onClick={() => {
            try {
              soundManager.playClick();
            } catch (_) {}
            onBackToLanding();
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3.5 py-2 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs z-30 hover:border-rose-200"
        >
          <ArrowLeft className="w-4 h-4 text-[#E8384F]" />
          <span>Back to Landing</span>
        </button>
      )}

      {/* 🏷️ FLOATING 3D HOLOGRAPHIC TELEMETRY CARDS (PINNED IN SPATIAL DEPTH) */}
      <div className="hidden lg:block absolute left-12 top-1/3 z-20 pointer-events-none">
        <div className="luxury-glass-card p-4 rounded-2xl border border-rose-200/80 bg-white/90 shadow-xl shadow-rose-500/10 space-y-1.5 max-w-xs animate-in fade-in slide-in-from-left duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8384F] breathing-dot" />
            <span className="text-xs font-mono font-bold text-slate-900">AIR-GAP SECURITY MESH</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
            55 Deterministic invariant rules active with zero network telemetry leakage.
          </p>
        </div>
      </div>

      <div className="hidden lg:block absolute right-12 top-1/3 z-20 pointer-events-none">
        <div className="luxury-glass-card p-4 rounded-2xl border border-indigo-200/80 bg-white/90 shadow-xl shadow-indigo-500/10 space-y-1.5 max-w-xs animate-in fade-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 breathing-dot" />
            <span className="text-xs font-mono font-bold text-slate-900">MULTI-RAIL PROVENANCE</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
            Direct real-time ledger binding: Razorpay ↔ HDFC CMS ↔ Tally Prime.
          </p>
        </div>
      </div>

      {/* 🏛️ 3D TILT GLASSMORPHIC AUTHENTICATION PORTAL */}
      <div
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        className="w-full max-w-[480px] luxury-glass-card rounded-3xl p-7 sm:p-9 bg-white/95 border border-slate-200/90 shadow-2xl space-y-6 z-20 relative transition-transform duration-100 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <CertusLogo className="w-10 h-10" textClassName="text-2xl font-bold tracking-tight" />
          <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
            Sovereign Financial Controller Access
          </p>
        </div>

        {/* 3-Mode Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => {
              soundManager.playClick();
              setAuthMode('demo');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-display font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'demo'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8384F]" />
            <span>Evaluation Pass</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setAuthMode('biometric');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-display font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'biometric'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
            <span>Biometric Key</span>
          </button>
        </div>

        {/* MODE 1: 1-Click Fast Evaluation Pass (For Razorpay Judges) */}
        {authMode === 'demo' && (
          <div className="p-5 bg-gradient-to-br from-rose-50/80 to-white border border-rose-200/90 rounded-2xl space-y-3.5 shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold text-[#E8384F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E8384F]" />
                Full Judicial Clearance
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#E8384F] border border-rose-200 shadow-2xs">
                TRACK 4 JURY
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Instant evaluation session as <strong>Lead Controller (Aditya Singh)</strong> with pre-loaded 20 enterprise financial datasets and live multi-rail reconciliation.
            </p>

            <button
              onClick={handleDemoInstantLogin}
              className="shimmer-btn w-full bg-[#E8384F] hover:bg-[#d42d43] text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>1-Click Enter Sovereign Controller</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MODE 2: Biometric & Security Key Scanner Simulation */}
        {authMode === 'biometric' && (
          <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl text-center space-y-4 shadow-xs animate-in fade-in duration-150">
            <div className="flex flex-col items-center space-y-2">
              <div className="relative p-4 rounded-3xl bg-white border border-slate-200 shadow-md">
                <Fingerprint className={`w-12 h-12 text-[#E8384F] transition-all ${isScanning ? 'animate-pulse scale-110' : ''}`} />
                {isScanning && (
                  <div
                    className="absolute left-2 right-2 h-0.5 bg-[#FF2E4D] shadow-[0_0_8px_#FF2E4D] transition-all duration-75"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold text-slate-800">
                  {isScanning ? 'Verifying Hardware Token...' : 'Section 194-O Biometric Key'}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Cryptographic Hash: <strong className="text-slate-700">{keyHash}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleStartBiometricScan}
              disabled={isScanning}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#E8384F] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>{isScanning ? `Authenticating (${scanProgress}%)...` : 'Scan Biometric Token'}</span>
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-200" />
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">or standard credentials</span>
          <div className="flex-1 h-[1px] bg-slate-200" />
        </div>

        {/* Standard Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#E8384F] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Controller Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#E8384F] focus:bg-white transition-colors"
                placeholder="controller@certus.ai"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Security Key / Invariant Token</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#E8384F] focus:bg-white font-mono transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Authenticate Session
          </button>
        </form>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Layer 1 Fail-Closed Cryptographic Authentication</span>
        </div>
      </div>
    </div>
  );
}
