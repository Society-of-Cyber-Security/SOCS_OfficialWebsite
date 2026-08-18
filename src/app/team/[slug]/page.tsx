"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { teamMembers } from "@/core/config/team";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { GithubIcon, LinkedinIcon } from "@/shared/components/ui/Icons";
import { ArrowLeft, Terminal, User, Mail, Activity, Star, Sparkles } from "lucide-react";
import Link from "next/link";

const CLEARANCE_MAP = {
  core: { label: "Core Admin", badgeColor: "border-[var(--color-cyber-white)] text-[var(--color-cyber-white)] bg-[var(--color-cyber-white)]/5", starCount: 3 },
  lead: { label: "Lead Operator", badgeColor: "border-[var(--color-cyber-neon)] text-[var(--color-cyber-neon)] bg-[var(--color-cyber-neon)]/5", starCount: 2 },
  member: { label: "Member", badgeColor: "border-[var(--color-cyber-gray)] text-[var(--color-cyber-light)] bg-[var(--color-cyber-dark)]", starCount: 1 },
} as const;

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const member = teamMembers.find((m) => m.slug === slug);

  if (!member) {
    return (
      <PageWrapper>
        <div className="pt-32 text-center bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-12 max-w-lg mx-auto relative overflow-hidden rounded-sm">
          <h1 className="text-4xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-4 relative z-10">404: OPERATOR NOT FOUND</h1>
          <p className="text-[var(--color-cyber-light)] mb-8 font-body text-sm relative z-10">The requested operator profile could not be located.</p>
          <Link href="/team" className="btn-primary px-8 py-4 text-xs uppercase tracking-widest relative z-10 inline-block rounded-sm">
            Return to Directory
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const clearance = CLEARANCE_MAP[member.tier] || CLEARANCE_MAP.member;

  return (
    <PageWrapper className="pt-24 pb-32">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-3 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors text-[10px] font-mono tracking-widest uppercase mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Directory</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 lg:gap-12">
          {/* Profile Sidebar Card */}
          <div className="space-y-6">
            <div className="stealth-card p-8 flex flex-col items-center text-center">
              <div className="w-48 h-48 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] flex items-center justify-center overflow-hidden mb-8 relative z-10 grayscale hover:grayscale-0 transition-all duration-500 rounded-sm">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-[var(--color-cyber-muted)]" />
                )}
              </div>
              
              <span className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border mb-6 relative z-10 rounded-sm ${clearance.badgeColor}`}>
                {clearance.label}
              </span>

              <div className="flex items-center gap-1 mb-8 relative z-10">
                {Array.from({ length: clearance.starCount }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-[var(--color-cyber-neon)] fill-[var(--color-cyber-neon)]" />
                ))}
              </div>

              {/* Social links */}
              <div className="flex justify-center gap-6 pt-6 border-t border-[var(--color-cyber-gray)] w-full relative z-10">
                <a href={member.github || "#"} className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="GitHub">
                  <GithubIcon className="w-5 h-5" />
                </a>
                <a href={member.linkedin || "#"} className="text-[var(--color-cyber-muted)] hover:text-[#0077b5] transition-colors" aria-label="LinkedIn">
                  <LinkedinIcon className="w-5 h-5" />
                </a>
                <a href="#" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="Email">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-6 space-y-4 text-[10px] font-mono text-[var(--color-cyber-muted)] tracking-wider rounded-sm">
              <div className="flex items-center justify-between">
                <span>STATUS</span>
                <span className="flex items-center gap-2 text-[var(--color-cyber-neon)] font-bold">
                  <span className="w-1.5 h-1.5 bg-[var(--color-cyber-neon)] rounded-full animate-pulse" />
                  ACTIVE_NODE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>SECURITY_LEVEL</span>
                <span className="text-[var(--color-cyber-white)] font-bold">TIER_{member.tier.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Member Details */}
          <div className="space-y-8">
            <div className="stealth-card p-8 md:p-12 space-y-12">
              <div className="relative z-10">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter leading-[0.9] mb-4">
                  {member.name}
                </h1>
                <p className="text-[var(--color-cyber-muted)] font-mono text-sm font-bold uppercase tracking-[0.2em]">
                  {member.role}
                </p>
              </div>

              {/* Operator Profile */}
              <section className="space-y-4 relative z-10">
                <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-[var(--color-cyber-muted)]" />
                  Operator Profile
                </h3>
                <p className="text-[var(--color-cyber-light)] font-body text-sm leading-relaxed max-w-2xl border-l-2 border-[var(--color-cyber-gray)] pl-4 py-1">
                  A high-level technical operator specializing in secure systems and offensive security methodologies.
                  Responsible for coordinating core society protocols and maintaining internal node integrity.
                </p>
              </section>

              {/* Skills */}
              <section className="space-y-4 relative z-10">
                <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[var(--color-cyber-muted)]" />
                  Skill Modules
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] text-[var(--color-cyber-white)] text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Contribution Log */}
              <section className="space-y-6 relative z-10">
                <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                  <Activity className="w-4 h-4 text-[var(--color-cyber-muted)]" />
                  Contribution Log
                </h3>
                <div className="space-y-3">
                  {[
                    "Initialized SOCS framework modules",
                    "Lead researcher on vulnerability analysis and defense modeling",
                    "Winner of HackTheValley 2025 - Security Track",
                    "Continuous monitoring of society threat landscape"
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] font-body text-sm text-[var(--color-cyber-light)] items-start rounded-sm">
                      <span className="text-[var(--color-cyber-white)] font-mono font-bold shrink-0">[{i+1}]</span>
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
