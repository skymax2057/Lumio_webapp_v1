"use client";

import { ReactNode } from "react";

interface MorphingContainerProps {
  children: ReactNode;
  variant?: "shape" | "liquid";
  className?: string;
}

export function MorphingContainer({ children, variant = "shape", className = "" }: MorphingContainerProps) {
  const morphClass = variant === "shape" ? "morph-shape" : "liquid-morph";
  
  return (
    <div className={`morphing-container ${morphClass} ${className}`}>
      {children}
    </div>
  );
}
