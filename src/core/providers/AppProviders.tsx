"use client";

import React from "react";
import { SmoothScroll } from "@/shared/components/layout/SmoothScroll";
import { PageTransition } from "@/shared/components/layout/PageTransition";
import { ThemeProvider } from "@/core/context/ThemeContext";
import { Terminal } from "@/features/terminal";
import { AudioProvider } from "@/core/context/AudioContext";
import { CRTOverlay } from "@/shared/components/ui/CRTOverlay";
import { DeepWebProvider } from "@/core/context/DeepWebContext";
import { DeepWebFeatures } from "@/shared/components/ui/DeepWebFeatures";
import { SystemStatusDock } from "@/shared/components/ui/SystemStatusDock";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <DeepWebProvider>
      <AudioProvider>
        <ThemeProvider>
          {/* Background and Terminal live here so they can access ThemeContext */}
          <Terminal />
          <SmoothScroll>
            <PageTransition>
              {children}
            </PageTransition>
          </SmoothScroll>
          <CRTOverlay />
          <DeepWebFeatures />
          <SystemStatusDock />
        </ThemeProvider>
      </AudioProvider>
    </DeepWebProvider>
  );
}
