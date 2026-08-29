import React, { useState } from "react";

export default function CertusLogo({
  className = "w-8 h-8",
  textClassName = "text-base font-bold",
  showText = true,
  showBadge = true,
  animated = true,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex items-center gap-2.5 group select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 🛡️ Sovereign Invariant Monogram (Dynamic SVG Geometry) */}
      <div className={`relative flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 shadow-md shadow-rose-500/10 ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-500 group-hover:rotate-3"
        >
          <defs>
            {/* Crimson Core Gradient */}
            <linearGradient id="certusCrimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF2E4D" />
              <stop offset="45%" stopColor="#E8384F" />
              <stop offset="100%" stopColor="#9F1239" />
            </linearGradient>

            {/* Specular Edge Gradient */}
            <linearGradient id="certusSpecularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Inner Shield Shadow Filter */}
            <filter id="certusGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#E8384F" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Shield Base */}
          <rect width="100" height="100" rx="24" fill="url(#certusCrimsonGrad)" />
          
          {/* Dynamic 3D Geometric Facets */}
          <path
            d="M 50 15 L 85 35 L 85 65 L 50 85 L 15 65 L 15 35 Z"
            fill="black"
            fillOpacity="0.08"
          />

          {/* Interlocking Consensus "C" / Infinity Arch */}
          <path
            d="M 68 32 C 60 22 40 22 32 30 C 22 40 22 60 32 70 C 40 78 60 78 68 68 C 72 63 72 55 68 55 C 64 55 62 58 59 62 C 53 68 43 68 38 62 C 32 56 32 44 38 38 C 43 32 53 32 59 38 C 62 42 64 45 68 45 C 72 45 72 37 68 32 Z"
            fill="#FFFFFF"
            filter="url(#certusGlow)"
          />

          {/* Central Sovereign Invariant Pulse Core */}
          <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="2.5" fill="#E8384F" />

          {/* Specular Top-Left Bevel Highlight */}
          <rect
            width="100"
            height="100"
            rx="24"
            stroke="url(#certusSpecularGrad)"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Dynamic Specular Laser Sheen Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 pointer-events-none rounded-xl transition-transform duration-700 ${
            isHovered ? "translate-x-full translate-y-full" : "-translate-x-full -translate-y-full"
          }`}
        />
      </div>

      {/* Modern High-Tracking Sovereign Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-display font-bold text-slate-900 tracking-tight leading-none group-hover:text-[#E8384F] transition-colors ${textClassName}`}>
              CERTUS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8384F] animate-pulse" />
          </div>
          {showBadge && (
            <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest font-semibold mt-0.5 group-hover:text-slate-800 transition-colors">
              SOVEREIGN FINANCE OS
            </span>
          )}
        </div>
      )}
    </div>
  );
}
