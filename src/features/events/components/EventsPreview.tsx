"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function EventsPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayEvents, setDisplayEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { fetchApi } = await import('@/shared/lib/api');
        const res = await fetchApi('/events?upcoming=true');
        if (res && res.success && Array.isArray(res.data)) {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          // Strictly filter only upcoming events (date >= today)
          const upcomingOnly = res.data
            .filter((event: any) => new Date(event.date).getTime() >= startOfToday.getTime())
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 4);

          setDisplayEvents(upcomingOnly);
        } else {
          setDisplayEvents([]);
        }
      } catch (err) {
        console.error("Failed to load upcoming events", err);
        setDisplayEvents([]);
      } finally {
        setIsLoading(false);
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
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-cyber-neon)] animate-pulse" />
              <span>05 — Event Calendar</span>
            </div>
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

            return (
              <Link 
                key={event._id || idx}
                href="/events"
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
                <div className="flex-1 flex flex-col px-6 md:px-0">
                  <div className="flex items-center gap-2 mb-1">
                    {event.type && (
                      <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] text-[var(--color-cyber-neon)] rounded-sm">
                        {event.type}
                      </span>
                    )}
                    {event.location && (
                      <span className="text-[10px] font-mono text-[var(--color-cyber-muted)]">
                        • {event.location}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--color-cyber-light)] group-hover:text-[var(--color-cyber-white)] tracking-tighter transition-colors">
                    {event.title}
                  </h3>
                </div>

                {/* Status indicator */}
                <div className="hidden md:flex items-center gap-2 font-mono text-xs text-[var(--color-cyber-neon)] pr-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyber-neon)] animate-ping" />
                  <span>SCHEDULED</span>
                </div>
              </Link>
            );
          })}
          
          {!isLoading && displayEvents.length === 0 && (
            <div className="py-16 text-center border-b border-[var(--color-cyber-gray)] bg-[var(--color-cyber-dark)]/40 p-8">
              <p className="text-xs font-mono tracking-widest text-[var(--color-cyber-muted)] uppercase mb-3">
                // SYSTEM PROTOCOL STANDBY //
              </p>
              <h4 className="text-lg font-heading font-bold text-[var(--color-cyber-white)] uppercase mb-2">
                No Active Directives Scheduled
              </h4>
              <p className="text-xs font-body text-[var(--color-cyber-light)] max-w-md mx-auto mb-6">
                All previous directives have concluded and are preserved in the archive. Check back soon for upcoming hackathons, CTFs, and workshops.
              </p>
              <Link
                href="/events"
                className="btn-outline px-6 py-2.5 text-xs font-mono uppercase tracking-widest inline-flex items-center gap-2 rounded-sm hover:border-[var(--color-cyber-neon)] hover:text-[var(--color-cyber-neon)]"
              >
                <span>Browse Event Archives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
