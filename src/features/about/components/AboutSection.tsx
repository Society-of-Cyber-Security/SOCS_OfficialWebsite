"use client";

import { useEffect, useRef } from "react";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { fadeUpOnScroll } from "@/shared/lib/animations";
import { Activity } from "lucide-react";
import { HackerMask3D } from "@/features/visualizations/components/HackerMask3D";

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      fadeUpOnScroll(sectionRef.current);
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-20 border-t border-primary/5 opacity-0">
      <SectionHeader title="Mission Statement" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 items-center">
          
          {/* Left: Original Mission Card */}
          <div className="dashboard-card rounded-sm p-8 border-l-2 border-l-primary relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Activity className="w-32 h-32 text-primary" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 text-[10px] text-primary/60 tracking-[0.4em] font-bold uppercase mb-4">
                <span className="w-2 h-2 bg-primary animate-pulse" />
                <span>Operational_Directive</span>
              </div>
              
              <div className="space-y-6">
                <p className="text-gray-300 text-lg leading-relaxed font-jetbrains">
                  The Society of Cyber Security (SOCS) is an interdisciplinary organization dedicated to the exploration, research, and dissemination of computer security knowledge.
                </p>
                <p className="text-gray-400 text-base leading-relaxed">
                  We bridge the gap between theoretical academia and practical hacking. By fostering a collaborative ecosystem, we empower the next generation of researchers to secure the digital frontier through deep exploitation analysis.
                </p>
              </div>
              
              <div className="pt-6 flex flex-wrap gap-4">
                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-sm text-[10px] text-primary font-bold tracking-widest uppercase">
                  Ethical_First
                </div>
                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-sm text-[10px] text-primary font-bold tracking-widest uppercase">
                  Research_Led
                </div>
              </div>

              {/* Original Executive Quote inside card bottom */}
              <div className="pt-8 border-t border-white/5">
                <div className="text-[10px] text-gray-500 tracking-widest mb-2 uppercase">Executive_Quote</div>
                <p className="text-lg font-grotesk text-white leading-tight italic grayscale group-hover:grayscale-0 transition-all duration-500">
                  "We build it up, tear it down, and figure out how it ticks."
                </p>
              </div>
            </div>
          </div>

          {/* Right: Solo 3D Mask */}
          <div className="h-[400px] lg:h-[500px] relative flex items-center justify-center">
             <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-20" />
             <div className="w-full h-full relative z-10 scale-110 lg:scale-125">
               <HackerMask3D />
             </div>
             {/* Glow Effect */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[80px] pointer-events-none" />
             

          </div>

        </div>
      </div>
    </section>
  );
}
