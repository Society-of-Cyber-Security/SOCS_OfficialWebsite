"use client";

import React from "react";

interface GlitchTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export function GlitchText({ text, as: Component = "span", className = "" }: GlitchTextProps) {
  return (
    <Component className={`inline-block font-inherit transition-all duration-300 ${className}`}>
      {text}
    </Component>
  );
}
