"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { fetchApi } from "@/shared/lib/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DisplayImage {
  _id: string | number;
  caption: string;
  url: string;
  category: string;
}

// Mock images removed; strictly using API data.

export function GallerySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [galleryImages, setGalleryImages] = useState<DisplayImage[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const loadImages = async () => {
      try {
        const res = await fetchApi('/gallery?featured=true');
        if (res && res.success && res.data.length > 0) {
          const mapped = res.data.map((img: any) => ({
            _id: img._id,
            caption: img.caption || 'Untitled Capture',
            url: img.url,
            category: 'Featured'
          }));
          setGalleryImages(mapped);
        } else {
          setGalleryImages([]);
        }
      } catch (err) {
        console.error("Failed to load featured gallery", err);
        setGalleryImages([]);
      }
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current || !pinRef.current || !trackRef.current) return;

    const track = trackRef.current;

    const getScrollAmount = () => {
      return track.scrollWidth - window.innerWidth;
    };

    const ctx = gsap.context(() => {
      // Header animations
      gsap.fromTo(
        ".gallery-header-animate",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top 85%",
          },
        }
      );

      // Slide up cards as they enter viewport
      gsap.fromTo(
        ".gallery-card-container",
        { opacity: 0, y: 50, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top 85%",
          }
        }
      );

      // Pin the section and translate the track left
      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isMounted, galleryImages]);

  return (
    <div ref={containerRef} suppressHydrationWarning>
      <div
        ref={pinRef}
        className="relative w-full border-t border-[var(--color-cyber-gray)]"
        style={{ zIndex: 10 }}
      >
        <div className="w-full h-screen overflow-hidden bg-[var(--color-cyber-black)]">
          <div
            ref={trackRef}
            className="flex items-stretch h-full"
            style={{ willChange: "transform" }}
          >
            <div className="shrink-0 w-full h-full flex flex-col justify-center px-6 lg:px-16 relative">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-[var(--color-tech-blue)]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[5%] w-[200px] h-[200px] bg-[var(--color-tech-red)]/5 rounded-full blur-[100px]" />
              </div>

              <div className="relative z-10 max-w-3xl">
                <div className="gallery-header-animate font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-6">
                  02 — Visual Archive
                </div>
                <h2 className="gallery-header-animate font-heading font-black text-5xl sm:text-6xl lg:text-8xl tracking-tighter leading-[0.85] mb-8 text-[var(--color-cyber-white)]">
                  Operations <br />
                  <span className="text-gradient-red font-display font-bold">Gallery</span>
                </h2>
                <p className="gallery-header-animate font-body text-base md:text-lg text-[var(--color-cyber-light)] max-w-xl leading-relaxed mb-10">
                  A visual log of hackathons, club sessions, infrastructure buildouts, and community events.
                </p>

                <Link
                  href="/gallery"
                  className="gallery-header-animate btn-outline px-8 py-4 text-xs uppercase tracking-widest flex items-center w-fit"
                >
                  <span>View Full Archive</span>
                  <ArrowRight className="w-4 h-4 ml-3" />
                </Link>
              </div>

              <div className="gallery-header-animate absolute bottom-12 left-6 lg:left-16 flex items-center gap-3 text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-[0.2em]">
                <div className="w-8 h-[1px] bg-[var(--color-cyber-muted)]" />
                <span>Scroll to explore</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-[bounce_2s_ease-in-out_infinite]">
                  <path d="M3 8L8 13L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Image panels */}
            {galleryImages.map((img, idx) => (
              <div
                key={img._id}
                className="gallery-card-container shrink-0 h-full flex items-center px-2 md:px-3"
                style={{ width: "clamp(280px, 45vw, 700px)" }}
              >
                <div className="gallery-card group relative w-full h-[76vh] max-h-[800px] overflow-hidden rounded-lg border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-dark)] cursor-pointer transition-all duration-500 hover:border-[var(--color-tech-blue)]/40">
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-full object-cover grayscale opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
                    loading="lazy"
                  />

                  {/* Category badge */}
                  <div className="absolute top-5 right-5 bg-[var(--color-cyber-black)]/90 backdrop-blur-md px-3 py-1.5 border border-[var(--color-cyber-gray)] text-[9px] font-mono tracking-widest text-[var(--color-cyber-white)] uppercase rounded-sm">
                    {img.category}
                  </div>

                  {/* Index number */}
                  <div className="absolute top-5 left-5 text-[var(--color-cyber-white)]/10 font-heading font-black text-7xl leading-none pointer-events-none select-none">
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-16 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-sm font-heading font-bold text-[var(--color-cyber-white)] tracking-tight leading-tight uppercase">
                      {img.caption}
                    </h3>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg shadow-[inset_0_0_30px_rgba(66,133,244,0.1)]" />
                </div>
              </div>
            ))}

            {/* End panel */}
            <div className="shrink-0 w-[50vw] min-w-[300px] h-full flex items-center justify-center px-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border border-[var(--color-cyber-gray)] flex items-center justify-center mb-6 group hover:bg-[var(--color-tech-blue)]/10 hover:border-[var(--color-tech-blue)]/40 transition-all cursor-pointer">
                  <ArrowRight className="w-6 h-6 text-[var(--color-cyber-muted)] group-hover:text-[var(--color-tech-blue)] transition-colors" />
                </div>
                <Link
                  href="/gallery"
                  className="font-heading font-bold text-2xl text-[var(--color-cyber-white)] hover:text-[var(--color-tech-blue)] transition-colors tracking-tight"
                >
                  View Full Archive
                </Link>
                <span className="font-mono text-[10px] text-[var(--color-cyber-muted)] uppercase tracking-[0.2em] mt-3">
                  {galleryImages.length} Captures Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

