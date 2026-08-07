"use client";

import { ImageItem, useLumioStore } from "@/lib/store";
import { ReactionsBar } from "@/components/reactions-bar";
import { Heart, Maximize2, Sparkles, Waves } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMicroInteractions } from "@/components/micro-interactions";

interface ImageCardProps {
  image: ImageItem;
  queue: ImageItem[];
}

export function ImageCard({ image, queue }: ImageCardProps) {
  const { data: session } = useSession();
  const {
    openFocusMode,
    openVisualEcho,
    likedImagesMap,
    setOptimisticLike,
    softGlowEnabled,
  } = useLumioStore();

  const { showNotification, triggerHapticFeedback, playSound } = useMicroInteractions();

  const [isHovered, setIsHovered] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const currentLikeState = likedImagesMap[image.id] || {
    liked: !!image.isLikedByCurrentUser,
    count: image._count?.likes ?? 0,
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!session) {
      showNotification("🔐 Connectez-vous pour liker cette œuvre", "warning");
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const nextLiked = !currentLikeState.liked;
    const countChange = nextLiked ? 1 : -1;

    // Trigger gold particle animation on like
    if (nextLiked) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
      showNotification("❤️ Ajouté aux favoris", "like");
      triggerHapticFeedback();
      playSound("like");
    }

    setOptimisticLike(image.id, nextLiked, countChange);

    try {
      await fetch(`/api/images/${image.id}/like`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Like action failed:", error);
      setOptimisticLike(image.id, !nextLiked, -countChange);
    } finally {
      setIsLiking(false);
    }
  };

  const paletteColors: string[] = (() => {
    try {
      return JSON.parse(image.palette);
    } catch {
      return [image.dominantColor, "#D4AF37", "#252530"];
    }
  })();

  return (
    <div className="image-card-container group relative">
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-card">
          <Image
            src={image.url}
            alt={image.title}
            width={image.width || 1200}
            height={image.height || 900}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            placeholder="blur"
            blurDataURL={image.dominantColor}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick Actions Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleLikeClick}
              disabled={isLiking}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-violet-500 hover:border-violet-500 transition-all disabled:opacity-50"
            >
              <Heart
                className={`w-4 h-4 ${currentLikeState.liked ? "fill-violet-400 text-violet-400" : ""}`}
              />
            </button>
          </div>

          {/* Category Badge */}
          {image.category && (
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-3 py-1.5 rounded-full bg-violet-500/90 backdrop-blur-md text-white text-xs font-medium">
                {image.category.name}
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-violet-400 transition-colors">
            {image.title}
          </h3>

          {/* Author */}
          <div className="flex items-center gap-2">
            <img
              src={image.user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
              alt={image.user.name || "Auteur"}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-muted-foreground truncate">
              {image.user.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{currentLikeState.count}</span>
            </div>
          </div>
        </div>

        {/* Focus Mode Button */}
        <button
          onClick={() => openFocusMode(image, queue)}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Focus mode"
        />
      </div>

      {/* Particle Animation */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-violet-500"
              style={{
                left: "50%",
                top: "50%",
                animation: `particleBurst 0.8s ease-out ${i * 0.1}s forwards`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
