"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Expand, Shrink, MonitorPlay } from "lucide-react";
import { useLumioStore } from "@/lib/store";

interface SlideshowModeProps {
  onClose: () => void;
}

export function SlideshowMode({ onClose }: SlideshowModeProps) {
  const { focusImage, focusQueue, navigateFocus } = useLumioStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || focusQueue.length <= 1) return;

    const interval = setInterval(() => {
      navigateFocus("next");
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, focusQueue.length, navigateFocus]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") navigateFocus("prev");
      if (e.key === "ArrowRight") navigateFocus("next");
      if (e.key === " ") setIsAutoPlaying(!isAutoPlaying);
      if (e.key === "f") toggleFullscreen();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, navigateFocus, isAutoPlaying]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      if (info.offset.x > threshold) {
        setDragDirection("right");
        navigateFocus("prev");
      } else if (info.offset.x < -threshold) {
        setDragDirection("left");
        navigateFocus("next");
      }
      setTimeout(() => setDragDirection(null), 300);
    },
    [navigateFocus]
  );

  if (!focusImage) return null;

  const currentIndex = focusQueue.findIndex((i) => i.id === focusImage.id);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[70] bg-gradient-to-b from-black via-black/95 to-black flex flex-col"
    >
      {/* Top Controls - Enhanced */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/20 border border-gold-500/40 backdrop-blur-md">
            <MonitorPlay className="w-3 h-3 text-gold-400" />
            <span className="text-xs font-semibold text-gold-300">Mode Slideshow</span>
          </div>
          <div className="text-white/70 text-xs">
            <span className="font-semibold text-white">{currentIndex + 1}</span>
            <span className="mx-1">/</span>
            <span>{focusQueue.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isAutoPlaying
                ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30"
                : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            }`}
          >
            {isAutoPlaying ? "Pause" : "Lecture"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white hover:scale-110 shadow-lg"
          >
            {isFullscreen ? <Shrink className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white hover:scale-110 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Area with Swipe Gestures - Enhanced */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={focusImage.id}
            initial={{ 
              opacity: 0, 
              x: dragDirection === "right" ? -100 : dragDirection === "left" ? 100 : 0,
              scale: 0.95,
              rotateY: dragDirection === "right" ? -10 : dragDirection === "left" ? 10 : 0
            }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
            exit={{ 
              opacity: 0, 
              x: dragDirection === "right" ? 100 : dragDirection === "left" ? -100 : 0,
              scale: 0.95,
              rotateY: dragDirection === "right" ? 10 : dragDirection === "left" ? -10 : 0
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            className="relative max-w-full max-h-full p-4 md:p-8"
          >
            <div className="relative">
              <img
                src={focusImage.url}
                alt={focusImage.title}
                className="max-h-[85vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl shadow-black/50"
                draggable={false}
              />
              
              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-2xl">
                <h3 className="text-white font-display text-lg md:text-xl font-bold mb-1">
                  {focusImage.title}
                </h3>
                <div className="flex items-center gap-3 text-white/70 text-xs">
                  <span>{focusImage.user.name}</span>
                  <span className="w-1 h-1 rounded-full bg-white/50" />
                  <span className="capitalize">{focusImage.mood}</span>
                  {focusImage.category && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/50" />
                      <span className="px-2 py-0.5 rounded-full bg-gold-500/30 border border-gold-500/50 text-gold-300 text-[10px] font-semibold uppercase">
                        {focusImage.category.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Enhanced */}
        {focusQueue.length > 1 && (
          <>
            <button
              onClick={() => navigateFocus("prev")}
              className="absolute left-4 md:left-8 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white hover:scale-110 z-10 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigateFocus("next")}
              className="absolute right-4 md:right-8 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white hover:scale-110 z-10 shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/40 text-xs flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
      >
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">◄ ►</kbd>
          <span>Naviguer</span>
        </span>
        <span className="w-px h-3 bg-white/20" />
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Espace</kbd>
          <span>Play/Pause</span>
        </span>
        <span className="w-px h-3 bg-white/20" />
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">F</kbd>
          <span>Plein écran</span>
        </span>
      </motion.div>
    </div>
  );
}
