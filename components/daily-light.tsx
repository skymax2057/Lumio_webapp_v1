"use client";

import { useLumioStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Maximize2, Sparkles, Sun, Eye, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AtmosphericFog } from "@/components/atmospheric-fog";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMicroInteractions } from "@/components/micro-interactions";

interface DailyLightProps {
  image: {
    id: string;
    title: string;
    description?: string | null;
    url: string;
    dominantColor: string;
    mood: string;
    user: {
      name?: string | null;
      image?: string | null;
    };
    _count?: {
      likes: number;
    };
  };
}

const DAILY_INTENTIONS = [
  "« Le calme n'est pas l'absence de bruit, c'est la présence de l'essentiel. »",
  "« Regarde la lumière là où d'autres ne voient que l'ombre. »",
  "« La simplicité est la sophistication suprême. » — Leonardo da Vinci",
  "« Chaque image est une respiration offerte au monde. »",
  "« Cultive la beauté contemplative au quotidien. »"
];

export function DailyLight({ image }: DailyLightProps) {
  const { data: session } = useSession();
  const { showNotification } = useMicroInteractions();
  const { openFocusMode } = useLumioStore();
  const [isLiked, setIsLiked] = useState(false);

  if (!image) return null;

  // Use deterministic quote selection based on image ID to avoid hydration mismatch
  const quoteIndex = image.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % DAILY_INTENTIONS.length;
  const quote = DAILY_INTENTIONS[quoteIndex];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full rounded-3xl overflow-hidden bg-card border border-violet-500/20 shadow-2xl shadow-violet-500/10 group"
    >
      {/* Atmospheric fog effect */}
      <div className="absolute inset-0 pointer-events-none z-0 rounded-3xl overflow-hidden">
        <AtmosphericFog intensity="subtle" color="violet" />
      </div>
      
      {/* Background image with blur */}
      <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-25 transition-opacity duration-700">
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover filter blur-3xl scale-110"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-violet-900/20 via-transparent to-blue-900/20" />

      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8">
        {/* Left Column: Information */}
        <div className="lg:col-span-7 space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-violet-500/30 backdrop-blur-md"
          >
            <Sun className="w-4 h-4 text-violet-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span className="text-sm font-semibold text-violet-300 uppercase tracking-wide">
              Photo Vedette
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-foreground leading-tight"
          >
            {image.title}
          </motion.h2>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl italic text-violet-200/90 leading-relaxed border-l-4 border-violet-500/50 pl-6 py-2"
          >
            {quote}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-sm md:text-base text-muted-foreground line-clamp-2"
          >
            {image.description || "Une création contemplative sélectionnée par l'équipe Lumio pour illuminer votre journée."}
          </motion.p>

          {/* Author & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-between pt-4"
          >
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={image.user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                  alt={image.user.name || "Auteur"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-violet-500/50"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-violet-500 rounded-full border-2 border-card" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{image.user.name || "Artiste Lumio"}</p>
                <p className="text-xs text-violet-400 uppercase tracking-wide font-medium">Créateur Vedette</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{image._count?.likes || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-500" />
                <span>1.2K</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-4 pt-4"
          >
            <button
              onClick={() => openFocusMode(image as any, [image as any])}
              className="group px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Mode Immersion</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                if (!session) {
                  showNotification("🔐 Connectez-vous pour liker cette œuvre", "warning");
                  return;
                }
                setIsLiked(!isLiked);
              }}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                isLiked 
                  ? "bg-rose-500/10 border-rose-500 text-rose-500" 
                  : "bg-card border-border text-muted-foreground hover:border-violet-500/50 hover:text-violet-400"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </button>

            <Link
              href={`/image/${image.id}`}
              className="p-3 rounded-xl bg-card border border-border text-muted-foreground hover:border-violet-500/50 hover:text-violet-400 transition-all duration-300"
              title="Détails de l'image"
            >
              <Sparkles className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Featured Image Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          onClick={() => openFocusMode(image as any, [image as any])}
          className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-violet-500/30 cursor-pointer shadow-2xl group/img hover:shadow-violet-500/20 transition-all duration-500 hover:scale-[1.02]"
        >
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 ease-out"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/img:opacity-40 transition-opacity duration-500" />

          {/* Badge Mood */}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-violet-500/90 backdrop-blur-md border border-violet-400/30 text-xs font-semibold text-white capitalize shadow-lg">
            {image.mood}
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center">
              <Maximize2 className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Time badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-white">
            <Clock className="w-3.5 h-3.5" />
            <span>Publié il y a 2h</span>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500 animate-pulse"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse"
      />
    </motion.section>
  );
}
