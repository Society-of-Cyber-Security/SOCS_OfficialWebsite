"use client";

import React, { useEffect, useRef, useState } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { fadeUpOnScroll } from "@/shared/lib/animations";
import { ArrowRight, AlertCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/context/AuthContext";
import Link from "next/link";

export default function JoinPage() {
  const formRef = useRef<HTMLDivElement>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (formRef.current) fadeUpOnScroll(formRef.current);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      await register(name, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.data?.error || err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="pt-32 pb-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-cyber-blue)] to-transparent opacity-20"></div>
      <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-cyber-blue)] to-transparent opacity-10"></div>
      
      <div className="max-w-xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--color-cyber-dark)] rounded-full mb-6 border border-[var(--color-cyber-gray)]">
            <UserPlus className="w-8 h-8 text-[var(--color-cyber-blue)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter uppercase mb-4">
            Join the Network
          </h1>
          <p className="text-[var(--color-cyber-muted)] font-mono text-sm max-w-md mx-auto">
            Create an account to propose projects, resources, and events for the Society of Cyber Security.
          </p>
        </div>

        <div ref={formRef} className="opacity-0 relative">
          <div className="stealth-card p-8 md:p-12 border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)] rounded-sm shadow-sm relative overflow-hidden">
            
            {/* Decorative Corner Elements */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--color-cyber-blue)] opacity-50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[var(--color-cyber-blue)] opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[var(--color-cyber-blue)] opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--color-cyber-blue)] opacity-50"></div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <div className="mb-6 p-4 border border-cyber-red/30 bg-cyber-red/10 text-cyber-red text-sm font-mono flex items-start gap-3 rounded-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">
                  Full Name
                </label>
                <input 
                  required 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] px-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">
                  Contact Email
                </label>
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] px-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
                  placeholder="user@university.edu"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">
                  Password
                </label>
                <input 
                  required 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] px-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="pt-6 border-t border-[var(--color-cyber-gray)]">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span>{isSubmitting ? 'Registering...' : 'Create Account'}</span>
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs font-mono text-[var(--color-cyber-muted)]">
                  Already have an account? <Link href="/login" className="text-[var(--color-cyber-white)] hover:text-[var(--color-cyber-blue)] underline underline-offset-4 decoration-[var(--color-cyber-gray)] transition-colors">Sign in here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
