"use client";

import React, { useEffect } from "react";
import { registerGSAP } from "@/shared/lib/animations";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  useEffect(() => {
    registerGSAP();
  }, []);

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center bg-[var(--color-cyber-black)] ${className}`}>
      {/* Page Content */}
      <div className="relative z-10 w-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
