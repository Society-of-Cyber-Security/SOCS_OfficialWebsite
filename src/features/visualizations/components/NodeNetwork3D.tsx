"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

// ─── lat/lon → 3D point on sphere ────────────────────────────────────────────
function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── Arc curve with lifted midpoint ──────────────────────────────────────────
function arcCurve(
  a: THREE.Vector3,
  b: THREE.Vector3,
  lift = 0.38
): THREE.CatmullRomCurve3 {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(mid.length() * (1 + lift));
  return new THREE.CatmullRomCurve3([a, mid, b], false, "catmullrom", 0.5);
}

// ─── Build a "flight-path" dotted line from a curve ──────────────────────────
function buildDottedPath(
  curve: THREE.CatmullRomCurve3,
  steps = 60,
  color = 0xffaa55,
  opacity = 0.45
): THREE.Points {
  const pts = curve.getPoints(steps);
  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  const mat  = new THREE.PointsMaterial({
    color,
    size:            0.013,
    sizeAttenuation: true,
    transparent:     true,
    opacity,
    blending:        THREE.AdditiveBlending,
    depthWrite:      false,
  });
  return new THREE.Points(geom, mat);
}

// ─── Cities ──────────────────────────────────────────────────────────────────
const CITIES = [
  { name: "New York",    lat:  40.7, lon:  -74.0 },  // 0
  { name: "London",      lat:  51.5, lon:   -0.1 },  // 1
  { name: "Moscow",      lat:  55.7, lon:   37.6 },  // 2
  { name: "Beijing",     lat:  39.9, lon:  116.4 },  // 3
  { name: "Tokyo",       lat:  35.7, lon:  139.7 },  // 4
  { name: "Mumbai",      lat:  19.0, lon:   72.8 },  // 5
  { name: "Dubai",       lat:  25.2, lon:   55.3 },  // 6
  { name: "São Paulo",   lat: -23.5, lon:  -46.6 },  // 7
  { name: "Sydney",      lat: -33.9, lon:  151.2 },  // 8
  { name: "Cape Town",   lat: -33.9, lon:   18.4 },  // 9
  { name: "Singapore",   lat:   1.3, lon:  103.8 },  // 10
  { name: "Los Angeles", lat:  34.0, lon: -118.2 },  // 11
  { name: "Seoul",       lat:  37.6, lon:  126.9 },  // 12
  { name: "Cairo",       lat:  30.0, lon:   31.2 },  // 13
];

// ─── Ground-to-ground routes ──────────────────────────────────────────────────
const G2G_ROUTES: [number, number][] = [
  [0, 1],   // NY → London
  [2, 3],   // Moscow → Beijing
  [3, 4],   // Beijing → Tokyo
  [3, 10],  // Beijing → Singapore
  [4, 8],   // Tokyo → Sydney
  [5, 10],  // Mumbai → Singapore
  [6, 1],   // Dubai → London
  [7, 9],   // São Paulo → Cape Town
  [11, 7],  // LA → São Paulo
  [12, 4],  // Seoul → Tokyo
  [13, 6],  // Cairo → Dubai
  [9, 1],   // Cape Town → London
];

// ─── Satellite relay routes [cityA, cityB, relayLat, relayLon] ───────────────
// relay lat/lon defines where the satellite "sits" as a fixed relay point in orbit
const SAT_ROUTES: [number, number, number, number][] = [
  [0,  1,   55.0,  -35.0],  // NY →(sat)→ London  (North Atlantic)
  [7,  9,  -10.0,  -20.0],  // São Paulo →(sat)→ Cape Town (South Atlantic)
  [11, 0,   40.0,  -95.0],  // LA →(sat)→ NY (over US)
];

// ─── Satellite orbital configs ────────────────────────────────────────────────
const SAT_ORBITS = [
  { radius: 1.55, inclinationDeg: 15,  speed: 0.18,  startAngle: 0.0 },
  { radius: 1.65, inclinationDeg: -30, speed: 0.13,  startAngle: 2.1 },
  { radius: 1.50, inclinationDeg: 52,  speed: 0.22,  startAngle: 4.3 },
];

// ─── Build a realistic satellite mesh ────────────────────────────────────────
function buildSatellite(): THREE.Group {
  const g = new THREE.Group();

  // 1. Bus (Main Body) - Octagonal prism
  const busGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.08, 8);
  const busMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Gold
    metalness: 0.7,
    roughness: 0.4,
    bumpScale: 0.004
  });
  
  // Procedural noise for gold foil (MLI) crinkles
  const cCanvas = document.createElement('canvas');
  cCanvas.width = 128; cCanvas.height = 128;
  const ctx = cCanvas.getContext('2d');
  if (ctx) {
    for (let i = 0; i < 128; i++) {
      for (let j = 0; j < 128; j++) {
        const val = Math.floor(Math.random() * 255);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }
  const foilTex = new THREE.CanvasTexture(cCanvas);
  foilTex.wrapS = THREE.RepeatWrapping;
  foilTex.wrapT = THREE.RepeatWrapping;
  foilTex.repeat.set(2, 4);
  busMat.bumpMap = foilTex;

  const bus = new THREE.Mesh(busGeom, busMat);
  bus.rotation.x = Math.PI / 2;
  g.add(bus);

  // 2. Solar Panels
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x051244,
    metalness: 0.9,
    roughness: 0.1,
    side: THREE.DoubleSide
  });

  // Procedural solar grid texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 256; pCanvas.height = 64;
  const pCtx = pCanvas.getContext('2d');
  if (pCtx) {
    pCtx.fillStyle = '#051244';
    pCtx.fillRect(0, 0, 256, 64);
    pCtx.strokeStyle = '#6688cc';
    pCtx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 32) {
      pCtx.beginPath(); pCtx.moveTo(i, 0); pCtx.lineTo(i, 64); pCtx.stroke();
    }
    for (let i = 0; i <= 64; i += 16) {
      pCtx.beginPath(); pCtx.moveTo(0, i); pCtx.lineTo(256, i); pCtx.stroke();
    }
  }
  const pTex = new THREE.CanvasTexture(pCanvas);
  panelMat.map = pTex;

  [-1, 1].forEach(side => {
    // Truss arm
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0015, 0.0015, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
    );
    arm.position.x = side * 0.04;
    arm.rotation.z = Math.PI / 2;
    g.add(arm);

    // Panel
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.002, 0.05), panelMat);
    panel.position.x = side * 0.14;
    // Add metallic frame
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.18, 0.002, 0.05)),
      new THREE.LineBasicMaterial({ color: 0xaaaaaa })
    );
    panel.add(frame);
    g.add(panel);
  });

  // 3. Main Dish Antenna (facing forward)
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0, metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide
  });
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5),
    dishMat
  );
  dish.rotation.x = Math.PI; 
  dish.position.set(0, 0, 0.035);
  g.add(dish);

  // Feed horn
  const feed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.001, 0.003, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  feed.rotation.x = Math.PI / 2;
  feed.position.set(0, 0, 0.045);
  g.add(feed);

  // Dish struts
  for (let i = 0; i < 4; i++) {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0005, 0.0005, 0.032),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    const a = (i / 4) * Math.PI * 2;
    strut.position.set(Math.cos(a) * 0.02, Math.sin(a) * 0.02, 0.04);
    // Point towards feed horn
    strut.lookAt(0, 0, 0.055);
    strut.rotation.x += Math.PI / 2;
    g.add(strut);
  }

  // 4. Secondary Side Dishes
  [-1, 1].forEach(side => {
    const subDish = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      dishMat
    );
    subDish.rotation.y = side * Math.PI / 2;
    subDish.position.set(side * 0.025, 0, 0.01);
    g.add(subDish);
  });

  // 5. Engine Nozzle & Thruster Plume
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.012, 0.015, 16),
    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.4 })
  );
  nozzle.rotation.x = -Math.PI / 2;
  nozzle.position.set(0, 0, -0.045);
  g.add(nozzle);

  const plume = new THREE.Mesh(
    new THREE.ConeGeometry(0.008, 0.03, 16),
    new THREE.MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
  );
  plume.rotation.x = Math.PI / 2;
  plume.position.set(0, 0, -0.06);
  g.add(plume);

  // Group wrapper to orient the whole satellite correctly on the orbit path
  const wrapper = new THREE.Group();
  g.rotation.y = Math.PI; // Face the direction of travel
  wrapper.add(g);

  return wrapper;
}

// ─── Build a tiny envelope mesh ──────────────────────────────────────────────
function buildEnvelope(color = 0xffffff): THREE.Group {
  const g = new THREE.Group();
  
  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, 0.020, 0.002),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false })
  );
  g.add(body);
  
  // Flap (V shape)
  const flapPts = [
    new THREE.Vector3(-0.016, 0.010, 0.0015),
    new THREE.Vector3(0, -0.002, 0.0015),
    new THREE.Vector3(0.016, 0.010, 0.0015)
  ];
  const flap = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(flapPts),
    new THREE.LineBasicMaterial({ color: 0x112244, transparent: true, opacity: 0.8 })
  );
  g.add(flap);
  
  // Outline
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.032, 0.020, 0.002)),
    new THREE.LineBasicMaterial({ color: 0x112244, transparent: true, opacity: 0.8 })
  );
  g.add(edges);

  return g;
}

export function NodeNetwork3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width  = container.clientWidth;
    let height = container.clientHeight;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 500);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const R = 1; // Earth radius

    // ── Textures ──────────────────────────────────────────────────────────────
    const loader = new THREE.TextureLoader();
    const BASE   = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures";
    const earthDayTex    = loader.load(`${BASE}/planets/earth_atmos_2048.jpg`);
    const earthSpecTex   = loader.load(`${BASE}/planets/earth_specular_2048.jpg`);
    const earthNormalTex = loader.load(`${BASE}/planets/earth_normal_2048.jpg`);
    const earthCloudTex  = loader.load(`${BASE}/planets/earth_clouds_1024.png`);

    // ── Earth group (everything that tilts with mouse) ────────────────────────
    const earthGroup = new THREE.Group();

    // Earth surface
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(R, 64, 64),
      new THREE.MeshPhongMaterial({
        map: earthDayTex, specularMap: earthSpecTex, normalMap: earthNormalTex,
        normalScale: new THREE.Vector2(0.6, 0.6),
        specular: new THREE.Color(0x224466), shininess: 18,
      })
    );
    earthGroup.add(earth);

    // Clouds
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.006, 64, 64),
      new THREE.MeshPhongMaterial({ map: earthCloudTex, transparent: true, opacity: 0.38, depthWrite: false })
    );
    earthGroup.add(clouds);

    // Atmosphere halo
    earthGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.12, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x1a6af5, transparent: true, opacity: 0.07, side: THREE.BackSide })
    ));

    // Inner rim glow
    earthGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.025, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x0088ff, emissive: 0x0055cc, emissiveIntensity: 0.6,
        transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    ));

    // Grid
    earthGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.002, 36, 18),
      new THREE.MeshBasicMaterial({ color: 0x00ccff, wireframe: true, transparent: true, opacity: 0.06 })
    ));

    // ── City nodes ────────────────────────────────────────────────────────────
    const cityPositions: THREE.Vector3[] = [];
    const cityDots:  THREE.Mesh[] = [];
    const cityRings: THREE.Mesh[] = [];

    CITIES.forEach(city => {
      const pos = latLonToVec3(city.lat, city.lon, R * 1.003);
      cityPositions.push(pos);

      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.010, 16),
        new THREE.MeshBasicMaterial({ color: 0x00eeff, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
      );
      dot.position.copy(pos); dot.lookAt(pos.clone().multiplyScalar(2));
      earthGroup.add(dot); cityDots.push(dot);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.013, 0.019, 24),
        new THREE.MeshBasicMaterial({ color: 0x00eeff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      ring.position.copy(pos); ring.lookAt(pos.clone().multiplyScalar(2));
      earthGroup.add(ring); cityRings.push(ring);
    });

    // ── Ground-to-ground dotted flight paths + packets ────────────────────────
    interface Packet {
      curve:    THREE.CatmullRomCurve3;
      group:    THREE.Group;
      progress: number;
      speed:    number;
    }

    const packets: Packet[] = [];
    const COLORS  = [0x00eeff, 0x00ffcc, 0x44aaff, 0xffffff];

    G2G_ROUTES.forEach(([ai, bi], ri) => {
      const a     = cityPositions[ai];
      const b     = cityPositions[bi];
      const curve = arcCurve(a, b, 0.40);

      // Dotted flight path
      earthGroup.add(buildDottedPath(curve, 55, 0x00ccff, 0.30));

      // 1 packet per route (Envelope)
      const mesh = buildEnvelope(COLORS[ri % COLORS.length]);
      earthGroup.add(mesh);
      packets.push({ curve, group: mesh, progress: ri / G2G_ROUTES.length, speed: 0.0011 + (ri % 5) * 0.0001 });
    });

    // ── Satellite relay routes ────────────────────────────────────────────────
    // For each sat-route: city_A → relay_point_in_orbit → city_B
    // Two arc segments drawn as dotted lines; one packet travels the full path.
    interface SatPacket {
      curve1:   THREE.CatmullRomCurve3; // city → relay
      curve2:   THREE.CatmullRomCurve3; // relay → city
      group:    THREE.Group;
      progress: number; // 0–1 across both curves (0–0.5 = curve1, 0.5–1 = curve2)
      speed:    number;
    }

    const satPackets: SatPacket[] = [];

    SAT_ROUTES.forEach(([ai, bi, relLat, relLon], ri) => {
      const a     = cityPositions[ai];
      const b     = cityPositions[bi];
      // Relay point: on the orbit sphere (R * 1.55) at given lat/lon
      const relay = latLonToVec3(relLat, relLon, R * 1.55);

      // Two arc segments — uplink and downlink
      // Uplink: city → relay (higher lift since relay is already elevated)
      const upCurve = new THREE.CatmullRomCurve3([
        a,
        a.clone().lerp(relay, 0.5).normalize().multiplyScalar(relay.length() * 0.9),
        relay,
      ], false, "catmullrom", 0.5);

      const downCurve = new THREE.CatmullRomCurve3([
        relay,
        b.clone().lerp(relay, 0.5).normalize().multiplyScalar(relay.length() * 0.9),
        b,
      ], false, "catmullrom", 0.5);

      // Dotted paths (brighter/more visible for sat routes)
      earthGroup.add(buildDottedPath(upCurve,   40, 0x44ffcc, 0.45));
      earthGroup.add(buildDottedPath(downCurve, 40, 0x44ffcc, 0.45));

      // Packet (Envelope)
      const mesh = buildEnvelope(0x88ffee);
      earthGroup.add(mesh);

      satPackets.push({
        curve1: upCurve, curve2: downCurve, group: mesh,
        progress: ri / SAT_ROUTES.length,
        speed: 0.0009,
      });
    });

    scene.add(earthGroup);

    // ── Satellites ────────────────────────────────────────────────────────────
    // Satellites are NOT inside earthGroup — they orbit in world space independently
    interface SatObject {
      group:          THREE.Group;
      radius:         number;
      speed:          number;
      inclination:    number; // radians
      angle:          number;
      beamMat:        THREE.LineBasicMaterial;
      beamLine:       THREE.Line;
    }

    const satellites: SatObject[] = [];

    SAT_ORBITS.forEach(cfg => {
      const sat = buildSatellite();
      scene.add(sat);

      // Orbit ring (faint)
      const ringPts: THREE.Vector3[] = [];
      const inc = cfg.inclinationDeg * (Math.PI / 180);
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(
          cfg.radius * Math.cos(a),
          cfg.radius * Math.sin(a) * Math.sin(inc),
          cfg.radius * Math.sin(a) * Math.cos(inc)
        ));
      }
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(ringPts),
        new THREE.LineBasicMaterial({ color: 0x004488, transparent: true, opacity: 0.25 })
      );
      scene.add(orbitLine);

      // Beam line (satellite → earth center, hidden until animated)
      const beamGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const beamMat  = new THREE.LineBasicMaterial({ color: 0x00eeff, transparent: true, opacity: 0.0 });
      const beamLine = new THREE.Line(beamGeom, beamMat);
      scene.add(beamLine);

      satellites.push({
        group: sat,
        radius: cfg.radius,
        speed:  cfg.speed,
        inclination: cfg.inclinationDeg * (Math.PI / 180),
        angle: cfg.startAngle,
        beamMat, beamLine,
      });
    });

    // ── Stars ─────────────────────────────────────────────────────────────────
    const starPos = new Float32Array(2000 * 3);
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 400;
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeom, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.25, transparent: true, opacity: 0.55,
    })));

    // ── Lighting ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x112244, 1.4));
    const sun = new THREE.DirectionalLight(0xfff5e0, 2.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const fillLight = new THREE.DirectionalLight(0x2244aa, 0.3);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);
    // Satellite panel light
    scene.add(new THREE.PointLight(0x0044ff, 0.4, 10));

    // ── Mouse ─────────────────────────────────────────────────────────────────
    const targetRot = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetRot.y =  ((e.clientX - rect.left) / width  * 2 - 1) * Math.PI * 0.3;
      targetRot.x = -((e.clientY - rect.top)  / height * 2 - 1) * Math.PI * 0.15;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // ── Animation ─────────────────────────────────────────────────────────────
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Earth rotation
      earth.rotation.y  = t * 0.10;
      clouds.rotation.y = t * 0.12;

      // Float
      earthGroup.position.y = Math.sin(t * 0.9) * 0.05;

      // Mouse tilt
      earthGroup.rotation.x += (targetRot.x - earthGroup.rotation.x) * 0.04;
      earthGroup.rotation.y += (targetRot.y - earthGroup.rotation.y) * 0.04;

      // City rings pulse
      cityRings.forEach((ring, i) => {
        const p = 0.7 + 0.5 * Math.sin(t * 2.0 + i * 0.85);
        ring.scale.setScalar(p);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.18 + 0.40 * Math.abs(Math.sin(t * 2.0 + i * 0.85));
      });

      // City dots twinkle
      cityDots.forEach((d, i) => {
        (d.material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.4 * Math.sin(t * 2.5 + i * 1.4);
      });

      // Ground-to-ground packets
      packets.forEach(pkt => {
        pkt.progress = (pkt.progress + pkt.speed) % 1;
        const pos = pkt.curve.getPoint(pkt.progress);
        pkt.group.position.copy(pos);
        
        // Orient along curve
        const tangent = pkt.curve.getTangent(pkt.progress);
        pkt.group.lookAt(pos.clone().add(tangent));
        
        const fade = Math.sin(pkt.progress * Math.PI);
        const s = 0.7 + 0.5 * fade;
        pkt.group.scale.setScalar(s);

        // Update opacity for all children (body, flap, edges)
        pkt.group.children.forEach((child, idx) => {
          const mat = (child as THREE.Mesh | THREE.Line).material as THREE.Material;
          mat.opacity = (idx === 0 ? 0.9 : 0.8) * fade; 
        });
      });

      // Satellite relay packets
      satPackets.forEach(pkt => {
        pkt.progress = (pkt.progress + pkt.speed) % 1;
        // 0→0.5 = uplink curve, 0.5→1 = downlink curve
        let pos: THREE.Vector3, tangent: THREE.Vector3;
        if (pkt.progress < 0.5) {
          pos = pkt.curve1.getPoint(pkt.progress * 2);
          tangent = pkt.curve1.getTangent(pkt.progress * 2);
        } else {
          pos = pkt.curve2.getPoint((pkt.progress - 0.5) * 2);
          tangent = pkt.curve2.getTangent((pkt.progress - 0.5) * 2);
        }
        pkt.group.position.copy(pos);
        pkt.group.lookAt(pos.clone().add(tangent));
        
        const fade = Math.sin(pkt.progress * Math.PI);
        const s = 0.8 + 0.6 * fade;
        pkt.group.scale.setScalar(s);

        pkt.group.children.forEach((child, idx) => {
          const mat = (child as THREE.Mesh | THREE.Line).material as THREE.Material;
          mat.opacity = (idx === 0 ? 0.9 : 0.8) * fade; 
        });
      });

      // Satellites orbit
      satellites.forEach((sat, si) => {
        sat.angle += sat.speed * 0.01;
        const a   = sat.angle;
        const inc = sat.inclination;
        sat.group.position.set(
          sat.radius * Math.cos(a),
          sat.radius * Math.sin(a) * Math.sin(inc),
          sat.radius * Math.sin(a) * Math.cos(inc)
        );
        // Orient satellite along orbit tangent
        sat.group.lookAt(new THREE.Vector3(
          sat.radius * Math.cos(a + 0.05),
          sat.radius * Math.sin(a + 0.05) * Math.sin(inc),
          sat.radius * Math.sin(a + 0.05) * Math.cos(inc)
        ));

        // Beam: satellite → Earth center
        const beamPos = sat.beamLine.geometry.attributes.position as THREE.BufferAttribute;
        beamPos.setXYZ(0, sat.group.position.x, sat.group.position.y, sat.group.position.z);
        beamPos.setXYZ(1, 0, 0, 0);
        beamPos.needsUpdate = true;
        sat.beamMat.opacity = 0.08 + 0.06 * Math.sin(t * 3 + si * 2);

        // Solar panel shimmer
        sat.group.children.forEach((child, ci) => {
          if (ci > 0 && ci < 3) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat.emissiveIntensity !== undefined) {
              mat.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 2 + si);
            }
          }
        });
      });

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!containerRef.current) return;
      width  = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative pointer-events-auto cursor-crosshair"
    />
  );
}
