"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HackerMask3D } from "@/features/visualizations/components/HackerMask3D";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content slide in
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );

      // Mask fade in
      gsap.fromTo(
        maskRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 w-full relative overflow-hidden bg-[#0A0A0F]">
      
      {/* Massive Watermark Number */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 pointer-events-none select-none z-0">
        <span className="font-bebas text-[35vw] text-white/5 leading-none">01</span>
      </div>

      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
          
          {/* Left: Content */}
          <div ref={contentRef} className="flex flex-col space-y-8 opacity-0">
            <div className="flex flex-col space-y-2">
              <span className="mono-label text-[#00F0FF] text-sm">CORE_DIRECTIVE</span>
              <h2 className="font-bebas text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-white leading-[0.9] tracking-tighter uppercase">
                Mission & <br/>Operational Directives
              </h2>
            </div>
            
            <div className="space-y-6 max-w-2xl">
              <p className="text-[#F0EDE6]/90 text-xl font-medium leading-relaxed">
                The Society of Cyber Security (SOCS) is an interdisciplinary organization dedicated to the exploration, research, and dissemination of computer security knowledge.
              </p>
              <p className="text-[#F0EDE6]/60 text-base leading-relaxed">
                We bridge the gap between theoretical academia and practical hacking. By fostering a collaborative ecosystem, we empower the next generation of researchers to secure the digital frontier through deep exploitation analysis.
              </p>
            </div>
            
            <div className="pt-4 flex flex-wrap gap-4">
              <div className="mono-label border-l-2 border-[#00F0FF] pl-3 text-xs text-white/50 bg-white/5 py-1.5 pr-4">
                ETHICAL_FIRST
              </div>
              <div className="mono-label border-l-2 border-[#C9A84C] pl-3 text-xs text-white/50 bg-white/5 py-1.5 pr-4">
                RESEARCH_LED
              </div>
            </div>

            {/* Executive Quote */}
            <div className="pt-10 mt-6 border-t border-white/10 relative">
              <span className="absolute -top-6 left-0 text-7xl font-bebas text-[#00F0FF] opacity-30 leading-none">"</span>
              <p className="text-2xl font-bebas text-white tracking-wide italic">
                We build it up, tear it down, and figure out how it ticks.
              </p>
            </div>
          </div>

          {/* Right: 3D Mask */}
          <div ref={maskRef} className="stealth-card p-6 flex items-center justify-center relative min-h-[400px] lg:min-h-[600px] opacity-0 group">
            <div className="absolute inset-0 scanlines opacity-20 pointer-events-none mix-blend-overlay" />
            
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/40 uppercase">
              SYS.NODE_ID: 0x99F
            </div>

            <div className="w-full h-full relative z-10 scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out">
              <HackerMask3D />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
