"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [clickActive, setClickActive] = useState(false);

  // Fast moving inner dot
  const cursorX = useSpring(0, { stiffness: 800, damping: 20 });
  const cursorY = useSpring(0, { stiffness: 800, damping: 20 });
  
  // Slower moving outer ring
  const outerX = useSpring(0, { stiffness: 200, damping: 25 });
  const outerY = useSpring(0, { stiffness: 200, damping: 25 });

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    
    if (isTouchDevice) return;

    // Hide default cursor globally
    document.body.style.cursor = "none";

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      outerX.set(e.clientX);
      outerY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        getComputedStyle(target).cursor === "pointer"
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    const handleMouseDown = () => setClickActive(true);
    const handleMouseUp = () => setClickActive(false);

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [cursorX, cursorY, outerX, outerY, isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Inner Dot / Crosshair center */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#4285F4]" />
      </motion.div>

      {/* Outer Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border-2 border-transparent mix-blend-screen"
        style={{
          x: outerX,
          y: outerY,
          translateX: "-50%",
          translateY: "-50%",
          background: "linear-gradient(rgba(8,10,15,0.1), rgba(8,10,15,0.1)) padding-box, linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853) border-box"
        }}
        animate={{
          width: clickActive ? 24 : hovered ? 56 : 36,
          height: clickActive ? 24 : hovered ? 56 : 36,
          rotate: hovered ? 180 : 0,
          opacity: clickActive ? 0.5 : 1
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Crosshair accents when hovered */}
        {hovered && (
          <div className="absolute inset-0 w-full h-full animate-spin-slow">
            <div className="absolute top-[-4px] left-1/2 w-1 h-2 bg-[#4285F4] -translate-x-1/2 rounded-full" />
            <div className="absolute bottom-[-4px] left-1/2 w-1 h-2 bg-[#34A853] -translate-x-1/2 rounded-full" />
            <div className="absolute left-[-4px] top-1/2 h-1 w-2 bg-[#EA4335] -translate-y-1/2 rounded-full" />
            <div className="absolute right-[-4px] top-1/2 h-1 w-2 bg-[#FBBC05] -translate-y-1/2 rounded-full" />
          </div>
        )}
      </motion.div>
    </>
  );
}
