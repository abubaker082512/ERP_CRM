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

        // Detect mobile & low-power devices
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

        // ── 1. SCENE, CAMERA, RENDERER ──
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 24;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: "low-power",
            precision: "lowp",
            depth: false,
            stencil: false
        });
        // Render at 1.0 DPR (eliminates 4K/Retina GPU compositor stalls and saves 60%+ fill-rate)
        renderer.setPixelRatio(1);
        renderer.setSize(window.innerWidth, window.innerHeight);

        const canvas = renderer.domElement;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "0";
        canvas.style.transform = "translateZ(0)";
        canvas.style.contain = "strict";
        container.appendChild(canvas);

        // ── 2. COSMIC ROTATING PARTICLE GALAXY ──
        const galaxyGroup = new THREE.Group();
        scene.add(galaxyGroup);

        // Circular glow point sprite (cached once)
        const createStarTexture = () => {
            const size = 32; // Optimized from 64 to 32 (sharp enough for particles, 4x smaller GPU texture)
            const c = document.createElement("canvas");
            c.width = size;
            c.height = size;
            const ctx = c.getContext("2d");
            if (!ctx) return new THREE.Texture();

            ctx.clearRect(0, 0, size, size);

            const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.25, "rgba(220, 200, 255, 0.85)");
            gradient.addColorStop(0.6, "rgba(139, 92, 246, 0.3)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
            ctx.fill();

            const texture = new THREE.CanvasTexture(c);
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
            return texture;
        };

        const starTexture = createStarTexture();

        // Optimized particle counts: 180 on desktop, 80 on mobile (looks lush and deep without bogging the GPU)
        const particleCount1 = isMobile ? 80 : 180;
        const geo1 = new THREE.BufferGeometry();
        const pos1 = new Float32Array(particleCount1 * 3);
        const col1 = new Float32Array(particleCount1 * 3);

        const palette = [
            new THREE.Color(0xa855f7), // Cosmic Purple
            new THREE.Color(0xec4899), // Neon Pink
            new THREE.Color(0x06b6d4), // Cyan
            new THREE.Color(0x38bdf8), // Sky Blue
            new THREE.Color(0xf59e0b)  // Warm Amber
        ];

        for (let i = 0; i < particleCount1; i++) {
            const radius = 3 + Math.random() * 22;
            const spinAngle = radius * 0.4;
            const branchAngle = ((i % 3) * (2 * Math.PI)) / 3;
            const angle = branchAngle + spinAngle + (Math.random() - 0.5) * 0.5;

            pos1[i * 3] = Math.cos(angle) * radius;
            pos1[i * 3 + 1] = (Math.random() - 0.5) * (6 + radius * 0.25);
            pos1[i * 3 + 2] = Math.sin(angle) * radius;

            const c = palette[Math.floor(Math.random() * palette.length)];
            col1[i * 3] = c.r;
            col1[i * 3 + 1] = c.g;
            col1[i * 3 + 2] = c.b;
        }

        geo1.setAttribute("position", new THREE.BufferAttribute(pos1, 3));
        geo1.setAttribute("color", new THREE.BufferAttribute(col1, 3));

        const mat1 = new THREE.PointsMaterial({
            size: isMobile ? 0.32 : 0.38,
            map: starTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const galaxyParticles = new THREE.Points(geo1, mat1);
        galaxyGroup.add(galaxyParticles);

        // Layer 2: Subtle Deep Space Ambient Nebula Dust (90 on desktop, 40 on mobile)
        const particleCount2 = isMobile ? 40 : 90;
        const geo2 = new THREE.BufferGeometry();
        const pos2 = new Float32Array(particleCount2 * 3);
        const col2 = new Float32Array(particleCount2 * 3);

        for (let i = 0; i < particleCount2; i++) {
            pos2[i * 3] = (Math.random() - 0.5) * 45;
            pos2[i * 3 + 1] = (Math.random() - 0.5) * 35;
            pos2[i * 3 + 2] = (Math.random() - 0.5) * 25;

            const c = palette[Math.floor(Math.random() * palette.length)];
            col2[i * 3] = c.r;
            col2[i * 3 + 1] = c.g;
            col2[i * 3 + 2] = c.b;
        }

        geo2.setAttribute("position", new THREE.BufferAttribute(pos2, 3));
        geo2.setAttribute("color", new THREE.BufferAttribute(col2, 3));

        const mat2 = new THREE.PointsMaterial({
            size: isMobile ? 0.22 : 0.25,
            map: starTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const ambientParticles = new THREE.Points(geo2, mat2);
        galaxyGroup.add(ambientParticles);

        // ── 3. INTERACTIVE MOUSE PARALLAX & RESIZE (THROTTLED) ──
        let mouseX = 0;
        let mouseY = 0;
        let smoothMouseX = 0;
        let smoothMouseY = 0;

        let resizeTimer: ReturnType<typeof setTimeout> | null = null;
        const handleResize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const width = window.innerWidth;
                const height = window.innerHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }, 100);
        };

        let lastPointerTime = 0;
        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            const now = performance.now();
            if (now - lastPointerTime < 32) return; // Cap mouse tracking to 30Hz
            lastPointerTime = now;

            let clientX = 0;
            let clientY = 0;
            if ("touches" in e && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if ("clientX" in e) {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            mouseX = (clientX / window.innerWidth) * 2 - 1;
            mouseY = -(clientY / window.innerHeight) * 2 + 1;
        };

        // ── 4. SCROLL PAUSE (CRUCIAL PERFORMANCE FIX) ──
        // When user is actively scrolling, WebGL rendering pauses so the browser has 100% of GPU resources
        let isScrolling = false;
        let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
        const handleScroll = () => {
            isScrolling = true;
            if (scrollEndTimer) clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(() => {
                isScrolling = false;
            }, 120);
        };

        window.addEventListener("resize", handleResize, { passive: true });
        window.addEventListener("scroll", handleScroll, { passive: true });

        if (interactive && !isMobile) {
            window.addEventListener("pointermove", handlePointerMove, { passive: true });
        }

        // ── 5. 30 FPS CAPPED ANIMATION LOOP ──
        let animationFrameId: number;
        const clock = new THREE.Clock();
        let isVisible = !document.hidden;

        const handleVisibilityChange = () => {
            isVisible = !document.hidden;
            if (isVisible) {
                clock.start();
            } else {
                clock.stop();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });

        // 30 FPS frame throttle: Ambient background particles do not need 120 FPS
        const targetFrameInterval = 1000 / 30; // 33.3ms per frame
        let lastFrameTime = performance.now();

        const animate = (currentTime: number) => {
            animationFrameId = requestAnimationFrame(animate);

            if (!isVisible || isScrolling) return;

            const elapsedSinceLast = currentTime - lastFrameTime;
            if (elapsedSinceLast < targetFrameInterval) return;

            lastFrameTime = currentTime - (elapsedSinceLast % targetFrameInterval);

            const elapsedTime = clock.getElapsedTime();

            // Smooth parallax response to mouse cursor
            smoothMouseX += (mouseX - smoothMouseX) * 0.04;
            smoothMouseY += (mouseY - smoothMouseY) * 0.04;

            // Organic, hypnotic continuous galaxy rotation
            galaxyParticles.rotation.y = elapsedTime * 0.035;
            galaxyParticles.rotation.x = Math.sin(elapsedTime * 0.015) * 0.12;

            ambientParticles.rotation.y = -elapsedTime * 0.018;

            // Gentle camera parallax giving 3D depth to the background
            camera.position.x = smoothMouseX * 1.2;
            camera.position.y = smoothMouseY * 1.0;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animationFrameId = requestAnimationFrame(animate);

        // ── 6. CLEANUP ──
        return () => {
            cancelAnimationFrame(animationFrameId);
            if (resizeTimer) clearTimeout(resizeTimer);
            if (scrollEndTimer) clearTimeout(scrollEndTimer);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (interactive && !isMobile) {
                window.removeEventListener("pointermove", handlePointerMove);
            }

            geo1.dispose();
            mat1.dispose();
            geo2.dispose();
            mat2.dispose();
            starTexture.dispose();

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
            style={{ zIndex: 0 }}
            aria-hidden="true"
        />
    );
}
