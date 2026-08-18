"use client";

import React, { useState, Suspense } from "react";
import { User, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/core/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto relative z-10">
      <Link href="/login" className="inline-flex items-center gap-3 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors text-[10px] font-mono tracking-widest uppercase mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Member Portal</span>
      </Link>

      <div className="stealth-card p-10 md:p-14 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] rounded-sm shadow-sm">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-white)] flex items-center justify-center mx-auto mb-6 border border-[var(--color-cyber-gray)] rounded-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="text-[10px] font-mono font-bold text-[var(--color-cyber-white)] tracking-[0.2em] uppercase mb-4">MEMBER AUTHENTICATION</div>
          <h2 className="text-3xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter uppercase">
            Sign In
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-cyber-red/30 bg-cyber-red/10 text-cyber-red text-sm font-mono flex items-start gap-3 rounded-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-cyber-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@socs.network"
                className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] pl-12 pr-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Passcode</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-cyber-muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] pl-12 pr-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
              />
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="btn-primary w-full py-4 text-[10px] font-bold uppercase tracking-widest mt-8 cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm text-center space-y-2">
          <p className="text-[10px] font-mono text-cyber-blue uppercase tracking-widest">Demo Access Credentials:</p>
          <div className="text-[9px] font-mono text-[var(--color-cyber-muted)] grid grid-cols-2 gap-2 text-left">
            <span>Member:</span> <span>member@socs.ac.in / member123</span>
            <span>Admin:</span> <span>admin@socs.ac.in / admin123</span>
            <span>SuperAdmin:</span> <span>superadmin@socs.ac.in / super123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="relative min-h-[85vh] w-full flex items-center justify-center pt-24 pb-12 px-4">
      <Suspense fallback={<div className="font-mono text-cyber-blue animate-pulse">Loading secure connection...</div>}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
