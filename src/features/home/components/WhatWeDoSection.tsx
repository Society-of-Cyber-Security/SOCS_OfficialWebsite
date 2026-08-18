"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const areas = [
  {
    id: "01",
    title: "Vulnerability Research",
    description: "Deep dive into system architectures, finding and exploiting zero-days, and developing proof-of-concepts.",
    href: "/projects"
  },
  {
    id: "02",
    title: "Offensive Operations",
    description: "Competing in global Capture The Flag (CTF) events and conducting adversarial simulations.",
    href: "/events"
  },
  {
    id: "03",
    title: "Defensive Engineering",
    description: "Building hardened systems, custom firewalls, and automated threat intelligence pipelines.",
    href: "/projects"
  },
  {
    id: "04",
    title: "Knowledge Exchange",
    description: "Hosting technical workshops, releasing whitepapers, and training the next generation of security experts.",
    href: "/resources"
  }
];

export function WhatWeDoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".index-row",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 md:py-36 w-full bg-[var(--color-cyber-dark)] text-[var(--color-cyber-white)] border-t border-[var(--color-cyber-gray)]">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        
        <div className="mb-16 index-row">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)]">
            02 — Areas of Focus
          </span>
        </div>

        <div className="flex flex-col border-t border-[var(--color-cyber-white)]">
          {areas.map((area, idx) => (
            <Link
              key={area.id}
              href={area.href}
              className="index-row group block border-b border-[var(--color-cyber-gray)] hover:bg-[var(--color-cyber-black)] transition-colors duration-300"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="py-10 md:py-16 px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12 relative">
                
                {/* Active Indicator Line */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-cyber-neon)] transition-transform duration-300 origin-top ${
                    hoveredIndex === idx ? "scale-y-100" : "scale-y-0"
                  }`} 
                />

                <div className="flex items-baseline gap-6 md:gap-12 md:w-1/2">
                  <span className="font-mono text-sm text-[var(--color-cyber-muted)]">
                    {area.id}
                  </span>
                  <h3 className="font-heading font-black text-3xl md:text-5xl lg:text-6xl tracking-tighter transition-transform duration-300 group-hover:translate-x-4">
                    {area.title}
                  </h3>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:w-1/2 justify-between">
                  <p className="font-body text-sm md:text-base text-[var(--color-cyber-light)] max-w-sm">
                    {area.description}
                  </p>
                  
                  <div className="shrink-0 w-12 h-12 rounded-full border border-[var(--color-cyber-gray)] flex items-center justify-center group-hover:bg-[var(--color-cyber-white)] group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-45" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
