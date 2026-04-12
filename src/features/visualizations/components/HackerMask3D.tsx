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

      // Sample size
      const S = 150;
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
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          
          // Sample black/dark pixels
          if (r < 180) {
            // Normalize coordinates
            const posX = (x - S / 2) * 0.7;
            const posY = (S / 2 - y) * 0.9;
            
            // Add depth to create a mask-like curve
            // Center is closer (z > 0), edges are further back (z < 0)
            const dx = (x - S/2) / (S/2);
            const dy = (y - S/2) / (S/2);
            const distFromCenter = Math.sqrt(dx*dx + dy*dy);
            
            // Front-back face curvature (the general shell)
            let z = Math.cos(distFromCenter * Math.PI * 0.5) * 40;
            
            // ─── 1. SMOOTH EYE INDENTS (Elliptical) ───
            const eyeX = Math.abs(posX) - 15;
            const eyeY = posY - 25;
            const eyeDist = Math.sqrt((eyeX / 10)**2 + (eyeY / 8)**2);
            if (eyeDist < 1) {
               // Smoothly dip in using a cosine curve
               const eyeDip = (Math.cos(eyeDist * Math.PI) + 1) * 0.5;
               z -= eyeDip * 10;
            }

            // ─── 2. SMOOTH WIDE SMILE (Parabolic) ───
            // Smile is roughly at posY = -25, wide from posX -35 to 35
            const smileXFactor = Math.max(0, 1 - (Math.abs(posX) / 38));
            const smileYFactor = Math.max(0, 1 - (Math.abs(posY + 25) / 15));
            if (smileXFactor > 0 && smileYFactor > 0) {
               // Combine into a smooth protrusion
               const smileGlow = Math.pow(smileXFactor * smileYFactor, 1.5);
               z += smileGlow * 14;
            }

            // ─── 3. MUSTACHE / CHEEK VOLUME (Soft bulge) ───
            const cheekX = Math.abs(posX) - 20;
            const cheekY = posY + 5;
            const cheekDist = Math.sqrt((cheekX / 15)**2 + (cheekY / 12)**2);
            if (cheekDist < 1) {
               const cheekBulge = (Math.cos(cheekDist * Math.PI) + 1) * 0.5;
               z += cheekBulge * 5;
            }

            positions.push(posX, posY, z);
            colors.push(colorPrimary.r, colorPrimary.g, colorPrimary.b);
            
            // Add a second layer for thickness
            positions.push(posX, posY, z - 2);
            colors.push(colorPrimary.r * 0.4, colorPrimary.g * 0.4, colorPrimary.b * 0.4);
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
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      
      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      maskRoot.add(points);

      // --- Animation Loop ---
      const render = () => {
        frameId = requestAnimationFrame(render);
        // Full Continuous Rotation like the Globe (Synced speed)
        maskRoot.rotation.y += 0.0015; 
        maskRoot.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
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
