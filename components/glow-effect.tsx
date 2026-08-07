"use client";

import { ReactNode } from "react";

interface GlowEffectProps {
  children: ReactNode;
  variant?: "multi-layer" | "aurora" | "inner";
  className?: string;
}

export function GlowEffect({ children, variant = "multi-layer", className = "" }: GlowEffectProps) {
  const glowClass = variant === "multi-layer" ? "glow-multi-layer" : 
                   variant === "aurora" ? "glow-aurora" : "glow-inner-pulse";
  
  return (
    <div className={`glow-effect ${glowClass} ${className}`}>
      {children}
    </div>
  );
}
