"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { Shield, Fingerprint, Activity, ArrowRight, Lock } from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/context/AuthContext";

export default function LoginPage() {
  const [view, setView] = useState<"initial" | "selection">("initial");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Assuming useAuth exposes a generic login or we just use our custom checkAuth
  const { checkAuth } = useAuth();

  const handleInitialClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView("selection");
    }, 1200);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        // Force context update
        if (checkAuth) await checkAuth();
        // Redirect to home
        router.push("/");
      } else {
        alert(data.error || "Authentication failed");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error during authentication.");
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
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
                className="flex justify-center w-full relative z-10"
              >
                {/* Google Sign In Protocol */}
                <div className="stealth-card p-10 md:p-12 max-w-md w-full flex flex-col items-center text-center relative overflow-hidden bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] group hover:border-[var(--color-cyber-white)] transition-colors rounded-sm shadow-sm">
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="w-14 h-14 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-white)] flex items-center justify-center mb-8 border border-[var(--color-cyber-gray)] group-hover:border-[var(--color-cyber-white)] transition-colors rounded-sm">
                      <Lock className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-[0.2em] block mb-4">
                      Authorized Personnel Only
                    </span>
                    <h3 className="text-3xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-6">
                      Sign In
                    </h3>
                    <p className="text-[var(--color-cyber-light)] font-body text-sm mb-10 leading-relaxed border-t border-b border-[var(--color-cyber-gray)] py-4 w-full">
                      Authenticate using your Google Workspace account to access the SOCS dashboard.
                    </p>

                    <div className="w-full flex justify-center min-h-[50px] relative z-20 pointer-events-auto">
                      {loading ? (
                        <div className="flex items-center gap-2 text-[var(--color-cyber-neon)]">
                          <Activity className="w-5 h-5 animate-spin" />
                          <span className="font-mono text-xs uppercase">Processing</span>
                        </div>
                      ) : (
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            alert("Google Login Failed");
                          }}
                          theme="filled_black"
                          shape="rectangular"
                          size="large"
                          text="continue_with"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageWrapper>
    </GoogleOAuthProvider>
  );
}
