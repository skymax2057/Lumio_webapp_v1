"use client";

import React from "react";
import { useLumioStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Heart, Share2, Sparkles, X, Play, MonitorPlay, Calendar, Eye, Palette } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CinematicGallery } from "@/components/cinematic-gallery";
import { ImageRecommendations } from "@/components/image-recommendations";
import { SlideshowMode } from "@/components/slideshow-mode";
import { useMicroInteractions } from "@/components/micro-interactions";

export function Lightbox() {
  const { data: session } = useSession();
  const { showNotification } = useMicroInteractions();
  const {
    focusImage,
    closeFocusMode,
    navigateFocus,
    focusQueue,
    likedImagesMap,
    setOptimisticLike,
    openFocusMode,
  } = useLumioStore();

  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isSlideshowMode, setIsSlideshowMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusImage) return;
      if (e.key === "Escape") closeFocusMode();
      if (e.key === "ArrowLeft") navigateFocus("prev");
      if (e.key === "ArrowRight") navigateFocus("next");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusImage, closeFocusMode, navigateFocus]);

  const paletteColors: string[] = React.useMemo(() => {
    if (!focusImage) return ["#D4AF37", "#252530"];
    try {
      return JSON.parse(focusImage.palette);
    } catch {
      return [focusImage.dominantColor, "#D4AF37", "#252530"];
    }
  }, [focusImage?.palette, focusImage?.dominantColor]);

  if (!focusImage) return null;

  const currentLike = likedImagesMap[focusImage.id] || {
    liked: !!focusImage.isLikedByCurrentUser,
    count: focusImage._count?.likes ?? 0,
  };

  const handleLike = async () => {
    if (!session) {
      showNotification("🔐 Connectez-vous pour liker cette œuvre", "warning");
      return;
    }

    const nextLiked = !currentLike.liked;
    setOptimisticLike(focusImage.id, nextLiked, nextLiked ? 1 : -1);

    try {
      await fetch(`/api/images/${focusImage.id}/like`, { method: "POST" });
    } catch (err) {
      console.error(err);
      setOptimisticLike(focusImage.id, !nextLiked, nextLiked ? -1 : 1);
    }
  };

  return (
    <>
      {/* Cinematic Mode Overlay */}
      <AnimatePresence>
        {isCinematicMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CinematicGallery onClose={() => setIsCinematicMode(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slideshow Mode Overlay */}
      <AnimatePresence>
        {isSlideshowMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SlideshowMode onClose={() => setIsSlideshowMode(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard Lightbox */}
      <AnimatePresence mode="wait">
        {!isCinematicMode && !isSlideshowMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-lumio-dark/95 backdrop-blur-2xl p-4 md:p-8"
          >
            {/* Backdrop Close with gradient overlay */}
            <div 
              className="absolute inset-0 z-0 bg-gradient-to-br from-violet-900/10 via-transparent to-blue-900/10"
              onClick={closeFocusMode}
            />

            {/* Top Floating Bar */}
            <div className="absolute top-4 inset-x-4 md:inset-x-8 z-20 flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/40 text-gold-400 text-xs font-semibold shadow-lg shadow-gold-500/20 backdrop-blur-sm">
                  Mode Focus Immersif
                </span>
                {focusQueue.length > 1 && (
                  <>
                    <button
                      onClick={() => setIsCinematicMode(true)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-violet-600/20 border border-violet-500/40 text-violet-400 text-xs font-semibold flex items-center gap-1.5 hover:from-violet-500/30 hover:to-violet-600/30 hover:scale-105 transition-all shadow-lg shadow-violet-500/20 backdrop-blur-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Mode Cinématique
                    </button>
                    <button
                      onClick={() => setIsSlideshowMode(true)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/40 text-gold-400 text-xs font-semibold flex items-center gap-1.5 hover:from-gold-500/30 hover:to-gold-600/30 hover:scale-105 transition-all shadow-lg shadow-gold-500/20 backdrop-blur-sm"
                    >
                      <MonitorPlay className="w-3.5 h-3.5" />
                      Mode Slideshow
                    </button>
                  </>
                )}
                <span className="text-xs text-muted-foreground/80 hidden sm:inline px-3 py-1.5 rounded-full bg-lumio-card/50 border border-lumio-border/30 backdrop-blur-sm">
                  Navigation : ◄ ► / Échap pour fermer
                </span>
              </div>

              <button
                onClick={closeFocusMode}
                className="p-3 rounded-full bg-gradient-to-br from-lumio-card to-lumio-card/80 border border-lumio-border hover:border-rose-500 hover:from-rose-500/20 hover:to-rose-500/10 text-muted-foreground hover:text-rose-400 transition-all shadow-xl hover:shadow-rose-500/20 hover:scale-110 backdrop-blur-sm"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Content Container */}
            <div className="relative z-10 w-full max-w-7xl max-h-[90vh] flex flex-col lg:flex-row gap-4 lg:gap-6 my-auto">
              {/* Navigation & Image Section */}
              <div className="flex-1 flex items-center justify-center gap-2 md:gap-4 min-h-0">
                {/* Left Arrow Navigation */}
                {focusQueue.length > 1 && (
                  <button
                    onClick={() => navigateFocus("prev")}
                    className="flex-shrink-0 p-3 md:p-4 rounded-full bg-gradient-to-br from-lumio-card/95 to-lumio-card/80 border border-lumio-border/50 hover:border-gold-500 text-foreground hover:scale-110 hover:shadow-gold-500/30 transition-all shadow-2xl backdrop-blur-sm group"
                    title="Image précédente"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Center Image Display */}
                <div className="flex items-center justify-center max-h-[85vh] flex-1 relative group">
                  <motion.img
                    key={focusImage.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={focusImage.url}
                    alt={focusImage.title}
                    className="max-h-[85vh] w-auto max-w-full object-contain rounded-3xl border border-lumio-border/60 shadow-[0_0_60px_rgba(212,175,55,0.15),0_0_30px_rgba(139,92,246,0.1)] hover:shadow-[0_0_80px_rgba(212,175,55,0.25),0_0_40px_rgba(139,92,246,0.15)] transition-shadow duration-500"
                  />
                </div>

                {/* Right Arrow Navigation */}
                {focusQueue.length > 1 && (
                  <button
                    onClick={() => navigateFocus("next")}
                    className="flex-shrink-0 p-3 md:p-4 rounded-full bg-gradient-to-br from-lumio-card/95 to-lumio-card/80 border border-lumio-border/50 hover:border-gold-500 text-foreground hover:scale-110 hover:shadow-gold-500/30 transition-all shadow-2xl backdrop-blur-sm group"
                    title="Image suivante"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Right Sidebar Details */}
              <div className="w-full lg:w-[400px] xl:w-[450px] bg-gradient-to-b from-lumio-card/95 to-lumio-card/90 border border-lumio-border/50 rounded-3xl p-4 text-foreground max-h-[85vh] backdrop-blur-xl shadow-2xl flex flex-col flex-shrink-0">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {/* Title & Category */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest bg-gradient-to-r from-gold-500/20 to-violet-500/20 px-3 py-1.5 rounded-full border border-gold-500/30 shadow-lg shadow-gold-500/10">
                        {focusImage.category?.name || "Art Visuel"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {focusImage.viewsCount || 0} vues
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-xl md:text-2xl leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {focusImage.title}
                    </h2>
                  </div>

                  {/* Author Card - Enhanced */}
                  <div className="group relative p-4 rounded-2xl bg-gradient-to-br from-lumio-dark/80 to-lumio-dark/40 border border-lumio-border/50 hover:border-gold-500/50 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Link
                      href={`/profile/${focusImage.user.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        closeFocusMode();
                        setTimeout(() => {
                          window.location.href = `/profile/${focusImage.user.id}`;
                        }, 100);
                      }}
                      className="relative flex items-center gap-3 cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={
                            focusImage.user.image ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                          }
                          alt={focusImage.user.name || "Auteur"}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gold-500/40 shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-lumio-card" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                          {focusImage.user.name || "Artiste Lumio"}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-gold-400" />
                          Créateur vérifié
                        </p>
                      </div>
                      <div className="p-2 rounded-full bg-gold-500/10 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>

                  {/* Description */}
                  {focusImage.description && (
                    <div className="p-4 rounded-2xl bg-lumio-dark/40 border border-lumio-border/30">
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {focusImage.description}
                      </p>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-lumio-dark/40 border border-lumio-border/30 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{currentLike.count}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Likes</p>
                    </div>
                    <div className="p-3 rounded-xl bg-lumio-dark/40 border border-lumio-border/30 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-violet-400 mb-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{focusImage.viewsCount || 0}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vues</p>
                    </div>
                    <div className="p-3 rounded-xl bg-lumio-dark/40 border border-lumio-border/30 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-gold-400 mb-1">
                        <Palette className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{paletteColors.length}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Couleurs</p>
                    </div>
                  </div>

                  {/* Action Bar - Fixed at bottom */}
                  <div className="flex items-center gap-2 pt-3 border-t border-lumio-border/50 flex-shrink-0">
                    <button
                      onClick={handleLike}
                      className={`flex-1 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all shadow-lg ${currentLike.liked
                          ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 border-rose-500/50 text-rose-400 hover:from-rose-500/30 hover:to-rose-500/20"
                          : "bg-lumio-dark/60 border-lumio-border/50 text-foreground hover:border-gold-500/50 hover:bg-lumio-dark/80"
                        }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${currentLike.liked ? "fill-rose-500 text-rose-500" : ""
                          }`}
                      />
                      <span>{currentLike.liked ? "Liké" : "J'aime"}</span>
                    </button>

                    <a
                      href={focusImage.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-lumio-dark/60 border border-lumio-border/50 hover:border-gold-500/50 hover:bg-gold-500/10 text-muted-foreground hover:text-foreground transition-all shadow-lg"
                      title="Télécharger l'image HD"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    <Link
                      href={`/image/${focusImage.id}`}
                      onClick={closeFocusMode}
                      className="p-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-lumio-dark font-bold hover:scale-105 transition-all shadow-lg shadow-gold-500/30"
                      title="Page complète de l'œuvre"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-2 flex-shrink-0">
                    <Calendar className="w-3 h-3" />
                    <span>Publié le {formatDate(new Date(focusImage.createdAt))}</span>
                  </div>

                  {/* Recommendations */}
                  <div className="pt-3 border-t border-lumio-border flex-shrink-0">
                    <ImageRecommendations
                      currentImage={focusImage}
                      allImages={focusQueue}
                      onSelectImage={(image) => {
                        openFocusMode(image, focusQueue);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}