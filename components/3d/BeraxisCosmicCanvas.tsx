"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface BeraxisCosmicCanvasProps {
    interactive?: boolean;
    className?: string;
}

export default function BeraxisCosmicCanvas({
    interactive = true,
    className = ""
}: BeraxisCosmicCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene, Camera, WebGLRenderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 11;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;

        const canvas = renderer.domElement;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "1";
        container.appendChild(canvas);

        // ── 3D LUXURY BERAXIS QUANTUM CORE ──
        const coreGroup = new THREE.Group();
        scene.add(coreGroup);

        // 1. Glossy Iridescent Metallic Torus Knot Ribbon (Infinity Symbol of Unified Business)
        // Tube geometry: smooth subdivided curvature
        const knotGeometry = new THREE.TorusKnotGeometry(1.4, 0.36, 180, 36, 2, 3);
        const knotMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0x6b21a8), // Deep purple base
            emissive: new THREE.Color(0x1e1b4b),
            emissiveIntensity: 0.45,
            roughness: 0.12,
            metalness: 0.88,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            reflectivity: 0.95,
            transparent: true,
            opacity: 0.96
        });
        const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
        coreGroup.add(knotMesh);

        // 2. Inner Glowing Core Orb (The AI Engine)
        const innerOrbGeo = new THREE.SphereGeometry(0.75, 32, 32);
        const innerOrbMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x06b6d4),
            emissive: new THREE.Color(0x0891b2),
            emissiveIntensity: 1.4,
            roughness: 0.2,
            metalness: 0.6
        });
        const innerOrb = new THREE.Mesh(innerOrbGeo, innerOrbMat);
        coreGroup.add(innerOrb);

        // 3. Delicate Luminous Gyroscope Rings
        const ringGeo1 = new THREE.TorusGeometry(2.3, 0.02, 16, 120);
        const ringMat1 = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xec4899),
            emissive: new THREE.Color(0xdb2777),
            emissiveIntensity: 1.2,
            roughness: 0.2
        });
        const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        ring1.rotation.x = Math.PI / 3;
        coreGroup.add(ring1);

        const ringGeo2 = new THREE.TorusGeometry(2.6, 0.018, 16, 120);
        const ringMat2 = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x22d3ee),
            emissive: new THREE.Color(0x06b6d4),
            emissiveIntensity: 1.2,
            roughness: 0.2
        });
        const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        ring2.rotation.y = Math.PI / 3;
        coreGroup.add(ring2);

        // 4. Orbiting Module Nodes (Planetary ERP satellites)
        const satelliteGroup = new THREE.Group();
        coreGroup.add(satelliteGroup);

        const satGeo = new THREE.SphereGeometry(0.09, 16, 16);
        const satColors = [0x22d3ee, 0xf472b6, 0xfbbf24, 0xa855f7];
        const satellites: { mesh: THREE.Mesh; angle: number; speed: number; radius: number }[] = [];

        for (let i = 0; i < 6; i++) {
            const color = satColors[i % satColors.length];
            const mat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 1.5
            });
            const sat = new THREE.Mesh(satGeo, mat);
            satelliteGroup.add(sat);
            satellites.push({
                mesh: sat,
                angle: (i * Math.PI * 2) / 6,
                speed: 0.012 + (i % 2) * 0.005,
                radius: 2.3 + (i % 2) * 0.3
            });
        }

        // 5. Ambient Stardust Galaxy (Subtle Depth Particles)
        const particleCount = 180;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorPalette = [
            new THREE.Color(0xa855f7),
            new THREE.Color(0xec4899),
            new THREE.Color(0x06b6d4),
            new THREE.Color(0xf59e0b)
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 22;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 14;

            const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
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
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // ── 3-POINT DYNAMIC BRAND LIGHTING ──
        const ambientLight = new THREE.AmbientLight(0x0d0d1a, 2.5);
        scene.add(ambientLight);

        // Vibrant Key light (Cosmic Violet / Pink)
        const keyLight = new THREE.PointLight(0xa855f7, 8, 25);
        keyLight.position.set(5, 5, 6);
        scene.add(keyLight);

        // Cyan Rim light (sharp edge highlight)
        const rimLight = new THREE.PointLight(0x06b6d4, 6, 22);
        rimLight.position.set(-6, -3, 4);
        scene.add(rimLight);

        // Amber Fill light (warm golden sheen)
        const fillLight = new THREE.PointLight(0xf59e0b, 4, 18);
        fillLight.position.set(2, -5, 3);
        scene.add(fillLight);

        // ── SMOOTH CONTINUOUS SCROLL & MOUSE INTERPOLATION ──
        let mouseX = 0;
        let mouseY = 0;
        let smoothMouseX = 0;
        let smoothMouseY = 0;
        let targetScrollProgress = 0;
        let smoothScrollProgress = 0;
        let isMobile = window.innerWidth < 768;

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            isMobile = width < 768;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const handleScroll = () => {
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const raw = (window.scrollY || window.pageYOffset || 0) / maxScroll;
            targetScrollProgress = Math.min(1, Math.max(0, raw));
        };

        window.addEventListener("resize", handleResize);
        if (interactive) {
            window.addEventListener("mousemove", handleMouseMove);
        }
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        // ── CONTINUOUS FLUID ANIMATION LOOP (ZERO JUMPS) ──
        let animationFrameId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Continuous dampening interpolation for mouse & scroll
            smoothMouseX += (mouseX - smoothMouseX) * 0.05;
            smoothMouseY += (mouseY - smoothMouseY) * 0.05;
            smoothScrollProgress += (targetScrollProgress - smoothScrollProgress) * 0.06;

            // 1. Fluid Multi-Axis Rotation (Hypnotic, organic 3D spin)
            knotMesh.rotation.x = elapsedTime * 0.35;
            knotMesh.rotation.y = elapsedTime * 0.45;
            knotMesh.rotation.z = Math.sin(elapsedTime * 0.2) * 0.3;

            // Inner orb subtle breathing
            const pulse = 1 + Math.sin(elapsedTime * 2.2) * 0.06;
            innerOrb.scale.set(pulse, pulse, pulse);

            // Gyroscope rings spin in opposition
            ring1.rotation.z = elapsedTime * 0.3;
            ring1.rotation.y = Math.sin(elapsedTime * 0.25) * 0.4;

            ring2.rotation.z = -elapsedTime * 0.25;
            ring2.rotation.x = Math.cos(elapsedTime * 0.2) * 0.4;

            // Orbiting satellites
            satellites.forEach((sat) => {
                sat.angle += sat.speed;
                sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
                sat.mesh.position.y = Math.sin(sat.angle) * sat.radius * 0.85;
                sat.mesh.position.z = Math.sin(sat.angle * 1.5) * 0.8;
            });

            // Gentle particles drift
            particles.rotation.y = elapsedTime * 0.02;
            particles.rotation.x = elapsedTime * 0.01;

            // ── MATHEMATICALLY CONTINUOUS POSITION PATH (NO JUMPS AT ALL) ──
            if (isMobile) {
                // Mobile: Stays centered with smaller scale and lower opacity so it never blocks touch or text
                coreGroup.scale.set(0.42, 0.42, 0.42);
                coreGroup.position.x = smoothMouseX * 0.3;
                // Continuous glide from top to bottom
                coreGroup.position.y = 1.0 - smoothScrollProgress * 3.6 + Math.sin(elapsedTime * 1.2) * 0.1;
                coreGroup.position.z = -2.5;
            } else {
                // Desktop:
                // Prominently placed in the right quadrant of the screen (away from the center headline text)
                // In Hero: x ≈ 3.8, y ≈ 1.2.
                // As user scrolls through the page, it glides gracefully along the right gutter with subtle sinusoidal wave
                coreGroup.scale.set(0.76, 0.76, 0.76);

                const smoothX = 3.8 + Math.sin(smoothScrollProgress * Math.PI * 2) * 0.5 + smoothMouseX * 0.4;
                const smoothY = 1.2 - smoothScrollProgress * 4.2 + Math.sin(elapsedTime * 1.2) * 0.15 + smoothMouseY * 0.3;
                const smoothZ = -0.5 + Math.cos(smoothScrollProgress * Math.PI) * 0.8;

                coreGroup.position.x = smoothX;
                coreGroup.position.y = smoothY;
                coreGroup.position.z = smoothZ;
            }

            // Tilt toward user mouse
            coreGroup.rotation.x = smoothMouseY * 0.3;
            coreGroup.rotation.y = smoothMouseX * 0.3;

            renderer.render(scene, camera);
        };

        animate();

        // ── CLEANUP ──
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            if (interactive) {
                window.removeEventListener("mousemove", handleMouseMove);
            }
            window.removeEventListener("scroll", handleScroll);

            knotGeometry.dispose();
            knotMaterial.dispose();
            innerOrbGeo.dispose();
            innerOrbMat.dispose();
            ringGeo1.dispose();
            ringMat1.dispose();
            ringGeo2.dispose();
            ringMat2.dispose();
            satGeo.dispose();
            particleGeometry.dispose();
            particleMaterial.dispose();

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
