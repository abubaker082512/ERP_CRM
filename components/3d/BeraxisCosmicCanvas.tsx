"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface BeraxisCosmicCanvasProps {
    interactive?: boolean;
    className?: string;
}

/**
 * Creates a procedural high-tech digital Earth texture with glowing continents,
 * latitude/longitude coordinate grid, and interconnected global commerce nodes.
 */
function createDigitalEarthTexture(): THREE.CanvasTexture {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return new THREE.CanvasTexture(canvas);
    }

    // 1. Deep Space Ocean Base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, "#03071e");
    oceanGrad.addColorStop(0.5, "#0b0f2a");
    oceanGrad.addColorStop(1, "#03071e");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Latitude and Longitude Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(6, 182, 212, 0.12)"; // Cyan grid

    // Meridians (Longitudes)
    for (let x = 0; x <= width; x += width / 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Parallels (Latitudes)
    for (let y = 0; y <= height; y += height / 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Equator & Prime Meridian Highlight
    ctx.strokeStyle = "rgba(168, 85, 247, 0.35)"; // Purple equator
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // 3. Simplified Digital Continent Silhouettes
    const drawLandmass = (points: [number, number][], fill: string, stroke: string) => {
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach(([px, py], i) => {
            const x = (px / 100) * width;
            const y = (py / 100) * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };

    const landFill = "rgba(16, 185, 129, 0.22)"; // Emerald glow
    const landStroke = "rgba(34, 211, 238, 0.85)"; // Cyan cyber border

    // North America
    drawLandmass(
        [[12, 18], [25, 16], [32, 24], [28, 42], [22, 45], [16, 38], [10, 26]],
        landFill,
        landStroke
    );
    // South America
    drawLandmass(
        [[25, 50], [33, 54], [31, 74], [27, 85], [23, 72], [22, 56]],
        landFill,
        landStroke
    );
    // Europe
    drawLandmass(
        [[45, 18], [55, 16], [58, 28], [52, 34], [44, 30], [42, 22]],
        landFill,
        landStroke
    );
    // Africa
    drawLandmass(
        [[44, 38], [58, 36], [62, 55], [54, 75], [47, 72], [42, 50]],
        landFill,
        landStroke
    );
    // Asia
    drawLandmass(
        [[58, 16], [82, 14], [88, 32], [78, 52], [64, 42], [58, 28]],
        landFill,
        landStroke
    );
    // Australia
    drawLandmass(
        [[75, 62], [85, 60], [86, 75], [78, 78], [73, 70]],
        landFill,
        landStroke
    );

    // 4. Global Commerce Hubs & Interconnected Enterprise Arcs
    const hubs: [number, number, string][] = [
        [22, 28, "New York"],
        [48, 24, "London"],
        [54, 26, "Frankfurt"],
        [60, 44, "Dubai"],
        [74, 48, "Singapore"],
        [83, 26, "Tokyo"],
        [80, 70, "Sydney"]
    ];

    // Draw connecting global network arcs
    ctx.strokeStyle = "rgba(236, 72, 153, 0.45)"; // Pink telemetry line
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i < hubs.length - 1; i++) {
        const [x1, y1] = hubs[i];
        const [x2, y2] = hubs[i + 1];
        ctx.beginPath();
        ctx.moveTo((x1 / 100) * width, (y1 / 100) * height);
        // Quadratic bezier arc for curvature
        const midX = ((x1 + x2) / 2 / 100) * width;
        const midY = (((y1 + y2) / 2 - 12) / 100) * height;
        ctx.quadraticCurveTo(midX, midY, (x2 / 100) * width, (y2 / 100) * height);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Hub Nodes (glowing amber/cyan dots)
    hubs.forEach(([hx, hy]) => {
        const x = (hx / 100) * width;
        const y = (hy / 100) * height;

        // Outer glow
        const radGrad = ctx.createRadialGradient(x, y, 1, x, y, 8);
        radGrad.addColorStop(0, "rgba(251, 191, 36, 1)");
        radGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.5)");
        radGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid core
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

export default function BeraxisCosmicCanvas({
    interactive = true,
    className = ""
}: BeraxisCosmicCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // ── SCENE, CAMERA, RENDERER ──
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 10;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;

        const canvas = renderer.domElement;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "1";
        container.appendChild(canvas);

        // ── 3D EARTH + UNIVERSE COMPOSITE GROUP ──
        const rootGroup = new THREE.Group();
        scene.add(rootGroup);

        // 1. DIGITAL HOLOGRAPHIC EARTH SPHERE
        const earthTexture = createDigitalEarthTexture();
        const earthGeometry = new THREE.SphereGeometry(1.5, 64, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: earthTexture,
            roughness: 0.25,
            metalness: 0.15,
            emissive: new THREE.Color(0x0a192f),
            emissiveMap: earthTexture,
            emissiveIntensity: 0.85
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        // Tilt Earth axis to realistic 23.5 degrees
        earthMesh.rotation.z = (23.5 * Math.PI) / 180;
        rootGroup.add(earthMesh);

        // 2. LUMINOUS ATMOSPHERE SHELL (Cosmic Cyan/Aurora Rim)
        const atmosphereGeo = new THREE.SphereGeometry(1.58, 48, 48);
        const atmosphereMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x38bdf8),
            transparent: true,
            opacity: 0.28,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        rootGroup.add(atmosphereMesh);

        // 3. UNIVERSE CELESTIAL GALAXY RING (Saturn / Cosmic Gyroscope Ribbon)
        const ringGeo = new THREE.RingGeometry(2.1, 3.2, 80);
        // Double-sided material with vibrant celestial colors
        const ringMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xa855f7),
            emissive: new THREE.Color(0x7c3aed),
            emissiveIntensity: 0.9,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65,
            roughness: 0.3
        });
        const galaxyRing = new THREE.Mesh(ringGeo, ringMat);
        galaxyRing.rotation.x = Math.PI / 2.5;
        galaxyRing.rotation.y = Math.PI / 8;
        rootGroup.add(galaxyRing);

        // Outer Wireframe Orbital Ring (The Interconnected Universe)
        const wireRingGeo = new THREE.TorusGeometry(3.25, 0.02, 16, 120);
        const wireRingMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x06b6d4),
            emissive: new THREE.Color(0x0891b2),
            emissiveIntensity: 1.2
        });
        const wireRing = new THREE.Mesh(wireRingGeo, wireRingMat);
        wireRing.rotation.x = Math.PI / 2.5;
        wireRing.rotation.y = Math.PI / 8;
        rootGroup.add(wireRing);

        // 4. CELESTIAL SATELLITE MOONS (Cosmic Enterprise Orbiters)
        const satellitesGroup = new THREE.Group();
        rootGroup.add(satellitesGroup);

        const moonGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const moonColors = [0x22d3ee, 0xf472b6, 0xfbbf24, 0xa855f7];
        const satellites: { mesh: THREE.Mesh; angle: number; speed: number; radius: number }[] = [];

        for (let i = 0; i < 5; i++) {
            const color = moonColors[i % moonColors.length];
            const mat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 1.6
            });
            const sat = new THREE.Mesh(moonGeo, mat);
            satellitesGroup.add(sat);
            satellites.push({
                mesh: sat,
                angle: (i * Math.PI * 2) / 5,
                speed: 0.014 + (i % 3) * 0.006,
                radius: 2.4 + (i % 2) * 0.5
            });
        }

        // 5. SWIRLING GALAXY NEBULA PARTICLES (Deep Universe Horizon)
        const particleCount = 220;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const palette = [
            new THREE.Color(0x8b5cf6), // Purple
            new THREE.Color(0x06b6d4), // Cyan
            new THREE.Color(0xec4899), // Pink
            new THREE.Color(0xf59e0b)  // Amber
        ];

        for (let i = 0; i < particleCount; i++) {
            // Spiral galaxy distribution around Earth
            const angle = Math.random() * Math.PI * 2;
            const dist = 2.0 + Math.random() * 6.0;
            positions[i * 3] = Math.cos(angle) * dist;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
            positions[i * 3 + 2] = Math.sin(angle) * dist;

            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.07,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const galaxyDust = new THREE.Points(particleGeometry, particleMaterial);
        galaxyDust.rotation.x = Math.PI / 3.2;
        rootGroup.add(galaxyDust);

        // ── DYNAMIC LIGHTING ──
        const ambientLight = new THREE.AmbientLight(0x101530, 2.5);
        scene.add(ambientLight);

        // Sun / Key Light illuminating Earth Day Side
        const sunLight = new THREE.DirectionalLight(0xfff7ed, 4.0);
        sunLight.position.set(6, 4, 7);
        scene.add(sunLight);

        // Deep Cosmic Nebula Light (Purple / Violet)
        const nebulaLight = new THREE.PointLight(0xa855f7, 6, 20);
        nebulaLight.position.set(-6, -3, 3);
        scene.add(nebulaLight);

        // Cyan Edge Rim Light
        const cyanRim = new THREE.PointLight(0x06b6d4, 5, 18);
        cyanRim.position.set(2, 6, -4);
        scene.add(cyanRim);

        // ── RESPONSIVE CURSOR-FOLLOWING ENGINE ──
        let mouseX = 0;
        let mouseY = 0;
        let smoothMouseX = 0;
        let smoothMouseY = 0;
        let isMobile = window.innerWidth < 768;

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            isMobile = width < 768;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            let clientX = 0;
            let clientY = 0;
            if ("touches" in e && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if ("clientX" in e) {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            // Normalized Device Coordinates (-1 to +1)
            mouseX = (clientX / window.innerWidth) * 2 - 1;
            mouseY = -(clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener("resize", handleResize);
        if (interactive) {
            window.addEventListener("pointermove", handlePointerMove, { passive: true });
            window.addEventListener("touchmove", handlePointerMove, { passive: true });
        }

        // ── CONTINUOUS ANIMATION LOOP (FOLLOWS CURSOR SILKY SMOOTH) ──
        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Smooth exponential damping toward mouse cursor
            smoothMouseX += (mouseX - smoothMouseX) * 0.055;
            smoothMouseY += (mouseY - smoothMouseY) * 0.055;

            // 1. Earth Axial Rotation (Day / Night Cycle)
            earthMesh.rotation.y = elapsedTime * 0.18;

            // 2. Galaxy Ring & Dust Precession
            galaxyRing.rotation.z = elapsedTime * 0.08;
            wireRing.rotation.z = -elapsedTime * 0.06;
            galaxyDust.rotation.y = elapsedTime * 0.03;

            // 3. Orbiting Satellites
            satellites.forEach((sat) => {
                sat.angle += sat.speed;
                sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
                sat.mesh.position.y = Math.sin(sat.angle) * sat.radius * 0.65;
                sat.mesh.position.z = Math.sin(sat.angle * 1.5) * 0.6;
            });

            // 4. Calculate World Boundaries based on Camera Viewport
            const aspect = camera.aspect;
            const vFov = (camera.fov * Math.PI) / 180;
            const visibleHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
            const visibleWidth = visibleHeight * aspect;

            // Target coordinates mapped to camera viewport
            // Offset slightly to the right so cursor doesn't completely block under cursor
            const targetX = smoothMouseX * (visibleWidth * 0.38);
            const targetY = smoothMouseY * (visibleHeight * 0.38);

            if (isMobile) {
                rootGroup.scale.set(0.5, 0.5, 0.5);
                rootGroup.position.x = targetX * 0.5;
                rootGroup.position.y = targetY * 0.5;
                rootGroup.position.z = -2.5;
            } else {
                rootGroup.scale.set(0.82, 0.82, 0.82);
                rootGroup.position.x = targetX;
                rootGroup.position.y = targetY;
                rootGroup.position.z = -0.5;
            }

            // Velocity tilt: Earth tilts organically in the direction of cursor velocity
            const vx = targetX - rootGroup.position.x;
            const vy = targetY - rootGroup.position.y;
            rootGroup.rotation.z = -vx * 0.12;
            rootGroup.rotation.x = 0.2 + vy * 0.08;

            renderer.render(scene, camera);
        };

        animate();

        // ── CLEANUP ──
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            if (interactive) {
                window.removeEventListener("pointermove", handlePointerMove);
                window.removeEventListener("touchmove", handlePointerMove);
            }

            earthGeometry.dispose();
            earthMaterial.dispose();
            atmosphereGeo.dispose();
            atmosphereMat.dispose();
            ringGeo.dispose();
            ringMat.dispose();
            wireRingGeo.dispose();
            wireRingMat.dispose();
            moonGeo.dispose();
            particleGeometry.dispose();
            particleMaterial.dispose();
            earthTexture.dispose();

            renderer.dispose();
            if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        };
    }, [interactive]);

    return (
        <div 
            ref={containerRef} 
            className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`}
            style={{ zIndex: 1 }}
            aria-hidden="true"
        />
    );
}
