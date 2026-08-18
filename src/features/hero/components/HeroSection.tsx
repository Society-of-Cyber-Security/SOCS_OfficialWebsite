"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { Marquee } from "@/shared/components/ui/Marquee";
import { motion } from "framer-motion";
import { useAuth } from "@/core/context/AuthContext";

const NodeNetwork3D = dynamic(
  () => import("@/features/visualizations/components/NodeNetwork3D").then(m => ({ default: m.NodeNetwork3D })),
  {
    ssr: false, 
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[var(--color-cyber-black)] relative overflow-hidden">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20 animate-spin-slow">
          <circle cx="30" cy="30" r="28" stroke="var(--color-cyber-white)" strokeWidth="1"/>
          <circle cx="30" cy="30" r="14" stroke="var(--color-cyber-white)" strokeWidth="1"/>
          <line x1="30" y1="2" x2="30" y2="16" stroke="var(--color-cyber-white)" strokeWidth="1"/>
          <line x1="30" y1="44" x2="30" y2="58" stroke="var(--color-cyber-white)" strokeWidth="1"/>
          <line x1="2" y1="30" x2="16" y2="30" stroke="var(--color-cyber-white)" strokeWidth="1"/>
          <line x1="44" y1="30" x2="58" y2="30" stroke="var(--color-cyber-white)" strokeWidth="1"/>
        </svg>
      </div>
    )
  }
);

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(".hero-reveal",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
      );

      tl.fromTo(visualRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 2, ease: "power2.out" },
        "-=0.5"
      );
    }, contentRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 min-h-[90vh] flex flex-col justify-center overflow-hidden w-full bg-[var(--color-cyber-black)] text-[var(--color-cyber-white)]">
        
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <div className="hero-reveal mb-8">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-cyber-muted)] border border-[var(--color-cyber-gray)] px-3 py-1.5 rounded-sm">
                Research • Defense • Community
              </span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="hero-reveal font-heading font-black text-[clamp(4.5rem,9vw,8rem)] leading-[0.95] tracking-tighter mb-8">
              Society of <br/>
              <span className="text-gradient-multi font-display font-bold tracking-tighter text-[clamp(5rem,10vw,9rem)] leading-[0.9] pr-2">Cyber</span> <br/>
              Security.
            </h1>

            {/* Subtext */}
            <p className="hero-reveal font-body text-lg md:text-xl text-[var(--color-cyber-light)] max-w-xl mb-12 leading-relaxed">
              We are an interdisciplinary organization dedicated to the exploration, research, and dissemination of computer security knowledge.
            </p>

            {/* CTA Buttons */}
            <div className="hero-reveal flex flex-col sm:flex-row gap-4 mb-16">
              {!isAuthenticated && (
                <Link href="/join" className="btn-primary px-8 py-4 text-sm uppercase tracking-widest rounded-sm">
                  Apply for Membership
                </Link>
              )}
              <Link href="/projects" className="btn-outline px-8 py-4 text-sm uppercase tracking-widest rounded-sm">
                View Initiatives <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Metrics List */}
            <div className="hero-reveal flex flex-col sm:flex-row gap-8 pt-8 border-t border-[var(--color-cyber-gray)]">
              <div className="flex flex-col gap-1">
                <span className="font-heading font-bold text-3xl">42+</span>
                <span className="font-mono text-[10px] text-[var(--color-cyber-muted)] uppercase tracking-wider">Active Members</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-heading font-bold text-3xl">15+</span>
                <span className="font-mono text-[10px] text-[var(--color-cyber-muted)] uppercase tracking-wider">Research Projects</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-heading font-bold text-3xl text-[var(--color-cyber-neon)]">08</span>
                <span className="font-mono text-[10px] text-[var(--color-cyber-muted)] uppercase tracking-wider">CTF Victories</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visualization */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[400px]">
            <div ref={visualRef} className="w-full aspect-square relative lg:scale-110 xl:scale-125 z-0">
              <NodeNetwork3D />
              
              {/* Subtle Decorative Elements */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[var(--color-cyber-neon)] opacity-60" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[var(--color-cyber-cyan)] opacity-60" />
            </div>
          </div>

        </div>
      </section>

      {/* Marquee Strip */}
      <div className="w-full bg-[#E5E7EB] py-5 border-y border-[#E5E7EB] overflow-hidden">
        <Marquee className="[--gap:4rem]" repeat={10} pauseOnHover>
          {["Ethical Hacking", "CTF Champions", "Research-Led", "Open Source", "OSINT", "Reverse Engineering", "Cryptography", "Network Security"].map((text, i) => (
            <div key={i} className="flex items-center gap-16">
              <span className="text-[var(--color-cyber-black)] font-mono text-base md:text-lg font-bold uppercase tracking-[0.2em] opacity-80">{text}</span>
              <span className="w-2 h-2 bg-cyber-green rounded-full" />
            </div>
          ))}
        </Marquee>
      </div>
    </>
  );
}
