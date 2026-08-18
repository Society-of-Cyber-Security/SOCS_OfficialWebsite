"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

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
    camera.position.z = 250;

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

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Primary Theme Color (Cyan)
    const colorPrimary = new THREE.Color(0x00F0FF);
    // Accent Color (Magenta)
    const colorAccent = new THREE.Color(0xFF003C);

    // 1. Inner Glowing Core
    const innerGeo = new THREE.IcosahedronGeometry(30, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: colorAccent,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 2. Outer Wireframe Shell
    const outerGeo = new THREE.IcosahedronGeometry(45, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: colorPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerMesh);

    // 3. Orbiting Data Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for(let i = 0; i < particleCount * 3; i+=3) {
      // Random position in a spherical shell
      const r = 60 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      posArray[i] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i+2] = r * Math.cos(phi);

      // Mix cyan and magenta
      const mixedColor = Math.random() > 0.8 ? colorAccent : colorPrimary;
      colors[i] = mixedColor.r;
      colors[i+1] = mixedColor.g;
      colors[i+2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleMesh = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particleMesh);

    let frameId: number;
    let time = 0;

    const render = () => {
      frameId = requestAnimationFrame(render);
      time += 0.005;
      
      // Complex rotations for the cyber-core
      innerMesh.rotation.y += 0.02;
      innerMesh.rotation.x += 0.01;
      
      outerMesh.rotation.y -= 0.01;
      outerMesh.rotation.z += 0.005;

      particleMesh.rotation.y = time * 0.5;
      particleMesh.rotation.x = Math.sin(time) * 0.2;

      // Floating effect
      coreGroup.position.y = Math.sin(time * 3) * 10;

      renderer.render(scene, camera);
    };
    render();

    // Entry animation
    gsap.from(coreGroup.scale, {
      x: 0, y: 0, z: 0,
      duration: 2,
      ease: "elastic.out(1, 0.5)"
    });
    
    gsap.from(coreGroup.rotation, {
      y: Math.PI * 2,
      duration: 2,
      ease: "power3.out"
    });

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
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center pointer-events-none" />
  );
}
