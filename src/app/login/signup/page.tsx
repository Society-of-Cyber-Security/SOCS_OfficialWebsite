"use client";

import React from "react";
import { User, Mail, ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="relative min-h-[85vh] w-full flex items-center justify-center pt-24 pb-12 px-4">
      <div className="w-full max-w-[500px] relative z-10">
        <Link href="/login" className="inline-flex items-center gap-3 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors text-[10px] font-mono tracking-widest uppercase mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Member Portal</span>
        </Link>

        <div className="stealth-card p-10 md:p-14 bg-[var(--color-cyber-white)] border border-[var(--color-cyber-white)] rounded-sm shadow-sm">
          <div className="mb-12 text-center">
            <div className="w-16 h-16 bg-[var(--color-cyber-light)] text-[var(--color-cyber-black)] flex items-center justify-center mx-auto mb-6 border border-[var(--color-cyber-white)] rounded-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-[10px] font-mono font-bold text-[var(--color-cyber-neon)] tracking-[0.2em] uppercase mb-4">MEMBERSHIP APPLICATION</div>
            <h2 className="text-3xl font-heading font-black text-[var(--color-cyber-black)] tracking-tighter uppercase">
              Create Account
            </h2>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const btn = e.currentTarget.querySelector("button");
              if (btn) btn.innerHTML = "Creating Account...";
              setTimeout(() => (window.location.href = "/"), 1200);
            }}
          >
            <div className="space-y-3">
              <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-cyber-light)]" />
                <input
                  type="text"
                  required
                  placeholder="Abhishek Kumar"
                  className="w-full bg-[var(--color-cyber-light)] border border-[var(--color-cyber-white)] pl-12 pr-4 py-4 text-[var(--color-cyber-black)] font-mono text-sm outline-none focus:border-[var(--color-cyber-neon)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-cyber-light)]" />
                <input
                  type="email"
                  required
                  placeholder="operator@socs.network"
                  className="w-full bg-[var(--color-cyber-light)] border border-[var(--color-cyber-white)] pl-12 pr-4 py-4 text-[var(--color-cyber-black)] font-mono text-sm outline-none focus:border-[var(--color-cyber-neon)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Passcode</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-cyber-light)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[var(--color-cyber-light)] border border-[var(--color-cyber-white)] pl-12 pr-4 py-4 text-[var(--color-cyber-black)] font-mono text-sm outline-none focus:border-[var(--color-cyber-neon)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-[var(--color-cyber-light)] border border-[var(--color-cyber-white)] text-[9px] font-mono uppercase tracking-widest text-[var(--color-cyber-muted)] leading-relaxed text-center rounded-sm mt-8">
              By registering, you agree to adhere to the SOCS ethical hacking charter and research security code of conduct.
            </div>

            <button type="submit" className="w-full bg-[var(--color-cyber-neon)] text-white hover:bg-[var(--color-cyber-black)] hover:text-[var(--color-cyber-white)] font-heading font-bold py-4 text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-3 mt-8 cursor-pointer rounded-sm">
              <Sparkles className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[var(--color-cyber-light)] text-center">
            <p className="text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">
              Already applied? <Link href="/login/signin" className="text-[var(--color-cyber-neon)] hover:text-[var(--color-cyber-black)] font-bold ml-2 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
