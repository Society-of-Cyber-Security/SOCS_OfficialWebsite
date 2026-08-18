"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { projects } from "@/core/config/projects";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { GithubIcon } from "@/shared/components/ui/Icons";
import { ExternalLink, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <PageWrapper>
        <div className="pt-32 text-center bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-12 max-w-lg mx-auto relative overflow-hidden rounded-sm">
          <h1 className="text-4xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-4 relative z-10">404: PROJECT NOT FOUND</h1>
          <p className="text-[var(--color-cyber-light)] mb-8 font-body text-sm relative z-10">The requested project repository could not be located.</p>
          <Link href="/projects" className="btn-primary px-8 py-4 text-xs uppercase tracking-widest relative z-10 inline-block rounded-sm">
            Return to Database
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-24 pb-32">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-3 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors text-[10px] font-mono tracking-widest uppercase mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Database</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Main content */}
          <div className="space-y-8">
            <div className="stealth-card p-8 md:p-12 space-y-12">
              <div className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] text-[var(--color-cyber-white)] font-bold text-[9px] font-mono uppercase tracking-widest hover:border-[var(--color-cyber-white)] transition-colors cursor-default rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter leading-[1] mb-6">
                  {project.title}
                </h1>

                <p className="text-[var(--color-cyber-light)] font-body text-base leading-relaxed border-l-2 border-[var(--color-cyber-gray)] pl-4 py-1 max-w-3xl">
                  {project.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-8 relative z-10 rounded-sm">
                <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                  <Shield className="w-4 h-4 text-[var(--color-cyber-neon)]" />
                  Technical Specifications
                </h3>
                <p className="text-[var(--color-cyber-light)] font-body text-sm leading-relaxed mb-8">
                  This core module is designed for deep-packet inspection and automated vulnerability research in distributed environments.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] rounded-sm">
                    <span className="text-[9px] text-[var(--color-cyber-muted)] font-mono uppercase tracking-widest block mb-2">Kernel Version</span>
                    <p className="text-xs text-[var(--color-cyber-white)] font-bold font-mono">v1.4.2-stable</p>
                  </div>
                  <div className="p-4 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] rounded-sm">
                    <span className="text-[9px] text-[var(--color-cyber-muted)] font-mono uppercase tracking-widest block mb-2">Compiler Stack</span>
                    <p className="text-xs text-[var(--color-cyber-white)] font-bold font-mono">{project.techStack.join(" / ")}</p>
                  </div>
                </div>
              </div>

              {/* Features Log */}
              <div className="space-y-6 relative z-10">
                <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em]">
                  Features & Capabilities
                </h3>
                <ul className="space-y-3 list-none p-0">
                  {[
                    "Automated reconnaissance and footprint mapping",
                    "Cross-entropy analysis for anomaly detection",
                    "Heuristic-based exploitation attempts with 98% accuracy",
                    "Real-time logging and distributed node synchronization"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 p-4 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] font-body text-sm text-[var(--color-cyber-light)] items-start rounded-sm">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-cyber-neon)] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="stealth-card p-8 space-y-8">
              <h3 className="text-[10px] font-mono text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] border-b border-[var(--color-cyber-gray)] pb-4 relative z-10">
                Access Controls
              </h3>
              
              <div className="space-y-4 relative z-10">
                <a 
                  href={project.githubUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-[var(--color-cyber-dark)] hover:bg-[var(--color-cyber-white)] border border-[var(--color-cyber-gray)] hover:border-[var(--color-cyber-white)] text-[var(--color-cyber-white)] hover:text-[var(--color-cyber-black)] transition-all text-xs font-mono font-bold uppercase tracking-widest rounded-sm"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>Source Repository</span>
                </a>
                
                <button 
                  className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 rounded-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            <div className="bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-6 space-y-4 text-[10px] font-mono text-[var(--color-cyber-muted)] tracking-wider rounded-sm">
              <h3 className="text-[var(--color-cyber-white)] font-bold uppercase tracking-[0.2em] border-b border-[var(--color-cyber-gray)] pb-4 mb-4">
                Deployment Context
              </h3>
              <div className="flex items-center justify-between py-1">
                <span>DEPLOYMENT</span>
                <span className="text-[var(--color-cyber-white)] font-bold">EDGE_DEVOPS_04</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>HARDWARE</span>
                <span className="text-[var(--color-cyber-white)] font-bold">NV_TESLA_A100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
