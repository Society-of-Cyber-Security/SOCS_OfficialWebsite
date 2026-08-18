"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";

export function Globe3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.z = 240;

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

    const globeRoot = new THREE.Group();
    scene.add(globeRoot);

    const GLOBE_RADIUS = width < 768 ? Math.min(50, width / 7) : width < 1280 ? Math.min(45, width / 18) : Math.min(42, width / 28);
    const colorPrimary = new THREE.Color(0x0284c7); // Electric Sky Blue

    const mapImage = new Image();
    mapImage.crossOrigin = "Anonymous";
    mapImage.src = "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg";

    let frameId: number;
    let arcInterval: NodeJS.Timeout;

    mapImage.onload = () => {
      if (!containerRef.current) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1024;
      canvas.height = 512;
      ctx.drawImage(mapImage, 0, 0, 1024, 512);
      const imageData = ctx.getImageData(0, 0, 1024, 512);

      const isLandPixel = (lat: number, lon: number) => {
        const x = Math.floor(((lon + 180) / 360) * 1024);
        const y = Math.floor(((90 - lat) / 180) * 512);
        const index = (y * 1024 + x) * 4;
        return imageData.data[index] < 80; 
      };

      const positions: number[] = [];
      const colors: number[] = [];

      const latStep = 1.0;
      const lonStep = 1.0;

      for (let lat = -90; lat < 90; lat += latStep) {
        for (let lon = -180; lon < 180; lon += lonStep) {
          if (isLandPixel(lat, lon)) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);

            const x = - (GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta));
            const z = (GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta));
            const y = (GLOBE_RADIUS * Math.cos(phi));
            
            positions.push(x, y, z);
            colors.push(colorPrimary.r, colorPrimary.g, colorPrimary.b);
          }
        }
      }

      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const pointsMaterial = new THREE.PointsMaterial({
        size: 1.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
      });
      
      globeRoot.add(new THREE.Points(pointsGeometry, pointsMaterial));

      // Grid Sphere
      const gridGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 24);
      const gridMat = new THREE.MeshBasicMaterial({ 
        color: 0x0284c7, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.08 
      });
      globeRoot.add(new THREE.Mesh(gridGeo, gridMat));

      // Core glow sphere
      const innerGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.96, 32, 32);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.6
      });
      globeRoot.add(new THREE.Mesh(innerGeo, innerMat));

      // Attack Arcs
      const arcGroup = new THREE.Group();
      globeRoot.add(arcGroup);

      const getCoord = (lt: number, ln: number) => {
        const p = (90 - lt) * (Math.PI / 180);
        const t = (ln + 180) * (Math.PI / 180);
        return new THREE.Vector3(
          - (GLOBE_RADIUS * Math.sin(p) * Math.cos(t)),
          (GLOBE_RADIUS * Math.cos(p)),
          (GLOBE_RADIUS * Math.sin(p) * Math.sin(t))
        );
      };

      const createArc = () => {
        const getRandomLandPoint = () => {
          let lt = (Math.random() - 0.5) * 160;
          let ln = (Math.random() - 0.5) * 360;
          let attempts = 0;
          while (!isLandPixel(lt, ln) && attempts < 100) {
            lt = (Math.random() - 0.5) * 160;
            ln = (Math.random() - 0.5) * 360;
            attempts++;
          }
          return { lt, ln };
        };

        const threats = [
          { name: 'SECURITY_NODE', color: 0x0284c7 }, // Electric Sky
          { name: 'CTF_EVENT', color: 0xf59e0b },    // Championship Gold
          { name: 'EXPLOIT_PATCH', color: 0x6366f1 } // Royal Violet
        ];
        const threat = threats[Math.floor(Math.random() * threats.length)];

        const startPt = getRandomLandPoint();
        const endPt = getRandomLandPoint();
        
        const s = getCoord(startPt.lt, startPt.ln);
        const e = getCoord(endPt.lt, endPt.ln);
        const m = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
        const d = s.distanceTo(e);
        m.normalize().multiplyScalar(GLOBE_RADIUS + d * 0.4);

        const curve = new THREE.QuadraticBezierCurve3(s, m, e);
        
        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.3, 3, false);
        const tubeMat = new THREE.MeshBasicMaterial({ 
          color: threat.color, 
          transparent: true, 
          opacity: 0,
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        arcGroup.add(tube);

        const impactGroup = new THREE.Group();
        impactGroup.position.copy(e);
        impactGroup.lookAt(0, 0, 0);
        
        const dotGeo = new THREE.CircleGeometry(0.8, 16);
        const ringGeo = new THREE.RingGeometry(1.0, 1.6, 16);
        const markerMat = new THREE.MeshBasicMaterial({ 
          color: threat.color, 
          transparent: true, 
          opacity: 0,
          side: THREE.DoubleSide 
        });
        
        const dot = new THREE.Mesh(dotGeo, markerMat);
        const ring = new THREE.Mesh(ringGeo, markerMat);
        impactGroup.add(dot, ring);
        arcGroup.add(impactGroup);

        const tl = gsap.timeline({
          onComplete: () => {
            arcGroup.remove(tube);
            arcGroup.remove(impactGroup);
            tubeGeo.dispose();
            tubeMat.dispose();
            dotGeo.dispose();
            ringGeo.dispose();
            markerMat.dispose();
          }
        });

        tl.to([tubeMat, markerMat], {
          opacity: 0.9,
          duration: 0.8,
          ease: "power2.out"
        })
        .to(ring.scale, {
          x: 1.6,
          y: 1.6,
          duration: 1.5,
          ease: "power1.inOut"
        }, 0)
        .to([tubeMat, markerMat], {
          opacity: 0,
          duration: 1,
          ease: "power2.in"
        }, "+=0.5");
      };
      
      arcInterval = setInterval(createArc, 1600);

      const render = () => {
        frameId = requestAnimationFrame(render);
        globeRoot.rotation.y += 0.0018;
        renderer.render(scene, camera);
      };
      render();
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
      if (arcInterval) clearInterval(arcInterval);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative border-none outline-none flex items-center justify-center pointer-events-none overflow-hidden" />
  );
}
