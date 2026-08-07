"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

interface ParticlesBackgroundProps {
  particleCount?: number;
  mouseInteraction?: boolean;
  connectionDistance?: number;
  colors?: string[];
}

export function ParticlesBackground({
  particleCount = 50,
  mouseInteraction = true,
  connectionDistance = 150,
  colors = ["#d4af37", "#c5a059", "#e5c158", "#f5f5e6"],
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number | undefined>(undefined);
  const { theme } = useTheme();

  // Reduce particle count on mobile and low-performance devices
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const adjustedParticleCount = isMobile || isReducedMotion ? Math.floor(particleCount * 0.5) : particleCount;
  const adjustedConnectionDistance = isMobile ? connectionDistance * 0.7 : connectionDistance;

  const createParticle = useCallback((width: number, height: number): Particle => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    };
  }, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Recreate particles on resize
      particlesRef.current = [];
      for (let i = 0; i < adjustedParticleCount; i++) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height));
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      const isDark = theme === "dark";
      const globalAlpha = isDark ? 0.6 : 0.3;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse interaction
        if (mouseInteraction) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const interactionRadius = 200;

          if (distance < interactionRadius) {
            const force = (interactionRadius - distance) / interactionRadius;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force * 0.02;
            p.vy -= Math.sin(angle) * force * 0.02;
          }
        }

        // Update pulse
        p.pulse += p.pulseSpeed;
        const pulseOpacity = (Math.sin(p.pulse) + 1) / 2;

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = globalAlpha * p.opacity * (0.5 + pulseOpacity * 0.5);
        
        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = globalAlpha * p.opacity * (0.8 + pulseOpacity * 0.2);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw connections
      if (adjustedConnectionDistance > 0) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < adjustedConnectionDistance) {
              const alpha = (1 - distance / adjustedConnectionDistance) * globalAlpha * 0.15;
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.strokeStyle = p1.color;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, mouseInteraction, connectionDistance, colors, theme, createParticle]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}