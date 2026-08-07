"use client";

import { ReactNode } from "react";

interface LuxurySectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "compact" | "spacious";
  withGoldenBorder?: boolean;
}

export function LuxurySectionWrapper({
  children,
  className = "",
  variant = "default",
  withGoldenBorder = true,
}: LuxurySectionWrapperProps) {
  const baseClasses = "rounded-3xl bg-lumio-card";
  
  const variantClasses = {
    default: "luxury-section",
    compact: "luxury-section-compact",
    spacious: "luxury-spacing-xl",
  };

  const borderClasses = withGoldenBorder ? "luxury-gold-border" : "";

  return (
    <section className={`${baseClasses} ${variantClasses[variant]} ${borderClasses} ${className}`}>
      {children}
    </section>
  );
}
