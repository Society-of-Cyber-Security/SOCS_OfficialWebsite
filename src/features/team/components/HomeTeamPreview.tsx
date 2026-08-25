"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchApi } from "@/shared/lib/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HomeTeamPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [previewMembers, setPreviewMembers] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetchApi('/team');
        if (res && res.success) {
          // Take top 4 members (likely core members since the API sorts by tier)
          setPreviewMembers(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load team preview", err);
      }
    };
    fetchTeam();
  }, []);

  useEffect(() => {
    if (previewMembers.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".team-member-reveal",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [previewMembers]);

  return (
    <section ref={sectionRef} className="py-24 md:py-36 w-full bg-[var(--color-cyber-black)] border-t border-[var(--color-cyber-gray)]">
      
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="flex flex-col space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)]">
              06 — Leadership & Core
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[var(--color-cyber-white)] tracking-tighter">
              Community Roster
            </h2>
          </div>
          <Link 
            href="/team" 
            className="group flex items-center gap-3 font-mono text-sm text-[var(--color-cyber-light)] hover:text-[var(--color-cyber-white)] transition-colors pb-2"
          >
            <span className="uppercase tracking-widest border-b border-transparent group-hover:border-[var(--color-cyber-white)] transition-all">View All Members</span>
            <div className="w-8 h-8 rounded-full border border-[var(--color-cyber-gray)] flex items-center justify-center group-hover:bg-[var(--color-cyber-white)] group-hover:text-[var(--color-cyber-black)] transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {previewMembers.map((member) => (
            <Link 
              key={member._id} 
              href={`/team/${member.slug}`}
              className="team-member-reveal group flex flex-col opacity-0"
            >
              <div className="aspect-[3/4] w-full mb-6 overflow-hidden bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] relative">
                {/* Image placeholder / actual image */}
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-[var(--color-cyber-muted)] opacity-50">
                    NO_IMAGE
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-cyber-white)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="flex flex-col border-l-2 border-[var(--color-cyber-white)] pl-4">
                <h3 className="font-heading font-bold text-2xl text-[var(--color-cyber-white)] tracking-tighter">
                  {member.name}
                </h3>
                <p className="font-mono text-[11px] text-[var(--color-cyber-light)] uppercase tracking-widest mt-1">
                  {member.role}
                </p>
              </div>
            </Link>
          ))}
        </div>
        
        {previewMembers.length === 0 && (
          <div className="w-full py-12 text-center text-sm font-mono text-[var(--color-cyber-muted)] border border-[var(--color-cyber-gray)] border-dashed">
            NO PUBLIC MEMBERS REGISTERED
          </div>
        )}
      </div>

    </section>
  );
}
