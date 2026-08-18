"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { Shield, Lock, Cpu, Fingerprint, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [view, setView] = useState<"initial" | "selection">("initial");
  const [loading, setLoading] = useState(false);

  const handleInitialClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView("selection");
    }, 1200);
  };

  return (
    <PageWrapper className="flex items-center justify-center min-h-[85vh] pt-24 pb-32">
      <div className="w-full max-w-[1000px] mx-auto flex flex-col items-center justify-center relative px-6 z-10">
        <AnimatePresence mode="wait">
          {view === "initial" ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center w-full"
            >
              {/* Central Auth Interactive Orb Card */}
              <div 
                className="stealth-card p-10 sm:p-16 flex flex-col items-center text-center cursor-pointer max-w-lg w-full relative overflow-hidden group border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)] hover:border-[var(--color-cyber-white)] transition-colors rounded-sm shadow-sm"
                onClick={handleInitialClick}
              >
                <div className="w-32 h-32 rounded-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] flex items-center justify-center group-hover:border-[var(--color-cyber-white)] transition-all mb-10 relative z-10">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="w-8 h-8 text-[var(--color-cyber-white)] animate-spin" />
                      <span className="text-[9px] font-mono font-bold text-[var(--color-cyber-white)] tracking-[0.2em] uppercase">Authenticating</span>
                    </div>
                  ) : (
                    <>
                      <Fingerprint className="w-12 h-12 text-[var(--color-cyber-muted)] group-hover:text-[var(--color-cyber-white)] transition-colors" />
                    </>
                  )}
                </div>

                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-6 flex items-center justify-center gap-2 relative z-10">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secure Access Portal</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-4 relative z-10 leading-none">
                  Member Portal
                </h2>
                
                <p className="text-[var(--color-cyber-light)] font-body text-sm mb-10 relative z-10 leading-relaxed max-w-sm">
                  {loading ? "Establishing secure session handshake..." : "Authenticate your identity to access the internal dashboard."}
                </p>

                <div className="btn-primary w-full py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-3 relative z-10 rounded-sm">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative z-10"
            >
              {/* Sign In Protocol */}
              <div className="stealth-card p-10 md:p-12 h-full flex flex-col justify-between relative overflow-hidden bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] group hover:border-[var(--color-cyber-white)] transition-colors rounded-sm shadow-sm">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-white)] flex items-center justify-center mb-8 border border-[var(--color-cyber-gray)] group-hover:border-[var(--color-cyber-white)] transition-colors rounded-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-[0.2em] block mb-4">
                    Existing Member
                  </span>
                  <h3 className="text-3xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-6">
                    Sign In
                  </h3>
                  <p className="text-[var(--color-cyber-light)] font-body text-sm mb-10 leading-relaxed border-l-2 border-[var(--color-cyber-gray)] pl-4 py-1">
                    Restore your existing session in the SOCS network and synchronize your credentials and dashboard data.
                  </p>
                </div>

                <Link href="/login/signin" className="btn-primary w-full py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-3 relative z-10 rounded-sm mt-auto">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Sign Up Protocol */}
              <div className="stealth-card p-10 md:p-12 h-full flex flex-col justify-between relative overflow-hidden bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] group hover:border-[var(--color-cyber-white)] transition-colors rounded-sm shadow-sm">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-white)] flex items-center justify-center mb-8 border border-[var(--color-cyber-gray)] group-hover:border-[var(--color-cyber-white)] transition-colors rounded-sm">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-cyber-neon)] uppercase tracking-[0.2em] block mb-4">
                    New Application
                  </span>
                  <h3 className="text-3xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-6">
                    Apply for Access
                  </h3>
                  <p className="text-[var(--color-cyber-light)] font-body text-sm mb-10 leading-relaxed border-l-2 border-[var(--color-cyber-neon)] pl-4 py-1">
                    Begin the recruitment protocol and establish your unique cryptographic identity in the society network.
                  </p>
                </div>

                <Link href="/join" className="btn-primary w-full py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-3 relative z-10 rounded-sm mt-auto">
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
