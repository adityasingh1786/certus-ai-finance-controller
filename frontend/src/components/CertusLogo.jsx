import React, { useState } from "react";

export default function CertusLogo({
  className = "w-7 h-7",
  textClassName = "text-base font-bold",
  showText = true,
  is3D = true,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center gap-2.5 group select-none">
      <div className={`relative flex items-center justify-center rounded-xl overflow-hidden shadow-xs transition-transform duration-300 group-hover:scale-105 ${className}`}>
        {is3D && !imgError ? (
          <img
            src="/certus-3d-logo.jpg"
            alt="Certus 3D Logo"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-xl shadow-xs"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#E8384F] to-[#C02636] flex items-center justify-center text-white font-bold font-display shadow-xs text-xs">
            C
          </div>
        )}
        {/* Specular sheen micro-overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none rounded-xl" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold text-slate-900 tracking-tight leading-none group-hover:text-[#E8384F] transition-colors ${textClassName}`}>
            Certus
          </span>
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest font-semibold mt-0.5">
            Finance OS
          </span>
        </div>
      )}
    </div>
  );
}
