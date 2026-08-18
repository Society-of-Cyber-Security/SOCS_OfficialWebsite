"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";

const HackerMask3D = dynamic(
  () => import("@/features/visualizations/components/HackerMask3D").then(m => ({ default: m.HackerMask3D })),
  { ssr: false }
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function IdentitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".identity-reveal",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="py-24 md:py-36 w-full relative bg-[var(--color-cyber-black)] text-[var(--color-cyber-white)] border-t border-[var(--color-cyber-gray)]">
      
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left: Sticky Label & 3D Model */}
          <div className="lg:col-span-4 flex flex-col relative min-h-[400px]">
            <div className="sticky top-32 identity-reveal z-10">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)]">
                01 — Organizational Identity
              </span>
            </div>
            
            {/* 3D Model Injection */}
            <div className="absolute inset-0 mt-24 opacity-80 z-0">
              <HackerMask3D />
            </div>
          </div>
          
          {/* Right: Content */}
          <div ref={contentRef} className="lg:col-span-8 flex flex-col space-y-16 relative z-10">
            
            <div className="identity-reveal">
              <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-8">
                Security is not a perimeter. <br />
                <span className="text-gradient-secondary font-display font-bold tracking-tighter">It is a continuous practice.</span>
              </h2>
              
              <div className="space-y-8 max-w-2xl font-body text-lg text-[var(--color-cyber-light)] leading-relaxed">
                <p>
                  The Society of Cyber Security (SOCS) bridges the gap between theoretical academia and practical hacking. By fostering a collaborative ecosystem, we empower the next generation of researchers to secure the digital frontier through deep exploitation analysis.
                </p>
                <p>
                  We believe that the most effective way to build secure systems is to understand exactly how they break. Our members actively engage in vulnerability research, reverse engineering, and competitive intelligence.
                </p>
              </div>
            </div>
            
            <div className="identity-reveal grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-[var(--color-cyber-gray)]">
              <div className="flex flex-col gap-3">
                <span className="font-heading font-bold text-xl">Ethical First</span>
                <p className="font-body text-sm text-[var(--color-cyber-light)]">
                  All research and operations are conducted within strict ethical boundaries and responsible disclosure frameworks.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-heading font-bold text-xl">Research Led</span>
                <p className="font-body text-sm text-[var(--color-cyber-light)]">
                  We prioritize deep technical understanding over surface-level tool utilization. We build it up, tear it down, and figure out how it ticks.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
