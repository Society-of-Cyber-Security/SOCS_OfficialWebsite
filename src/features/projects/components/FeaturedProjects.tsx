"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function FeaturedProjects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { fetchApi } = await import('@/shared/lib/api');
        const res = await fetchApi('/projects');
        if (res && res.success && res.data) {
          // Feature first 3 projects
          setFeatured(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch featured projects", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (isLoading || featured.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".project-card-anim",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [isLoading, featured.length]);

  return (
    <section className="py-12 md:py-24 lg:py-36 w-full bg-[var(--color-cyber-black)] border-t border-[var(--color-cyber-gray)]" ref={containerRef}>
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="flex flex-col space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)]">
              04 — Research & Development
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[var(--color-cyber-white)] tracking-tighter">
              Featured Initiatives
            </h2>
          </div>
          <Link 
            href="/projects" 
            className="group flex items-center gap-3 font-mono text-sm text-[var(--color-cyber-light)] hover:text-[var(--color-cyber-white)] transition-colors"
          >
            <span className="uppercase tracking-widest border-b border-transparent group-hover:border-[var(--color-cyber-white)] transition-all">View All Projects</span>
            <div className="w-8 h-8 rounded-full border border-[var(--color-cyber-gray)] flex items-center justify-center group-hover:bg-[var(--color-cyber-white)] group-hover:text-[var(--color-cyber-black)] transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 lg:gap-12">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-[var(--color-cyber-muted)]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-mono text-xs uppercase tracking-widest">Accessing Database...</span>
              </div>
            </div>
          ) : featured.length === 0 ? (
            <div className="col-span-full flex items-center justify-center bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)]">
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-cyber-muted)]">No projects found in database.</span>
            </div>
          ) : (
            featured.map((project, i) => (
              <Link 
                href={`/projects/${project._id || project.slug}`} 
                key={project._id || project.slug || i}
                className={`project-card-anim group stealth-card block min-w-0 overflow-hidden ${
                  i === 0 ? "lg:col-span-8 lg:aspect-auto" : "lg:col-span-4 lg:aspect-auto"
                } p-5 md:p-8 lg:p-12 flex flex-col justify-start md:justify-between`}
              >
                <div className="flex flex-wrap gap-1.5 mb-4 md:mb-8">
                  {project.tags && project.tags.slice(0, 2).map((t: string, idx: number) => (
                    <span key={idx} className="font-mono text-[9px] md:text-[10px] uppercase text-[var(--color-cyber-muted)] bg-[var(--color-cyber-dark)] px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm border border-[var(--color-cyber-gray)]">
                      {t}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-col gap-2 md:gap-4 min-w-0">
                  <h3 className="font-heading font-black text-lg md:text-3xl lg:text-4xl text-[var(--color-cyber-white)] tracking-tighter group-hover:text-[var(--color-cyber-neon)] transition-colors line-clamp-2 md:line-clamp-none break-words">
                    {project.title}
                  </h3>
                  <p className="hidden md:block font-body text-[var(--color-cyber-light)] line-clamp-2 md:line-clamp-3 break-words text-sm md:text-base">
                    {project.description}
                  </p>
                  <div className="mt-2 md:mt-4 flex items-center gap-2 text-xs md:text-sm font-heading font-bold text-[var(--color-cyber-white)] group-hover:text-[var(--color-cyber-neon)] transition-colors">
                    Read Docs <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
