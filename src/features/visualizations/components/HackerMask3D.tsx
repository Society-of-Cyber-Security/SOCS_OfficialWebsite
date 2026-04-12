"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * 3D Hacker Mask Visualization
 * Samples a Guy Fawkes mask silhouette and renders it as a 3D point cloud
 * similar to the Globe3D.
 */
export function HackerMask3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || 300;
    let height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 150;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const maskRoot = new THREE.Group();
    scene.add(maskRoot);

    const colorPrimary = new THREE.Color(0xc8ff00); // Neon Green

    // --- 1. Load Mask Silhouette for Sampling ---
    const maskImage = new Image();
    maskImage.crossOrigin = "Anonymous";
    maskImage.src = "/assets/mask.png";

    let frameId: number;

    maskImage.onload = () => {
      if (!containerRef.current) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Sample size - High density
      const S = 180; 
      canvas.width = S;
      canvas.height = S;
      ctx.drawImage(maskImage, 0, 0, S, S);
      const imageData = ctx.getImageData(0, 0, S, S);

      const positions: number[] = [];
      const colors: number[] = [];

      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const index = (y * S + x) * 4;
          const r = imageData.data[index];
          
          // Face Oval Mask: Only sample within the face bounds
          const dx = (x - S / 2) / (S / 2);
          const dy = (y - S / 2) / (S / 2);
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < 0.9) {
            const posX = (x - S / 2) * 0.5;
            const posY = (S / 2 - y) * 0.65;
            
            // --- 1. Face Curvature ---
            let z = Math.cos(dist * Math.PI * 0.5) * 40;

            // --- 2. MANUALLY SCULPT THE NOSE (Softened) ---
            const nX = posX;
            const nY = posY - 4;
            const nDX = Math.abs(nX) / 10; // Wider
            const nDY = Math.abs(nY) / 20;
            if (nDX < 1 && nDY < 1) {
               z += Math.exp(-(nDX * nDX * 3)) * (1 - nDY) * 11;
            }

            // Anonymous Features Check
            const isMaskFeature = r < 160;

            if (isMaskFeature) {
               positions.push(posX, posY, z);
               colors.push(colorPrimary.r, colorPrimary.g, colorPrimary.b);
            }
          }
        }
      }

      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const pointsMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      
      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      maskRoot.add(points);

      // --- Animation Loop ---
      const render = () => {
        frameId = requestAnimationFrame(render);
        maskRoot.rotation.y = -0.2; // Facing left
        maskRoot.rotation.x = 0.1;
        renderer.render(scene, camera);
      };
      render();

      // Entrance animation
      gsap.from(maskRoot.scale, {
        x: 0, y: 0, z: 0,
        duration: 1.5,
        ease: "power4.out"
      });
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center pointer-events-none overflow-hidden" />
  );
}
