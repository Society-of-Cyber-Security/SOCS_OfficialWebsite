"use client";

import React, { useEffect, useState } from "react";

export function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    
    if (isTouchDevice) return;

    // Hide default cursor globally
    document.body.style.cursor = "none";

    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
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

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] rounded-full mix-blend-difference"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        width: hovered ? "16px" : "8px",
        height: hovered ? "16px" : "8px",
        backgroundColor: hovered ? "#00FF9D" : "#00B8FF",
        transition: "width 0.15s, height 0.15s, background-color 0.15s, transform 0.15s",
      }}
    />
  );
}
