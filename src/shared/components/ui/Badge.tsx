import React from "react";

interface BadgeProps {
  label: string;
  color?: "default" | "neon" | "gold" | "blue" | "purple" | "coral" | "emerald" | "dim";
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ label, color = "default", className = "", icon }: BadgeProps) {
  const colors = {
    default: "bg-slate-100 border-slate-300 text-slate-700",
    neon: "bg-sky-50 border-sky-300 text-sky-700 shadow-sm",
    blue: "bg-sky-50 border-sky-300 text-sky-700",
    gold: "bg-amber-50 border-amber-300 text-amber-800",
    purple: "bg-indigo-50 border-indigo-300 text-indigo-700",
    coral: "bg-rose-50 border-rose-300 text-rose-700",
    emerald: "bg-emerald-50 border-emerald-300 text-emerald-700",
    dim: "bg-slate-50 border-slate-200 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider border ${colors[color] || colors.default} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
