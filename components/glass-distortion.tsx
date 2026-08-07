"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface GlassDistortionProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  borderRadius?: number;
}

export function GlassDistortion({
  children,
  className = "",
  intensity = 15,
  borderRadius = 24,
}: GlassDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  const rotateX = useTransform(springY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-intensity, intensity]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;
    
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };
  
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };
  
  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        borderRadius: borderRadius,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? rotateX.get() : 0,
        rotateY: isHovered ? rotateY.get() : 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 25,
        mass: 0.5,
      }}
    >
      {/* Glass effect overlay */}
      <div
        className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none"
        style={{
          borderRadius: borderRadius,
          background: isHovered
            ? `radial-gradient(
                circle at ${50 + (mouseX.get() * 50)}% ${50 + (mouseY.get() * 50)}%,
                rgba(255, 255, 255, 0.1) 0%,
                transparent 50%
              )`
            : "transparent",
          transition: "background 0.3s ease",
        }}
      />
      
      {/* Glare effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: borderRadius,
          background: isHovered
            ? `radial-gradient(
                ellipse at ${50 + (mouseX.get() * 30)}% ${50 + (mouseY.get() * 30)}%,
                rgba(212, 175, 55, 0.15) 0%,
                transparent 60%
              )`
            : "transparent",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
      
      {/* Border glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: borderRadius,
          boxShadow: isHovered
            ? `0 0 30px rgba(212, 175, 55, 0.2), inset 0 0 30px rgba(212, 175, 55, 0.05)`
            : "none",
          transition: "box-shadow 0.3s ease",
        }}
      />
      
      {children}
    </motion.div>
  );
}

// Holographic variant
interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HolographicCard({ children, className = "" }: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x / rect.width);
    mouseY.set(y / rect.height);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Holographic gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isHovered
            ? `
              linear-gradient(
                ${45 + mouseX.get() * 90}deg,
                transparent 0%,
                rgba(212, 175, 55, 0.1) 25%,
                rgba(147, 51, 234, 0.1) 50%,
                rgba(56, 189, 248, 0.1) 75%,
                transparent 100%
              )
            `
            : "transparent",
          transition: "background 0.5s ease",
        }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            115deg,
            transparent 0%,
            transparent 45%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 55%,
            transparent 100%
          )`,
          x: isHovered ? "-100%" : "200%",
        }}
        animate={{
          x: isHovered ? "200%" : "-100%",
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 2,
        }}
      />
      
      {children}
    </motion.div>
  );
}