"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { events } from "@/core/config/events";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { ArrowLeft, Shield, Terminal, Calendar, MapPin, Clock, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [registered, setRegistered] = useState(false);
  const slug = params?.slug as string;
  const event = events.find((e) => e.slug === slug);

  if (!event) {
    return (
      <PageWrapper>
        <div className="pt-32 text-center bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-12 max-w-lg mx-auto relative overflow-hidden rounded-sm">
          <h1 className="text-4xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-4 relative z-10">404: EVENT NOT FOUND</h1>
          <p className="text-[var(--color-cyber-light)] mb-8 font-body text-sm relative z-10">The requested event could not be located.</p>
          <Link href="/events" className="btn-primary px-8 py-4 text-xs uppercase tracking-widest relative z-10 inline-block rounded-sm">
            Return to Calendar
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const isUpcoming = event.status === "upcoming";

  return (
    <PageWrapper className="pt-24 pb-32">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-3 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors text-[10px] font-mono tracking-widest uppercase mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Calendar</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="space-y-8">
            <div className="stealth-card p-8 md:p-12 space-y-12">
              <div className="relative z-10">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className={`px-3 py-1 text-[9px] font-bold font-mono tracking-widest uppercase border flex items-center gap-2 rounded-sm ${
                    isUpcoming 
                      ? 'border-[var(--color-cyber-neon)] text-[var(--color-cyber-neon)] bg-[var(--color-cyber-neon)]/5' 
                      : 'border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] bg-[var(--color-cyber-dark)]'
                  }`}>
                    {isUpcoming && <span className="w-1.5 h-1.5 bg-[var(--color-cyber-neon)] rounded-full animate-pulse" />}
                    {isUpcoming ? 'Scheduled Event' : 'Archived Event'}
                  </span>
                  <span className="px-3 py-1 text-[9px] font-bold font-mono tracking-widest uppercase border border-[var(--color-cyber-white)]/30 text-[var(--color-cyber-white)] bg-[var(--color-cyber-white)]/5 rounded-sm">
                    {event.type}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter leading-[1] mb-6">
                  {event.title}
                </h1>

                <p className="text-[var(--color-cyber-light)] font-body text-base leading-relaxed border-l-2 border-[var(--color-cyber-gray)] pl-4 py-1 max-w-3xl">
                  {event.description}
                </p>
              </div>

              {/* Briefing Overview */}
              <div className="bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-8 relative z-10 rounded-sm">
                <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                  <Shield className="w-4 h-4 text-[var(--color-cyber-neon)]" />
                  Briefing Overview
                </h3>
                <p className="text-[var(--color-cyber-light)] font-body text-sm leading-relaxed mb-8">
                  This execution will cover advanced methodologies in security research and cyber defense. Participants are expected to have a stable local node setup and necessary toolkits synchronized.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] rounded-sm">
                    <span className="text-[9px] text-[var(--color-cyber-muted)] font-mono uppercase tracking-widest block mb-2">Pre-requisites</span>
                    <p className="text-xs text-[var(--color-cyber-white)] font-mono">CLI Knowledge // Burp Suite v2.0+</p>
                  </div>
                  <div className="p-4 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] rounded-sm">
                    <span className="text-[9px] text-[var(--color-cyber-muted)] font-mono uppercase tracking-widest block mb-2">Objective</span>
                    <p className="text-xs text-[var(--color-cyber-white)] font-mono">Exploit Development // Research</p>
                  </div>
                </div>
              </div>

              {/* Protocol Timeline */}
              <section className="space-y-6 relative z-10">
                <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-[var(--color-cyber-neon)]" />
                  Protocol Timeline
                </h3>
                <div className="space-y-3">
                  {[
                    { time: "09:00", event: "Node Initialization & Onboarding" },
                    { time: "10:30", event: "Phase 1: Reconnaissance & Mapping" },
                    { time: "13:00", event: "Core Breakout & Logic Analysis" },
                    { time: "15:30", event: "Final Breach & Data Recovery" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-center p-4 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm">
                      <span className="text-[var(--color-cyber-white)] font-bold font-mono text-xs border border-[var(--color-cyber-white)]/20 bg-[var(--color-cyber-white)]/5 px-2 py-1 rounded-sm">{item.time}</span>
                      <span className="text-[var(--color-cyber-light)] font-body text-sm">{item.event}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="stealth-card p-8 space-y-8">
              <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] border-b border-[var(--color-cyber-gray)] pb-4 relative z-10">
                Execution Metadata
              </h3>
              
              <div className="space-y-6 text-[10px] font-mono relative z-10">
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-[var(--color-cyber-neon)]" />
                  <div>
                    <span className="text-[var(--color-cyber-muted)] block tracking-widest mb-1">DATE</span>
                    <span className="text-[var(--color-cyber-white)] font-bold">{new Date(event.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <MapPin className="w-5 h-5 text-[var(--color-cyber-white)]" />
                  <div>
                    <span className="text-[var(--color-cyber-muted)] block tracking-widest mb-1">COORDINATES</span>
                    <span className="text-[var(--color-cyber-white)] font-bold">{event.location || "VIRTUAL NODE"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-[var(--color-cyber-muted)]" />
                  <div>
                    <span className="text-[var(--color-cyber-muted)] block tracking-widest mb-1">DURATION</span>
                    <span className="text-[var(--color-cyber-white)] font-bold">~ 06:00 HOURS</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8">
                {isUpcoming ? (
                  registered ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-[10px] font-mono tracking-widest text-center flex items-center justify-center gap-3 rounded-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      REGISTERED FOR EVENT
                    </div>
                  ) : (
                    <button 
                      onClick={() => setRegistered(true)}
                      className="btn-primary w-full py-4 text-[10px] uppercase tracking-widest cursor-pointer rounded-sm"
                    >
                      REGISTER FOR OPERATION
                    </button>
                  )
                ) : (
                  <button 
                    disabled
                    className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] font-mono py-4 text-[10px] tracking-widest uppercase cursor-not-allowed rounded-sm"
                  >
                    PROTOCOL ARCHIVED
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-6 text-center rounded-sm">
              <Zap className="w-6 h-6 text-[var(--color-cyber-neon)] mx-auto mb-3" />
              <p className="text-[10px] text-[var(--color-cyber-light)] font-mono leading-relaxed uppercase tracking-widest">
                All society events are structured for practical hands-on research and skill progression.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
