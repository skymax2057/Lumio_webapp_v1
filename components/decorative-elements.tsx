"use client";

import { ReactNode } from "react";

/**
 * DecorativeElements - Reusable decorative components for refined UI
 * 
 * This component provides elegant decorative elements including:
 * - Golden dividers as section separators
 * - Corner decorations
 * - Pattern backgrounds
 * - Shine effects
 */

interface DividerProps {
  variant?: "gold" | "gold-thin" | "gold-fancy" | "gold-animated" | "rose" | "luxury" | "cosmic" | "aurora" | "nebula" | "plasma";
  className?: string;
}

export function GoldenDivider({ 
  variant = "gold", 
  className = "" 
}: DividerProps) {
  const variantClasses = {
    gold: "divider-gold",
    "gold-thin": "divider-gold-thin",
    "gold-fancy": "divider-gold-fancy",
    "gold-animated": "divider-gold-animated",
    rose: "divider-rose",
    luxury: "divider-luxury",
    cosmic: "divider-cosmic",
    aurora: "divider-aurora",
    nebula: "divider-nebula",
    plasma: "divider-plasma"
  };

  return <div className={`${variantClasses[variant]} ${className}`} />;
}

interface PatternBackgroundProps {
  children: ReactNode;
  variant?: "dots" | "dots-dense" | "grid" | "grid-fine" | "diagonal" | "diagonal-wide" | "circles" | "waves" | "diamonds" | "animated-dots" | "hexagon" | "moroccan" | "geometric" | "cosmic-dust" | "aurora-waves" | "liquid-flow";
  className?: string;
}

export function PatternBackground({ 
  children, 
  variant = "dots",
  className = "" 
}: PatternBackgroundProps) {
  const variantClasses = {
    dots: "pattern-dots",
    "dots-dense": "pattern-dots-dense",
    grid: "pattern-grid",
    "grid-fine": "pattern-grid-fine",
    diagonal: "pattern-diagonal",
    "diagonal-wide": "pattern-diagonal-wide",
    circles: "pattern-circles",
    waves: "pattern-waves",
    diamonds: "pattern-diamonds",
    "animated-dots": "pattern-animated-dots",
    hexagon: "pattern-hexagon",
    moroccan: "pattern-moroccan",
    geometric: "pattern-geometric",
    "cosmic-dust": "pattern-cosmic-dust",
    "aurora-waves": "pattern-aurora-waves",
    "liquid-flow": "pattern-liquid-flow"
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface CornerDecorationProps {
  children: ReactNode;
  variant?: "standard" | "gold" | "cosmic" | "aurora" | "neon" | "luxury-enhanced";
  className?: string;
}

export function CornerDecoration({ 
  children, 
  variant = "standard",
  className = "" 
}: CornerDecorationProps) {
  const variantClasses = {
    standard: "corner-decoration",
    gold: "corner-decoration-gold",
    cosmic: "corner-decoration-cosmic",
    aurora: "corner-decoration-aurora",
    neon: "corner-decoration-neon",
    "luxury-enhanced": "corner-decoration-luxury-enhanced"
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface FloatingParticlesProps {
  children: ReactNode;
  className?: string;
}

export function FloatingParticles({ children, className = "" }: FloatingParticlesProps) {
  return (
    <div className={`floating-particles ${className}`}>
      {children}
    </div>
  );
}

interface BorderBeamProps {
  children: ReactNode;
  className?: string;
}

export function BorderBeam({ children, className = "" }: BorderBeamProps) {
  return (
    <div className={`border-beam ${className}`}>
      {children}
    </div>
  );
}

interface ImageShineProps {
  children: ReactNode;
  variant?: "standard" | "gold" | "rose" | "luxury" | "radial" | "pulse" | "cosmic" | "aurora" | "nebula" | "plasma" | "liquid" | "morphing";
  className?: string;
}

export function ImageShine({ 
  children, 
  variant = "standard",
  className = "" 
}: ImageShineProps) {
  const variantClasses = {
    standard: "image-shine-effect",
    gold: "image-shine-gold",
    rose: "image-shine-rose",
    luxury: "image-shine-luxury",
    radial: "image-shine-radial",
    pulse: "image-shine-pulse",
    cosmic: "image-shine-cosmic",
    aurora: "image-shine-aurora",
    nebula: "image-shine-nebula",
    plasma: "image-shine-plasma",
    liquid: "image-shine-liquid",
    morphing: "image-shine-morphing"
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface VerticalDividerProps {
  className?: string;
}

export function VerticalGoldenDivider({ className = "" }: VerticalDividerProps) {
  return <div className={`divider-vertical-gold ${className}`} />;
}
