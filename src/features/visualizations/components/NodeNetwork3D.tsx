"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export function NodeNetwork3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 150;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // NETWORK PARAMETERS
    const particleCount = 120;
    const maxDistance = 35;
    
    // POSITIONS & VELOCITIES
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    
    const range = 100;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * range * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * range * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * range * 2;
      
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ));
    }

    // NODES
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Use tech blue for nodes
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x4285F4, // Google Blue
      size: 2.5,
      transparent: true,
      opacity: 0.9,
    });
    
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // EDGES
    const linesGeometry = new THREE.BufferGeometry();
    const positionsArray = new Float32Array(particleCount * particleCount * 3);
    const colorsArray = new Float32Array(particleCount * particleCount * 3);
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
    linesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    
    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
    });
    
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    // ANIMATION
    let frameId: number;
    
    // Tech colors for edges
    const colorBase = new THREE.Color(0x34A853); // Google Green
    const colorActive = new THREE.Color(0xFBBC05); // Google Yellow
    
    const render = () => {
      frameId = requestAnimationFrame(render);
      
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      
      // Update node positions
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;
        
        // Bounce off bounds
        if (Math.abs(positions[i * 3]) > range) velocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > range) velocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > range) velocities[i].z *= -1;
      }
      
      particleSystem.geometry.attributes.position.needsUpdate = true;
      
      // Update edges
      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;
      
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          if (dist < maxDistance) {
            // Calculate opacity based on distance
            const alpha = 1.0 - dist / maxDistance;
            
            // Mix color: closer = more amber, further = charcoal
            const mixedColor = colorBase.clone().lerp(colorActive, alpha);
            
            positionsArray[vertexpos++] = positions[i * 3];
            positionsArray[vertexpos++] = positions[i * 3 + 1];
            positionsArray[vertexpos++] = positions[i * 3 + 2];
            
            positionsArray[vertexpos++] = positions[j * 3];
            positionsArray[vertexpos++] = positions[j * 3 + 1];
            positionsArray[vertexpos++] = positions[j * 3 + 2];
            
            colorsArray[colorpos++] = mixedColor.r;
            colorsArray[colorpos++] = mixedColor.g;
            colorsArray[colorpos++] = mixedColor.b;
            
            colorsArray[colorpos++] = mixedColor.r;
            colorsArray[colorpos++] = mixedColor.g;
            colorsArray[colorpos++] = mixedColor.b;
            
            numConnected++;
          }
        }
      }
      
      linesMesh.geometry.setDrawRange(0, numConnected * 2);
      linesMesh.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.attributes.color.needsUpdate = true;
      
      // Slow rotation of entire system
      particleSystem.rotation.y += 0.001;
      linesMesh.rotation.y += 0.001;
      particleSystem.rotation.x += 0.0005;
      linesMesh.rotation.x += 0.0005;
      
      renderer.render(scene, camera);
    };
    
    render();

    // RESIZE
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
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative pointer-events-none" />
  );
}
