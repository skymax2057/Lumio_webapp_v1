"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { useLumioStore, ImageItem } from "@/lib/store";

interface CinematicGalleryProps {
  onClose: () => void;
}

export function CinematicGallery({ onClose }: CinematicGalleryProps) {
  const { focusImage, focusQueue, navigateFocus } = useLumioStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(3000); // ms per slide
  const [progress, setProgress] = useState(0);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying || focusQueue.length <= 1) return;

    const interval = setInterval(() => {
      navigateFocus("next");
      setProgress(0);
    }, speed);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (speed / 100));
      });
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isPlaying, speed, focusQueue.length, navigateFocus]);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
    setProgress(0);
  }, [isPlaying]);

  const changeSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    setProgress(0);
  }, []);

  if (!focusImage) return null;

  const paletteColors: string[] = (() => {
    try {
      return JSON.parse(focusImage.palette);
    } catch {
      return [focusImage.dominantColor, "#D4AF37", "#252530"];
    }
  })();

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-b from-black via-black/95 to-black flex flex-col">
      {/* Progress Bar - Enhanced */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-gold-500 shadow-lg shadow-violet-500/50"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/40 backdrop-blur-md">
            <Play className="w-3 h-3 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300">Mode Cinématique</span>
          </div>
          <div className="text-white/60 text-xs">
            <span className="font-semibold text-white">{focusQueue.findIndex((i) => i.id === focusImage.id) + 1}</span>
            <span className="mx-1">/</span>
            <span>{focusQueue.length}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white hover:scale-110 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Display */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={focusImage.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative max-w-full max-h-full"
          >
            <div className="relative">
              <img
                src={focusImage.url}
                alt={focusImage.title}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl shadow-black/50"
              />
              
              {/* Image Info Overlay - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-2xl backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-display text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                      {focusImage.title}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
                          {paletteColors.slice(0, 5).map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="h-6 w-px bg-white/20" />
                      <span className="text-white/80 text-sm capitalize font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
                        {focusImage.mood}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 text-white/70 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {focusImage.user.name}
                    </div>
                    {focusImage.category && (
                      <span className="px-2 py-1 rounded-full bg-violet-500/30 border border-violet-500/50 text-violet-300 text-[10px] font-semibold uppercase tracking-wider">
                        {focusImage.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Bar - Enhanced */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateFocus("prev")}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white hover:scale-110 shadow-lg"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateFocus("next")}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white hover:scale-110 shadow-lg"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Play/Pause - Enhanced */}
          <button
            onClick={togglePlay}
            className="p-5 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 transition-all text-white shadow-xl shadow-violet-500/40 hover:scale-110"
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
          </button>

          {/* Speed Control - Enhanced */}
          <div className="flex items-center gap-2">
            {[
              { label: "Lent", value: 5000 },
              { label: "Normal", value: 3000 },
              { label: "Rapide", value: 1500 },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => changeSpeed(option.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  speed === option.value
                    ? "bg-gradient-to-r from-gold-500 to-gold-600 text-black shadow-lg shadow-gold-500/30"
                    : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
