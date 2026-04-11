"use client";

import { useEffect } from "react";
import gsap from "gsap";

export function useDashboardAnimation(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();
    
    tl.fromTo(".dashboard-frame", 
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" }
    );

    tl.fromTo(".hero-text-animate",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
      "-=0.6"
    );

    tl.fromTo(".metric-card",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" },
      "-=0.4"
    );

    return () => { tl.kill(); };
  }, [containerRef]);
}
