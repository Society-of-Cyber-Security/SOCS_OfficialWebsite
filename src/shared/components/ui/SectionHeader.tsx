import React from "react";
import { Sparkles } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  tag?: string;
}

export function SectionHeader({ title, subtitle, className = "", tag = "EVENT PROTOCOL" }: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${className}`}>
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-bold tracking-widest uppercase rounded-full mb-3 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-spin" style={{ animationDuration: "6s" }} />
        <span>{tag}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-grotesk text-slate-900 tracking-tighter flex items-center gap-3">
        <span>{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-3 text-slate-600 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
