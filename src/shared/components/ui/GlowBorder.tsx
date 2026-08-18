import React from "react";

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export function GlowBorder({ children, className = "" }: GlowBorderProps) {
  return (
    <div className={`relative h-full transition-all duration-200 ${className}`}>
      <div className="w-full h-full bg-white rounded-2xl border-2 border-slate-200 shadow-[0_4px_0_#E2E8F0,0_10px_25px_-4px_rgba(15,23,42,0.05)] hover:border-sky-300 hover:shadow-[0_6px_0_#CBD5E1,0_15px_30px_-4px_rgba(2,132,199,0.12)] hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
