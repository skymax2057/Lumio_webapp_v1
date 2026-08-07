"use client";

import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { GlowEffect } from "./glow-effect";

interface PremiumLikeButtonProps {
  initialLiked?: boolean;
  initialCount?: number;
  onLikeChange?: (liked: boolean) => void;
  variant?: "cosmic" | "aurora" | "nebula" | "plasma";
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function PremiumLikeButton({
  initialLiked = false,
  initialCount = 0,
  onLikeChange,
  variant = "cosmic",
  size = "md",
  showCount = true,
  className = "",
}: PremiumLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = () => {
    setIsAnimating(true);
    const newLikedState = !liked;
    setLiked(newLikedState);
    setCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLikeChange?.(newLikedState);
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const glowVariant = variant === "cosmic" ? "multi-layer" : 
                     variant === "aurora" ? "aurora" : 
                     variant === "nebula" ? "inner" : "multi-layer";

  return (
    <GlowEffect variant={glowVariant}>
      <button
        onClick={handleLike}
        className={`
          relative overflow-hidden rounded-full
          glass-premium border transition-all duration-300
          flex items-center gap-2 font-medium
          ${liked 
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-glow-rose' 
            : 'bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/50'
          }
          ${isAnimating ? 'scale-110' : 'hover:scale-105'}
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {/* Sparkle particles on like */}
        {isAnimating && liked && (
          <>
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-ping" />
            <Sparkles className="absolute -bottom-1 -left-1 w-2 h-2 text-pink-400 animate-ping" style={{ animationDelay: '0.1s' }} />
          </>
        )}
        
        <Heart 
          className={`${iconSizes[size]} transition-all duration-300 ${
            liked ? 'fill-current scale-110' : 'scale-100'
          } ${isAnimating && liked ? 'animate-pulse' : ''}`}
        />
        
        {showCount && (
          <span className="font-semibold tabular-nums">
            {count > 0 ? count : ''}
          </span>
        )}
      </button>
    </GlowEffect>
  );
}
