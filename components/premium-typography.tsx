"use client";

import { ReactNode } from "react";

/**
 * PremiumTypography - Reusable premium typography components
 * 
 * This component provides easy-to-use typography elements with
 * sophisticated golden effects, letter spacing, and shimmer animations.
 */

interface PremiumTitleProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "shimmer";
  size?: "sm" | "md" | "lg" | "xl";
}

export function PremiumTitle({ 
  children, 
  className = "", 
  variant = "default",
  size = "md" 
}: PremiumTitleProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  };

  const variantClasses = {
    default: "title-premium",
    gradient: "title-premium-gradient",
    shimmer: "title-premium shimmer-luxury"
  };

  return (
    <h2 className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </h2>
  );
}

interface PremiumSubtitleProps {
  children: ReactNode;
  className?: string;
}

export function PremiumSubtitle({ children, className = "" }: PremiumSubtitleProps) {
  return (
    <p className={`subtitle-luxury ${className}`}>
      {children}
    </p>
  );
}

interface GoldenTextProps {
  children: ReactNode;
  className?: string;
  intensity?: "subtle" | "medium" | "intense";
  glow?: boolean;
}

export function GoldenText({ 
  children, 
  className = "", 
  intensity = "medium",
  glow = false 
}: GoldenTextProps) {
  const intensityClasses = {
    subtle: "text-gold-subtle",
    medium: "text-gold-medium",
    intense: "text-gold-intense"
  };

  const glowClass = glow ? "gold-glow-text" : "";

  return (
    <span className={`${intensityClasses[intensity]} ${glowClass} ${className}`}>
      {children}
    </span>
  );
}

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
  variant?: "subtle" | "luxury" | "intense" | "rose-gold";
}

export function ShimmerText({ 
  children, 
  className = "", 
  variant = "luxury" 
}: ShimmerTextProps) {
  const variantClasses = {
    subtle: "shimmer-subtle",
    luxury: "shimmer-luxury",
    intense: "shimmer-intense",
    "rose-gold": "text-rose-gold"
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: "gold" | "gold-animated" | "metallic" | "rose-gold";
}

export function GradientText({ 
  children, 
  className = "", 
  variant = "gold" 
}: GradientTextProps) {
  const variantClasses = {
    gold: "text-gold-gradient",
    "gold-animated": "text-gold-gradient-animated",
    metallic: "text-metallic-gold",
    "rose-gold": "text-rose-gold"
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface LuxuryLinkProps {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function LuxuryLink({ 
  children, 
  href, 
  className = "",
  onClick 
}: LuxuryLinkProps) {
  const LinkComponent = href ? "a" : "button";
  
  return (
    <LinkComponent
      href={href}
      onClick={onClick}
      className={`text-underline-gold transition-all hover:opacity-80 ${className}`}
    >
      {children}
    </LinkComponent>
  );
}

interface LetterSpacedTextProps {
  children: ReactNode;
  className?: string;
  spacing?: "tight" | "normal" | "wide" | "wider" | "extrawide";
}

export function LetterSpacedText({ 
  children, 
  className = "", 
  spacing = "normal" 
}: LetterSpacedTextProps) {
  const spacingClasses = {
    tight: "luxury-tracking-tight",
    normal: "luxury-tracking",
    wide: "luxury-tracking-wide",
    wider: "luxury-tracking-wider",
    extrawide: "luxury-tracking-extrawide"
  };

  return (
    <span className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </span>
  );
}
