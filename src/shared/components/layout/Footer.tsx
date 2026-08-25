import React from "react";
import Link from "next/link";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/shared/components/ui/Icons";
import { MessageSquare } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-cyber-black)] border-t border-[var(--color-cyber-gray)] relative z-10 w-full overflow-hidden text-[var(--color-cyber-light)] flex flex-col pt-16">
      
      <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8 mb-16">
        
        {/* Brand & Socials */}
        <div className="flex flex-col space-y-5">
          <Link href="/" className="inline-flex flex-col group w-fit">
            <span className="font-heading font-black text-2xl text-[var(--color-cyber-white)] tracking-tighterer leading-none group-hover:text-[var(--color-cyber-neon)] transition-colors">
              SOCS
            </span>
            <span className="text-[10px] text-[var(--color-cyber-muted)] font-mono font-medium tracking-[0.1em] uppercase mt-1.5">
              Society of Cyber Security
            </span>
          </Link>

          <div className="flex items-center space-x-5 pt-2">
            <a href="https://github.com/Society-of-Cyber-Security" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="GitHub">
              <GithubIcon className="w-5 h-5" />
            </a>
            <a href="https://discord.gg/2DbssC8t" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="Discord">
              <MessageSquare className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/socs_ru/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="Instagram">
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/company/society-of-cyber-security/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors" aria-label="LinkedIn">
              <LinkedinIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        {/* Compact Navigation */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-widest text-[var(--color-cyber-muted)] md:max-w-md justify-start md:justify-end">
          <Link href="/team" className="hover:text-[var(--color-cyber-white)] transition-colors">Team</Link>
          <Link href="/projects" className="hover:text-[var(--color-cyber-white)] transition-colors">Initiatives</Link>
          <Link href="/events" className="hover:text-[var(--color-cyber-white)] transition-colors">Events</Link>
          <Link href="/gallery" className="hover:text-[var(--color-cyber-white)] transition-colors">Gallery</Link>
          <Link href="/resources" className="hover:text-[var(--color-cyber-white)] transition-colors">Resources</Link>
          <Link href="/contact" className="hover:text-[var(--color-cyber-white)] transition-colors">Contact</Link>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest relative z-20 pb-8">
        <p>© {currentYear} SOCS. ALL RIGHTS RESERVED.</p>
        <p>BUILT ON RESEARCH AND INNOVATION.</p>
      </div>

      {/* Giant SOCS Background Text with Gradient Mask (Absolute positioned to prevent adding height) */}
      <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center items-end select-none pointer-events-none z-0">
        <span 
          className="font-heading font-black text-[22vw] md:text-[23vw] leading-none whitespace-nowrap tracking-tighter text-[var(--color-cyber-white)] opacity-25 origin-bottom transform scale-y-[0.65]"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 85%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 85%)',
          }}
        >
          SOCS
        </span>
      </div>
      
    </footer>
  );
}
