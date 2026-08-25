import React from "react";
import { TeamMember } from "@/core/config/team";
import { GithubIcon, LinkedinIcon } from "@/shared/components/ui/Icons";
import { Mail } from "lucide-react";
import Link from "next/link";

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <Link href={`/team/${member.slug}`} className="block h-full group">
      <div className="stealth-card p-6 flex flex-col h-full bg-[var(--color-cyber-black)] transition-all duration-300 relative overflow-hidden">
        
        <div className="aspect-square w-full mb-6 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] relative overflow-hidden rounded-sm">
          {member.image ? (
            <img 
              src={member.image} 
              alt={member.name} 
              className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-[var(--color-cyber-muted)] text-xs uppercase tracking-widest">
              No Image
            </div>
          )}
        </div>

        <div className="flex-grow">
          <h3 className="text-xl font-heading font-bold text-cyber-green group-hover:scale-[1.02] origin-left transition-transform mb-1 tracking-tighter">
            {member.name}
          </h3>
          <p className="text-[11px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest mb-4 border-b border-[var(--color-cyber-gray)] pb-4">
            {member.role}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-6">
            {member.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="text-[9px] font-mono uppercase text-[var(--color-cyber-light)] bg-[var(--color-cyber-dark)] px-2 py-0.5 rounded-sm border border-[var(--color-cyber-gray)] tracking-wider">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-auto flex items-center gap-4 pt-4">
          {member.github && (
            <a 
              href={member.github} 
              onClick={(e) => e.stopPropagation()} 
              className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}
          {member.linkedin && (
            <a 
              href={member.linkedin} 
              onClick={(e) => e.stopPropagation()} 
              className="text-[var(--color-cyber-muted)] hover:text-[#0077b5] transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
          )}
          {member.email && (
            <a 
              href={`mailto:${member.email}`} 
              onClick={(e) => e.stopPropagation()} 
              className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
