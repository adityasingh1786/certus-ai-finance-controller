import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from '../lib/soundFx';
import CertusLogo from './CertusLogo';

export default function SingularityBootScreen({ onBootComplete }) {
  const mountRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // 1. Subtle & Elegant 3D WebGL Particle Swirl Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFAFAF9, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xFAFAF9, 1);
    container.appendChild(renderer.domElement);

    // 🌟 3D Fibonacci Particle Swirl (650 Delicate Dust Particles)
    const particleCount = 650;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const initialRadii = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const zOffsets = new Float32Array(particleCount);

    const colorCrimson = new THREE.Color(0xe8384f);
    const colorRose = new THREE.Color(0xf43f5e);
    const colorSilver = new THREE.Color(0x94a3b8);

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 8.5 + 1.2;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 6;

      initialRadii[i] = radius;
      angles[i] = angle;
      speeds[i] = 0.008 + Math.random() * 0.012;
      zOffsets[i] = z;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;

      const pickColor = Math.random();
      const chosenColor = pickColor > 0.4 ? colorCrimson : pickColor > 0.2 ? colorRose : colorSilver;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Subtle 3D Geometric Crystal Core
    const crystalGeom = new THREE.IcosahedronGeometry(1.6, 1);
    const crystalMat = new THREE.MeshBasicMaterial({
      color: 0xe8384f,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
    scene.add(crystalMesh);

    // Delicate Orbital Ring
    const ringGeom = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe8384f,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // Render Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Subtle crystal & ring rotation
      crystalMesh.rotation.y = elapsed * 0.25;
      crystalMesh.rotation.x = elapsed * 0.15;
      ring.rotation.z = elapsed * 0.3;

      // Update 3D particle vortex positions
      const posAttr = geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i];
        // Gentle breathing radius pulsation
        const r = initialRadii[i] + Math.sin(elapsed * 1.5 + i) * 0.3;
        const z = zOffsets[i] + Math.cos(elapsed * 1.2 + i) * 0.4;

        posAttr.array[i * 3] = Math.cos(angles[i]) * r;
        posAttr.array[i * 3 + 1] = Math.sin(angles[i]) * r;
        posAttr.array[i * 3 + 2] = z;
      }
      posAttr.needsUpdate = true;

      // Gentle camera breathing
      camera.position.z = 18 + Math.sin(elapsed * 0.8) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 2. Smooth Harmonic Calibration & Fade-Out Transition
  useEffect(() => {
    try {
      soundManager.playBootSweep(2.0);
    } catch (_) {}

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 10) + 6;
        return Math.min(100, prev + step);
      });
    }, 70);

    const completionTimer = setTimeout(() => {
      setIsFadingOut(true);
      try {
        soundManager.playMatchChime();
      } catch (_) {}
      setTimeout(() => {
        onBootComplete();
      }, 600);
    }, 2200);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completionTimer);
    };
  }, [onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen bg-[#FAFAF9] text-slate-900 flex flex-col justify-between p-8 select-none transition-all duration-700 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 🌌 3D WebGL Particle Canvas Backdrop */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Top Subtle Status Pill */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E8384F]" />
          <span className="text-slate-500 font-semibold">CERTUS KERNEL</span>
        </div>
        <span className="text-slate-400 text-[11px]">Track 4 • Razorpay 2026</span>
      </div>

      {/* 🏛️ Center Minimalist Monogram & Subtle Calibration State */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-5 text-center max-w-sm mx-auto w-full">
        {/* Clean Logo Vessel */}
        <div className="p-5 rounded-3xl bg-white/90 border border-slate-200/80 shadow-xl backdrop-blur-md">
          <CertusLogo className="w-14 h-14" showText={false} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            CERTUS <span className="text-[#E8384F]">SOVEREIGN</span>
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-widest font-semibold">
            Autonomous Financial Controller
          </p>
        </div>

        {/* Subtle Single-Line Calibration Progress */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold">
            <span>Calibrating 55 Invariants</span>
            <span className="text-[#E8384F] font-bold">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E8384F] to-[#FF2E4D] rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Subtle Attribution */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Sovereign Multi-Rail Reconciler</span>
        <span>Aditya Singh</span>
      </div>
    </div>
  );
}
