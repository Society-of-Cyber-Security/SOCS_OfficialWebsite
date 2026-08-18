"use client";

import React, { useRef, useEffect } from "react";
import { NumberTicker } from "@/shared/components/ui/NumberTicker";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stat-block",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
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
    <section ref={sectionRef} className="py-24 w-full bg-[var(--color-cyber-black)] relative">
      
      {/* Top Label */}
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-12">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)]">
          03 — Impact Metrics
        </span>
      </div>

      <div className="w-full border-y border-[var(--color-cyber-gray)]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-cyber-gray)]">
            
            {/* Metric 001: Active Members */}
            <div className="stat-block py-16 md:py-20 md:pr-12 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="font-heading font-black text-[clamp(4rem,8vw,7rem)] leading-[0.85] text-gradient-blue mb-4">
                <NumberTicker value={42} />
                <span className="text-[var(--color-cyber-muted)] font-light">+</span>
              </div>
              <div className="font-mono text-sm uppercase tracking-widest text-[var(--color-cyber-light)] font-medium">
                Active Members
              </div>
            </div>

            {/* Metric 002: Research Projects */}
            <div className="stat-block py-16 md:py-20 md:px-12 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="font-heading font-black text-[clamp(4rem,8vw,7rem)] leading-[0.85] text-gradient-red mb-4">
                <NumberTicker value={15} />
                <span className="text-[var(--color-cyber-muted)] font-light">+</span>
              </div>
              <div className="font-mono text-sm uppercase tracking-widest text-[var(--color-cyber-light)] font-medium">
                Research Projects
              </div>
            </div>

            {/* Metric 003: CTF Victories */}
            <div className="stat-block py-16 md:py-20 md:pl-12 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="font-heading font-black text-[clamp(4rem,8vw,7rem)] leading-[0.85] text-gradient-yellow mb-4">
                <NumberTicker value={8} />
              </div>
              <div className="font-mono text-sm uppercase tracking-widest text-[var(--color-cyber-light)] font-medium">
                CTF Victories
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
