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

        // Scene, Camera, Renderer
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
        renderer.toneMappingExposure = 1.2;

        const canvas = renderer.domElement;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "1";
        container.appendChild(canvas);

        // ── 3D BERAXIS CORE GROUP ──
        const coreGroup = new THREE.Group();
        scene.add(coreGroup);

        // 1. Faceted Crystalline Core (Icosahedron)
        const coreGeometry = new THREE.IcosahedronGeometry(1.8, 1);
        const coreMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0x3b0764),
            emissive: new THREE.Color(0x1e1b4b),
            emissiveIntensity: 0.6,
            roughness: 0.15,
            metalness: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            wireframe: false,
            transparent: true,
            opacity: 0.92
        });
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        coreGroup.add(coreMesh);

        // 2. Outer Geometric Wireframe Lattice
        const wireGeometry = new THREE.IcosahedronGeometry(2.1, 1);
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xa855f7),
            wireframe: true,
            transparent: true,
            opacity: 0.55
        });
        const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
        coreGroup.add(wireMesh);

        // 3. Inner Quantum Prism
        const prismGeometry = new THREE.OctahedronGeometry(1.2, 0);
        const prismMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x06b6d4),
            emissive: new THREE.Color(0x0284c7),
            emissiveIntensity: 0.8,
            roughness: 0.3,
            metalness: 0.8,
            wireframe: false
        });
        const prismMesh = new THREE.Mesh(prismGeometry, prismMaterial);
        coreGroup.add(prismMesh);

        // 4. Orbital Rings (Representing 28 Interconnected ERP Modules)
        const ring1Geo = new THREE.TorusGeometry(2.9, 0.025, 16, 100);
        const ring1Mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xec4899),
            emissive: new THREE.Color(0xbe185d),
            emissiveIntensity: 0.8,
            roughness: 0.2
        });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.rotation.x = Math.PI / 3;
        ring1.rotation.y = Math.PI / 6;
        coreGroup.add(ring1);

        const ring2Geo = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
        const ring2Mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x06b6d4),
            emissive: new THREE.Color(0x0891b2),
            emissiveIntensity: 0.8,
            roughness: 0.2
        });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.x = -Math.PI / 4;
        ring2.rotation.z = Math.PI / 5;
        coreGroup.add(ring2);

        // 5. Orbiting Node Satellites (Apps / Modules)
        const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const nodeMatCyan = new THREE.MeshStandardMaterial({
            color: 0x22d3ee,
            emissive: 0x06b6d4,
            emissiveIntensity: 1.2
        });
        const nodeMatPink = new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            emissive: 0xec4899,
            emissiveIntensity: 1.2
        });
        const nodeMatAmber = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            emissive: 0xf59e0b,
            emissiveIntensity: 1.2
        });

        const satellites: { mesh: THREE.Mesh; ring: number; angle: number; speed: number }[] = [];
        const nodeMaterials = [nodeMatCyan, nodeMatPink, nodeMatAmber];

        for (let i = 0; i < 6; i++) {
            const mesh = new THREE.Mesh(nodeGeo, nodeMaterials[i % 3]);
            coreGroup.add(mesh);
            satellites.push({
                mesh,
                ring: i % 2 === 0 ? 2.9 : 3.5,
                angle: (i * Math.PI) / 3,
                speed: 0.008 + (i % 3) * 0.004
            });
        }

        // 6. Cosmic Starfield Dust
        const particleCount = 140;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const palette = [
            new THREE.Color(0x8b5cf6),
            new THREE.Color(0xec4899),
            new THREE.Color(0x06b6d4),
            new THREE.Color(0xf59e0b)
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 18;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.06,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // ── LIGHTING ──
        const ambientLight = new THREE.AmbientLight(0x18182f, 2.0);
        scene.add(ambientLight);

        const purpleLight = new THREE.PointLight(0xa855f7, 5, 20);
        purpleLight.position.set(4, 4, 5);
        scene.add(purpleLight);

        const cyanLight = new THREE.PointLight(0x06b6d4, 4, 20);
        cyanLight.position.set(-5, -3, 4);
        scene.add(cyanLight);

        const amberLight = new THREE.PointLight(0xf59e0b, 3, 15);
        amberLight.position.set(0, 5, -3);
        scene.add(amberLight);

        // ── SCROLL & RESIZE & MOUSE INTERACTION ──
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;
        let scrollY = 0;
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
            scrollY = window.scrollY || window.pageYOffset;
        };

        window.addEventListener("resize", handleResize);
        if (interactive) {
            window.addEventListener("mousemove", handleMouseMove);
        }
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        // ── ANIMATION LOOP ──
        let animationFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Smooth mouse follow
            targetX += (mouseX - targetX) * 0.05;
            targetY += (mouseY - targetY) * 0.05;

            // Rotation
            coreMesh.rotation.x = elapsedTime * 0.25;
            coreMesh.rotation.y = elapsedTime * 0.35;

            wireMesh.rotation.x = -elapsedTime * 0.2;
            wireMesh.rotation.y = elapsedTime * 0.3;

            prismMesh.rotation.x = elapsedTime * 0.4;
            prismMesh.rotation.z = -elapsedTime * 0.5;

            ring1.rotation.z = elapsedTime * 0.2;
            ring2.rotation.z = -elapsedTime * 0.15;

            // Satellites orbiting
            satellites.forEach((sat, idx) => {
                sat.angle += sat.speed;
                const r = sat.ring;
                if (idx % 2 === 0) {
                    sat.mesh.position.x = Math.cos(sat.angle) * r;
                    sat.mesh.position.y = Math.sin(sat.angle) * r * Math.sin(ring1.rotation.x);
                    sat.mesh.position.z = Math.sin(sat.angle) * r * Math.cos(ring1.rotation.x);
                } else {
                    sat.mesh.position.x = Math.cos(sat.angle) * r * Math.cos(ring2.rotation.z);
                    sat.mesh.position.y = Math.sin(sat.angle) * r;
                    sat.mesh.position.z = Math.cos(sat.angle) * r * Math.sin(ring2.rotation.z);
                }
            });

            // Ambient particle drift
            particles.rotation.y = elapsedTime * 0.03;
            particles.rotation.x = elapsedTime * 0.015;

            // ── DYNAMIC SCROLL POSITIONING THROUGHOUT MAIN PAGE ──
            const totalScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const scrollFraction = Math.min(1, Math.max(0, scrollY / totalScroll));

            // In Hero: Center-right or centered floating
            // As user scrolls down: Orbits gracefully across sections to the side, then aligns near footer
            if (isMobile) {
                // Mobile: stays neatly backgrounded, smaller scale, never blocks interaction
                coreGroup.scale.set(0.48, 0.48, 0.48);
                coreGroup.position.x = targetX * 0.4;
                // Move gently down as page scrolls
                coreGroup.position.y = 1.2 - scrollFraction * 4.0 + Math.sin(elapsedTime * 1.5) * 0.15;
                coreGroup.position.z = -2;
            } else {
                // Desktop: Fluid cinematic choreography down the entire page
                coreGroup.scale.set(0.72, 0.72, 0.72);
                
                // Sinusoidal horizontal glide between left & right margins as user scrolls down
                const horizontalSway = Math.sin(scrollFraction * Math.PI * 3) * 2.8;
                coreGroup.position.x = (scrollFraction < 0.08 ? 3.4 : horizontalSway) + targetX * 0.6;
                
                // Vertical progression tracking scroll
                coreGroup.position.y = 1.6 - scrollFraction * 4.5 + Math.sin(elapsedTime * 1.5) * 0.2;
                coreGroup.position.z = -1 + Math.cos(scrollFraction * Math.PI * 2) * 1.2;
            }

            // Tilt to cursor
            coreGroup.rotation.x = targetY * 0.4;
            coreGroup.rotation.y = targetX * 0.4;

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

            // Dispose geometries and materials
            coreGeometry.dispose();
            coreMaterial.dispose();
            wireGeometry.dispose();
            wireMaterial.dispose();
            prismGeometry.dispose();
            prismMaterial.dispose();
            ring1Geo.dispose();
            ring1Mat.dispose();
            ring2Geo.dispose();
            ring2Mat.dispose();
            nodeGeo.dispose();
            nodeMatCyan.dispose();
            nodeMatPink.dispose();
            nodeMatAmber.dispose();
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
