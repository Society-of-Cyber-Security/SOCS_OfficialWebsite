"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

const GALLERY_IMAGES = [
  { id: 1, title: "Core Team Briefing", category: "Team", src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "Infrastructure Dock", category: "Infrastructure", src: "https://images.unsplash.com/photo-1558494949-ef0109121c9b?auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "Hackathon Event 2026", category: "Events", src: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80" },
];

export function GallerySection() {
  return (
    <section className="py-24 md:py-36 w-full relative bg-[var(--color-cyber-black)] text-[var(--color-cyber-white)] border-t border-[var(--color-cyber-gray)]">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-4">
              04 — Visual Archive
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-none mb-6">
              Operations <br />
              <span className="text-gradient-red font-display font-bold">Gallery</span>
            </h2>
            <p className="font-body text-base text-[var(--color-cyber-light)] max-w-xl leading-relaxed">
              A visual log of hackathons, club sessions, infrastructure buildouts, and community events.
            </p>
          </div>

          <Link 
            href="/gallery"
            className="btn-outline px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 self-start md:self-end"
          >
            <span>View Full Archive</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {GALLERY_IMAGES.map((img) => (
            <div key={img.id} className="stealth-card group flex flex-col h-full cursor-pointer">
              {/* Image Container */}
              <div className="aspect-video overflow-hidden relative border-b border-[var(--color-cyber-gray)]">
                <img 
                  src={img.src} 
                  alt={img.title}
                  className="w-full h-full object-cover grayscale opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
                />
                <div className="absolute top-4 right-4 bg-[var(--color-cyber-black)]/90 backdrop-blur-md px-3 py-1 border border-[var(--color-cyber-gray)] text-[9px] font-mono tracking-widest text-[var(--color-cyber-white)] uppercase rounded-sm">
                  {img.category}
                </div>
              </div>

              {/* Content info */}
              <div className="p-6 relative z-10 flex-grow flex flex-col justify-between">
                <h3 className="text-xl font-heading font-bold text-[var(--color-cyber-white)] group-hover:text-gradient-blue transition-colors tracking-tighter leading-tight mb-4">
                  {img.title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-[0.2em] mt-auto">
                  <ImageIcon className="w-3.5 h-3.5 text-[var(--color-tech-blue)]" />
                  <span>Verified Capture</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
