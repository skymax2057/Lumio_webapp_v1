"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface AtmosphericFogProps {
  intensity?: "subtle" | "medium" | "intense";
  color?: "violet" | "blue" | "indigo";
  className?: string;
}

export function AtmosphericFog({ 
  intensity = "medium", 
  color = "violet",
  className = "" 
}: AtmosphericFogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const animationRef = useRef<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const intensityConfig = {
    subtle: { opacity: 0.3, speed: 0.2, particleCount: 30 },
    medium: { opacity: 0.5, speed: 0.4, particleCount: 60 },
    intense: { opacity: 0.7, speed: 0.6, particleCount: 100 },
  };

  const colorConfig = {
    violet: ["rgba(99, 102, 241,", "rgba(129, 140, 248,", "rgba(79, 70, 229,"],
    blue: ["rgba(59, 130, 246,", "rgba(96, 165, 250,", "rgba(37, 99, 235,"],
    indigo: ["rgba(79, 70, 229,", "rgba(99, 102, 241,", "rgba(67, 56, 202,"],
  };

  const config = intensityConfig[intensity];
  const colors = colorConfig[color];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Safety check for config and colors
    if (!config || !colors || !colors.length) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Fog particles
    interface FogParticle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }

    const particles: FogParticle[] = [];

    for (let i = 0; i < config.particleCount; i++) {
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 100 + 50,
        speedX: (Math.random() - 0.5) * config.speed,
        speedY: (Math.random() - 0.5) * config.speed * 0.5,
        opacity: Math.random() * config.opacity,
        color: colorBase,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = theme === "dark";
      const globalAlpha = isDark ? 1 : 0.6;

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
        if (particle.x > canvas.width + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = canvas.height + particle.size;
        if (particle.y > canvas.height + particle.size) particle.y = -particle.size;

        // Draw fog particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );

        gradient.addColorStop(0, `${particle.color} ${particle.opacity * globalAlpha})`);
        gradient.addColorStop(0.5, `${particle.color} ${particle.opacity * globalAlpha * 0.5})`);
        gradient.addColorStop(1, `${particle.color} 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config, colors, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{ mixBlendMode: mounted ? (theme === "dark" ? "screen" : "multiply") : "screen" }}
    />
  );
}