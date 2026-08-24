import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../lib/soundFx';

export default function SingularityBootScreen({ onBootComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);
  const canvasRef = useRef(null);

  // 1. HTML5 Canvas Kinetic Particle Convergence Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 80 luminous ruby & crystal particles
    const particleCount = 80;
    const particles = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 320 + 80;
      particles.push({
        angle,
        distance,
        speed: Math.random() * 0.03 + 0.02,
        decay: Math.random() * 1.5 + 0.8,
        size: Math.random() * 2.5 + 1.2,
        color: Math.random() > 0.3 ? 'rgba(232, 56, 79, ' : 'rgba(99, 102, 241, ',
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    let startTime = Date.now();

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Orbit and vortex convergence towards center
        p.angle += p.speed;
        p.distance = Math.max(0, p.distance - p.decay * (elapsed > 1.2 ? 3.5 : 0.8));

        const x = width / 2 + Math.cos(p.angle) * p.distance;
        const y = height / 2 + Math.sin(p.angle) * p.distance;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = '#E8384F';
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // 2. High-Frequency Cryptographic Progress & Optical Aperture Handoff
  useEffect(() => {
    try {
      soundManager.playMatchChime();
    } catch (_) {}

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 10) + 6;
        return Math.min(100, prev + delta);
      });
    }, 80);

    // Trigger radial optical aperture expansion at 2.4s
    const apertureTimer = setTimeout(() => {
      setIsExpanding(true);
      try {
        soundManager.playMatchChime();
      } catch (_) {}

      // Complete handoff after aperture animation completes (600ms)
      setTimeout(() => {
        onBootComplete();
      }, 550);
    }, 2400);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(apertureTimer);
    };
  }, [onBootComplete]);

  return (
    <div
      style={{
        clipPath: isExpanding
          ? 'circle(160% at 50% 50%)'
          : 'circle(100% at 50% 50%)',
        transition: 'clip-path 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out',
        opacity: isExpanding ? 0 : 1,
      }}
      className="fixed inset-0 z-50 bg-[#FAFAF9] flex flex-col items-center justify-center select-none overflow-hidden text-slate-900 aurora-canvas"
    >
      {/* 🌌 Kinetic HTML5 Canvas Particle Vortex */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-80"
      />

      {/* Ambient Radial Lighting Field */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-rose-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* 🏛️ Centerpiece: 3D Crystal Prism Emblem with Laser Orbit */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 space-y-7 text-center">
        
        {/* Floating 3D Crystal Tile with Specular Sheen */}
        <div className="relative flex items-center justify-center">
          {/* Glowing Animated Outer Pulse Halo */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-rose-500/25 via-indigo-500/15 to-transparent rounded-[36px] blur-xl animate-pulse" />
          
          {/* Frosted Acrylic 3D Glass Prism */}
          <div className="relative w-28 h-28 rounded-3xl p-1 bg-white/85 backdrop-blur-2xl border border-white shadow-2xl shadow-slate-900/10 flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <img
              src="/certus-3d-logo.jpg"
              alt="Certus 3D Singularity Logo"
              className="w-full h-full object-cover rounded-2xl shadow-xs"
            />
            {/* Specular Diagonal Refraction Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/50 pointer-events-none rounded-2xl" />
          </div>
        </div>

        {/* Brand Header */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">
              Certus
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-[#E8384F] border border-rose-200 font-bold tracking-wide">
              FINANCE OS
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans font-medium">
            Autonomous 3-Way Reconciliation & Liquidity Controller
          </p>
        </div>

        {/* ⚡ Cryptographic Solvency Proof Laser Filament Gauge */}
        <div className="w-64 space-y-2 pt-1">
          <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#E8384F] to-[#d42d43] rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(232,56,79,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-semibold px-0.5">
            <span className="text-slate-500 font-bold">₹872B SOLVENCY PROOF</span>
            <span className="text-[#E8384F] font-bold">{progress}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
