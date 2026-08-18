"use client";

import React from "react";
import { SmoothScroll } from "@/shared/components/layout/SmoothScroll";
import { PageTransition } from "@/shared/components/layout/PageTransition";
import { ThemeProvider } from "@/core/context/ThemeContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SmoothScroll>
        <PageTransition>
          {children}
        </PageTransition>
      </SmoothScroll>
    </ThemeProvider>
  );
}
