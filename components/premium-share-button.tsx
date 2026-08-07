"use client";

import { useState } from "react";
import { Share2, Link2, Twitter, Facebook, Mail, Copy, Check } from "lucide-react";
import { GlowEffect } from "./glow-effect";

interface PremiumShareButtonProps {
  url?: string;
  title?: string;
  variant?: "cosmic" | "aurora" | "nebula" | "plasma";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PremiumShareButton({
  url = typeof window !== 'undefined' ? window.location.href : "",
  title = "Découvrez cette œuvre sur Lumio",
  variant = "cosmic",
  size = "md",
  className = "",
}: PremiumShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const shareOptions = [
    {
      name: "Twitter",
      icon: Twitter,
      color: "text-blue-400 hover:text-blue-300",
      bg: "hover:bg-blue-500/20",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600 hover:text-blue-500",
      bg: "hover:bg-blue-600/20",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      name: "Email",
      icon: Mail,
      color: "text-violet-400 hover:text-violet-300",
      bg: "hover:bg-violet-500/20",
      action: () => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      name: "Copy Link",
      icon: copied ? Check : Copy,
      color: copied ? "text-green-400" : "text-violet-400 hover:text-violet-300",
      bg: "hover:bg-violet-500/20",
      action: handleCopyLink,
    },
  ];

  return (
    <div className="relative">
      <GlowEffect variant={glowVariant}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative overflow-hidden rounded-full
            glass-premium border transition-all duration-300
            flex items-center gap-2 font-medium
            bg-violet-500/10 border-violet-500/30 text-violet-400
            hover:bg-violet-500/20 hover:border-violet-500/50
            hover:scale-105
            ${sizeClasses[size]}
            ${className}
          `}
        >
          <Share2 className={iconSizes[size]} />
          <span>Partager</span>
        </button>
      </GlowEffect>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full mb-2 right-0 bg-card/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-glow-gold p-2 z-20 min-w-[200px]">
            <div className="grid grid-cols-2 gap-2">
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-xl
                    transition-all duration-300
                    ${option.color} ${option.bg}
                    hover:scale-105
                  `}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
