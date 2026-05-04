"use client";

import { useEffect, useRef } from "react";

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; radius: number; vx: number; vy: number; color: string }[] = [];
    const colors = ["#FFFFFF", "#A855F7", "#3B82F6", "#F472B6"]; // Cosmic colors

    for (let i = 0; i < 250; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space nebula effect
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
      gradient.addColorStop(0, "rgba(10, 5, 20, 0.4)"); // Very dark purple/black center
      gradient.addColorStop(1, "rgba(2, 2, 5, 0.95)");  // Almost pure black edges
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        
        // Add subtle glow to larger stars
        if (star.radius > 1) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = star.color;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();

        // Parallax movement
        star.x += star.vx / 100;
        star.y += star.vy / 100;

        if (star.x < 0 || star.x > width) star.vx = -star.vx;
        if (star.y < 0 || star.y > height) star.vy = -star.vy;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-50 bg-[#090A0F] pointer-events-none">
        <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
