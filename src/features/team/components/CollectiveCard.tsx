"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { User, Sparkles, Star, Mail } from "lucide-react";
import { TeamMember } from "@/core/config/team";
import { GithubIcon, LinkedinIcon } from "@/shared/components/ui/Icons";

const CLEARANCE_MAP = {
  core: { label: "Core Admin", badgeColor: "border-[var(--color-cyber-white)] text-[var(--color-cyber-white)] bg-[var(--color-cyber-white)]/5", starCount: 3 },
  lead: { label: "Lead Operator", badgeColor: "border-[var(--color-cyber-neon)] text-[var(--color-cyber-neon)] bg-[var(--color-cyber-neon)]/5", starCount: 2 },
  member: { label: "Member", badgeColor: "border-[var(--color-cyber-gray)] text-[var(--color-cyber-light)] bg-[var(--color-cyber-dark)]", starCount: 1 },
} as const;

export function CollectiveCard({
  member,
  delay = 0,
  variant = "directory",
}: {
  member: TeamMember;
  delay?: number;
  variant?: "directory" | "credits";
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.95, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        delay: delay * 0.05,
        ease: "back.out(1.5)",
      }
    );
  }, [delay]);

  const clearance = CLEARANCE_MAP[member.tier] || CLEARANCE_MAP.member;

  return (
    <Link href={`/team/${member.slug}`} className="block h-full group">
      <div
        ref={cardRef}
        className="stealth-card p-6 h-full min-h-[260px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 bg-[var(--color-cyber-black)] hover:bg-[var(--color-cyber-dark)] rounded-sm"
      >
        {/* Top clearance badge and avatar */}
        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between gap-3">
            {/* Avatar Frame */}
            <div className="relative">
              <div className="w-16 h-16 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] flex items-center justify-center overflow-hidden group-hover:border-[var(--color-cyber-white)] transition-colors rounded-sm">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <User className="w-8 h-8 text-[var(--color-cyber-muted)] group-hover:text-[var(--color-cyber-white)] transition-colors" />
                )}
              </div>
            </div>

            {/* Tier & Stars */}
            <div className="flex flex-col items-end">
              <span className={`px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border rounded-sm ${clearance.badgeColor}`}>
                {clearance.label}
              </span>
              <div className="flex items-center gap-0.5 mt-2">
                {Array.from({ length: clearance.starCount }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-[var(--color-cyber-neon)] fill-[var(--color-cyber-neon)]" />
                ))}
              </div>
            </div>
          </div>

          {/* Name & Role */}
          <div className="mb-4">
            <h3 className="text-xl font-heading font-bold text-[var(--color-cyber-white)] tracking-tighter group-hover:text-[var(--color-cyber-neon)] transition-colors line-clamp-1">
              {member.name}
            </h3>
            <p className="text-[10px] font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest mt-1">
              {member.role}
            </p>
          </div>

          {/* Skills (if available) */}
          {member.skills && member.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6 mt-4">
              {member.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="text-[var(--color-cyber-light)] font-mono text-[9px] uppercase border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)] px-2 py-0.5 rounded-sm">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[var(--color-cyber-gray)] flex justify-between items-center text-[10px] font-mono text-[var(--color-cyber-muted)] font-bold relative z-10">
          <span className="group-hover:text-[var(--color-cyber-white)] transition-colors flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-[var(--color-cyber-neon)]" />
            <span className="hidden sm:inline">OPERATOR</span> PROFILE
          </span>
          <div className="flex items-center gap-3">
            {member.github && (
              <a href={member.github} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-cyber-white)] transition-colors" aria-label="GitHub">
                <GithubIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="hover:text-[#0077b5] transition-colors" aria-label="LinkedIn">
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} onClick={(e) => e.stopPropagation()} className="hover:text-[var(--color-cyber-white)] transition-colors" aria-label="Email">
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
            <span className="text-[var(--color-cyber-muted)] group-hover:text-[var(--color-cyber-white)] group-hover:translate-x-1 transition-all ml-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
