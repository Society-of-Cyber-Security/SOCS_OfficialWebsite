"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function EventsPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayEvents, setDisplayEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { fetchApi } = await import('@/shared/lib/api');
        const res = await fetchApi('/events');
        if (res && res.success) {
          setDisplayEvents(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load events", err);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (displayEvents.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".event-row",
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
  }, [displayEvents]);

  return (
    <section className="py-24 md:py-36 w-full bg-[var(--color-cyber-black)] border-t border-[var(--color-cyber-gray)]" ref={containerRef}>
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="flex flex-col space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)]">
              05 — Event Calendar
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[var(--color-cyber-white)] tracking-tighter">
              Upcoming Directives
            </h2>
          </div>
          <Link 
            href="/events" 
            className="group flex items-center gap-3 font-mono text-sm text-[var(--color-cyber-light)] hover:text-[var(--color-cyber-white)] transition-colors pb-2"
          >
            <span className="uppercase tracking-widest border-b border-transparent group-hover:border-[var(--color-cyber-white)] transition-all">View Full Calendar</span>
            <div className="w-8 h-8 rounded-full border border-[var(--color-cyber-gray)] flex items-center justify-center group-hover:bg-[var(--color-cyber-white)] group-hover:text-[var(--color-cyber-black)] transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
        
        <div className="flex flex-col border-t border-[var(--color-cyber-white)]">
          {displayEvents.map((event, idx) => {
            const date = new Date(event.date);
            const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
            const day = date.toLocaleDateString("en-US", { day: "2-digit" });
            const isCTF = event.type === "ctf";

            return (
              <Link 
                key={idx}
                href={`/events/${event.slug}`}
                className="event-row flex flex-col md:flex-row md:items-center gap-6 py-8 border-b border-[var(--color-cyber-gray)] group relative hover:bg-[var(--color-cyber-dark)] transition-colors duration-300"
              >
                {/* Hover line indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-cyber-neon)] scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />
                
                {/* Date */}
                <div className="flex flex-row md:flex-col items-baseline md:items-center justify-start md:justify-center w-32 shrink-0 transition-colors pl-6 md:pl-0">
                  <span className="font-heading font-black text-4xl sm:text-5xl text-[var(--color-cyber-white)] transition-colors">{day}</span>
                  <span className="font-mono text-sm text-[var(--color-cyber-muted)] ml-2 md:ml-0">{month}</span>
                </div>
                
                {/* Details */}
                <div className="flex-1 flex flex-col space-y-2 px-6 md:px-0">
                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--color-cyber-light)] group-hover:text-[var(--color-cyber-white)] tracking-tighter transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="font-mono text-[11px] text-[var(--color-cyber-muted)] uppercase flex items-center gap-2 tracking-widest">
                      <span className="w-1.5 h-1.5 bg-[var(--color-cyber-muted)] rounded-full" />
                      {event.location}
                    </span>
                  </div>
                </div>

                {/* Badge */}
                <div className="hidden md:flex shrink-0 items-center justify-end px-6">
                  <span className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1 border ${
                    isCTF ? "border-[var(--color-cyber-neon)] text-[var(--color-cyber-neon)] bg-[var(--color-cyber-neon)]/5" : "border-[var(--color-cyber-gray)] text-[var(--color-cyber-light)] bg-[var(--color-cyber-black)]"
                  }`}>
                    {event.type}
                  </span>
                </div>
              </Link>
            );
          })}
          
          {displayEvents.length === 0 && (
            <div className="py-12 text-center border-b border-[var(--color-cyber-gray)] text-sm font-mono text-[var(--color-cyber-muted)]">
              NO UPCOMING DIRECTIVES
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
