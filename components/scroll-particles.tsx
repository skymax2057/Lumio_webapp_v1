"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

interface ScrollParticle {
  x: number;
  y: number;
  baseY: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  scrollFactor: number;
}

interface ScrollParticlesProps {
  particleCount?: number;
  intensity?: "subtle" | "medium" | "intense";
  className?: string;
}

export function ScrollParticles({
  particleCount = 40,
  intensity = "medium",
  className = "",
}: ScrollParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ScrollParticle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const { theme } = useTheme();
  const scrollYRef = useRef(0);

  const intensityConfig = {
    subtle: { speed: 0.3, opacity: 0.4, scrollInfluence: 0.5 },
    medium: { speed: 0.5, opacity: 0.6, scrollInfluence: 1.0 },
    intense: { speed: 0.7, opacity: 0.8, scrollInfluence: 1.5 },
  };

  const config = intensityConfig[intensity];
  const colors = ["#d4af37", "#c5a059", "#e5c158", "#f5f5e6", "#fff7cc"];

  const createParticle = useCallback((width: number, height: number): ScrollParticle => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      baseY: Math.random() * height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * config.speed + 0.2,
      opacity: Math.random() * config.opacity + 0.2,
      color,
      scrollFactor: Math.random() * config.scrollInfluence + 0.5,
    };
  }, [config, colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      
      // Recreate particles on resize
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height));
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // Handle scroll
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const isDark = theme === "dark";
      const globalAlpha = isDark ? 0.8 : 0.5;
      const scrollOffset = scrollYRef.current * 0.5;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position with scroll influence
        p.y = p.baseY - (scrollOffset * p.scrollFactor);
        
        // Wrap around vertically
        if (p.y < -10) {
          p.baseY = canvas.height + 10;
          p.y = p.baseY - (scrollOffset * p.scrollFactor);
        } else if (p.y > canvas.height + 10) {
          p.baseY = -10;
          p.y = p.baseY - (scrollOffset * p.scrollFactor);
        }

        // Gentle horizontal movement
        p.x += Math.sin(Date.now() * 0.001 + i) * 0.3;

        // Wrap horizontally
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        // Calculate size based on scroll position
        const sizeMultiplier = 1 + Math.sin(scrollOffset * 0.01 + i) * 0.3;
        const currentSize = p.size * sizeMultiplier;

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = globalAlpha * p.opacity;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 3);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = globalAlpha * p.opacity * 0.8;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const alpha = (1 - distance / 100) * globalAlpha * 0.2;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = p1.color;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, config, theme, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
}