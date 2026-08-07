"use client";

import React, { ReactNode, useRef, useState, cloneElement } from "react";
import { GlowEffect } from "../glow-effect";

interface GoldenRippleButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  disabled?: boolean;
  enhanced?: boolean;
  type?: "button" | "submit" | "reset";
  asChild?: boolean;
  variant?: "cosmic" | "aurora" | "nebula" | "plasma";
  glowEnabled?: boolean;
}

export function GoldenRippleButton({
  children,
  onClick,
  className = "",
  disabled = false,
  enhanced = false,
  type = "button",
  asChild = false,
  variant = "cosmic",
  glowEnabled = true,
}: GoldenRippleButtonProps) {
  const buttonRef = useRef<HTMLElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  const baseClasses = "touch-press-effect relative overflow-hidden";
  const enhancedClasses = enhanced ? "touch-press-effect-enhanced" : "";
  const combinedClasses = `${baseClasses} ${enhancedClasses} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

  const glowVariant = variant === "cosmic" ? "multi-layer" : 
                     variant === "aurora" ? "aurora" : 
                     variant === "nebula" ? "inner" : "multi-layer";

  const rippleElements = ripples.map((ripple) => (
    <span
      key={ripple.id}
      className="golden-ripple"
      style={{
        left: `${ripple.x}px`,
        top: `${ripple.y}px`,
        width: '20px',
        height: '20px',
        marginLeft: '-10px',
        marginTop: '-10px',
      }}
    />
  ));

  const buttonContent = (
    <>
      {children}
      {rippleElements}
    </>
  );

  if (asChild) {
    const child = Array.isArray(children) ? children[0] : children;
    if (React.isValidElement(child)) {
      const childProps = child.props as any;
      return cloneElement(child, {
        ref: buttonRef,
        onClick: handleClick,
        className: `${combinedClasses} ${childProps.className || ""}`,
        children: (
          <>
            {childProps.children}
            {rippleElements}
          </>
        ),
      } as any);
    }
  }

  const ButtonComponent = (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {buttonContent}
    </button>
  );

  if (glowEnabled && !disabled) {
    return (
      <GlowEffect variant={glowVariant}>
        {ButtonComponent}
      </GlowEffect>
    );
  }

  return ButtonComponent;
}
