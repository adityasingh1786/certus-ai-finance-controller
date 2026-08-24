import React from "react";

export default function CertusLogo({ className = "w-6 h-6", textClassName = "text-lg font-bold" }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`rounded-md bg-sterling flex items-center justify-center text-white font-bold font-display text-xs ${className}`}>
        C
      </div>
      <span className={`font-display font-bold text-ink-primary tracking-tight ${textClassName}`}>
        Certus
      </span>
    </div>
  );
}
