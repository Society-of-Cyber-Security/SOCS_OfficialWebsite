"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { Shield, Fingerprint, Activity, Lock } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "@/core/context/AuthContext";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

export default function JoinPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuth();

  const titleRef = useRef(null);
  const textRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(titleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo(textRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
      .fromTo(formRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.4");
  }, []);

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
        if (checkAuth) await checkAuth();
        router.push("/");
      } else {
        alert(data.error || "Application failed. Please contact admin.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <PageWrapper className="pt-32 pb-32 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="w-full max-w-xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--color-cyber-muted)]" />
              </div>
            </div>
            
            <h1 ref={titleRef} className="font-heading font-black text-5xl md:text-6xl text-[var(--color-cyber-white)] tracking-tighter uppercase mb-4 opacity-0">
              Join the Network
            </h1>
            
            <p ref={textRef} className="text-[var(--color-cyber-light)] font-mono text-sm leading-relaxed max-w-md mx-auto opacity-0">
              Create an account to propose projects, resources, and events for the Society of Cyber Security.
            </p>
          </div>

          <div ref={formRef} className="opacity-0 relative">
            <div className="stealth-card p-10 md:p-12 border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)] rounded-sm shadow-sm relative overflow-hidden flex flex-col items-center text-center">
              
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--color-cyber-blue)] opacity-50"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[var(--color-cyber-blue)] opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[var(--color-cyber-blue)] opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--color-cyber-blue)] opacity-50"></div>

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-14 h-14 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-white)] flex items-center justify-center mb-8 border border-[var(--color-cyber-gray)] rounded-sm">
                  <Fingerprint className="w-6 h-6" />
                </div>
                
                <span className="text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-[0.2em] block mb-4">
                  New Recruit Authorization
                </span>
                
                <h3 className="text-3xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-6">
                  Apply for Access
                </h3>
                
                <p className="text-[var(--color-cyber-light)] font-body text-sm mb-10 leading-relaxed border-t border-b border-[var(--color-cyber-gray)] py-4 w-full">
                  Use your Google Workspace account to generate a secure application token.
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
                        alert("Google Authentication Failed");
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
          </div>
          
        </div>
      </PageWrapper>
    </GoogleOAuthProvider>
  );
}
