import React from "react";
import Link from "next/link";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "gold" | "coral" | "outline";
  children: React.ReactNode;
}

export function NeonButton({
  href,
  variant = "primary",
  children,
  className = "",
  ...props
}: NeonButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-150 px-6 py-2.5 rounded-xl text-sm select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2";

  const variants = {
    primary: "brawl-btn-primary",
    gold: "brawl-btn-gold",
    coral: "bg-rose-500 hover:bg-rose-400 text-white border-2 border-rose-600 shadow-[0_4px_0_#9F1239,0_8px_16px_rgba(244,63,94,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#9F1239]",
    outline: "brawl-btn-outline",
  };

  const classes = `${baseClasses} ${variants[variant] || variants.primary} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
