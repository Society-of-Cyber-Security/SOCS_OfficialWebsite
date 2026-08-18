import React from "react";
import Link from "next/link";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/shared/components/ui/Icons";
import { MessageSquare } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)] relative z-10 w-full overflow-hidden text-[var(--color-cyber-light)]">

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Brand & Socials */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="inline-flex flex-col group w-fit">
              <span className="font-heading font-black text-3xl text-[var(--color-cyber-white)] tracking-tighterer leading-none group-hover:text-[var(--color-cyber-neon)] transition-colors">
                SOCS
              </span>
              <span className="text-[9px] text-[var(--color-cyber-muted)] font-mono font-medium tracking-[0.15em] uppercase mt-1.5">
                Society of Cyber Security
              </span>
            </Link>

            <div className="flex items-center space-x-5 pt-2">
              <a href="https://github.com/Society-of-Cyber-Security" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="GitHub">
                <GithubIcon className="w-4 h-4" />
              </a>
              <a href="https://discord.gg/2DbssC8t" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="Discord">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/socs_ru/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/company/society-of-cyber-security/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="LinkedIn">
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Compact Navigation */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-cyber-muted)]">
            <Link href="/team" className="hover:text-[var(--color-cyber-white)] transition-colors">Team</Link>
            <Link href="/projects" className="hover:text-[var(--color-cyber-white)] transition-colors">Initiatives</Link>
            <Link href="/events" className="hover:text-[var(--color-cyber-white)] transition-colors">Events</Link>
            <Link href="/gallery" className="hover:text-[var(--color-cyber-white)] transition-colors">Gallery</Link>
            <Link href="/resources" className="hover:text-[var(--color-cyber-white)] transition-colors">Resources</Link>
            <Link href="/contact" className="hover:text-[var(--color-cyber-white)] transition-colors">Contact</Link>
          </div>
          
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-[var(--color-cyber-gray)] flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">
          <p>© {currentYear} SOCS. ALL RIGHTS RESERVED.</p>
          <p>BUILT ON RESEARCH AND INNOVATION.</p>
        </div>
      </div>
    </footer>
  );
}
