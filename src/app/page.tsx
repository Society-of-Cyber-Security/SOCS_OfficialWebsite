"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { HeroSection } from "@/features/hero/components/HeroSection";
import { IdentitySection } from "@/features/about/components/IdentitySection";
import { WhatWeDoSection } from "@/features/home/components/WhatWeDoSection";
import { GallerySection } from "@/features/home/components/GallerySection";
import { StatsSection } from "@/features/stats/components/StatsSection";
import { FeaturedProjects } from "@/features/projects/components/FeaturedProjects";
import { EventsPreview } from "@/features/events/components/EventsPreview";
import { HomeTeamPreview } from "@/features/team/components/HomeTeamPreview";
import { Marquee } from "@/shared/components/ui/Marquee";
import { useAuth } from "@/core/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <PageWrapper className="pt-0">
      <HeroSection />
      
      <div className="w-full flex flex-col">
        <IdentitySection />
        <WhatWeDoSection />
        <GallerySection />
        <StatsSection />
        <FeaturedProjects />
        <EventsPreview />
        <HomeTeamPreview />

        {/* Editorial Join CTA Block */}
        {!isAuthenticated && (
          <section className="w-full bg-[#E5E7EB] py-32 md:py-48 relative overflow-hidden flex flex-col items-center justify-center text-center px-6">
            <div className="relative z-10 flex flex-col items-center max-w-4xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-8 border border-[var(--color-cyber-muted)] px-4 py-1.5 rounded-sm">
                Membership Application
              </span>
              <h2 className="font-heading font-black text-[clamp(5rem,11vw,9rem)] text-[var(--color-cyber-black)] uppercase tracking-tighter leading-[0.9] mb-12">
                Join the <br />
                <span className="text-[var(--color-cyber-neon)]">Network</span>
              </h2>
              <p className="font-body text-lg md:text-xl text-[var(--color-cyber-muted)] max-w-2xl mb-16 leading-relaxed">
                Gain access to advanced exploitation labs, exclusive CTF training, and elite research groups. We are currently accepting applications for the 2026 cohort.
              </p>
              
              <Link 
                href="/join"
                className="bg-[var(--color-cyber-neon)] text-white hover:bg-[var(--color-cyber-black)] hover:text-[var(--color-cyber-white)] font-heading font-bold text-lg md:text-xl px-12 py-5 tracking-wide transition-colors flex items-center gap-4 group rounded-sm"
              >
                <span>Submit Application</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            
            {/* Background Marquee */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none opacity-5 rotate-3 scale-110">
              <Marquee className="[--gap:3rem]" repeat={10}>
                <span className="font-heading font-black text-[15rem] text-[var(--color-cyber-black)] tracking-tighterer">RECRUITING</span>
              </Marquee>
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
