import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

export const registerGSAP = () => {
  if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
  }
};

export const fadeUpOnScroll = (selector: string | Element | NodeListOf<Element>) => {
  return gsap.fromTo(
    selector,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: selector as any,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  );
};

export const brawlPopIn = (element: string | Element, delay = 0) => {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.8, y: 20 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.7,
      delay,
      ease: "back.out(2)",
    }
  );
};

export const staggerCardsOnScroll = (containerSelector: string | Element) => {
  const elements = typeof containerSelector === "string" 
    ? `${containerSelector} > *` 
    : (containerSelector as Element).children;

  return gsap.fromTo(
    elements,
    { opacity: 0, y: 30, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      stagger: 0.1,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: containerSelector as any,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  );
};

export const floatingElement = (element: Element | string, distance = 8, duration = 3) => {
  return gsap.to(element, {
    y: `-=${distance}`,
    rotation: "+=2",
    duration,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
};

export const typewriterEffect = (element: Element, text: string, speed = 0.04) => {
  element.textContent = "";
  return gsap.to(element, {
    text: text,
    duration: text.length * speed,
    ease: "none",
  });
};

export const glitchReveal = (element: Element | string) => {
  const tl = gsap.timeline();
  tl.fromTo(element, 
    { opacity: 0, scale: 0.96 }, 
    { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
  );
  return tl;
};

export const animateCounter = (element: Element, target: number, duration = 1.8) => {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: target,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      element.innerHTML = Math.round(obj.val).toString();
    },
    scrollTrigger: {
      trigger: element,
      start: "top 90%",
      once: true,
    },
  });
};
