"use client";

import { computeVisualEchoScore } from "@/lib/visual-echo";
import { ImageItem, useLumioStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Waves, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function VisualEchoModal() {
  const { echoSourceImage, closeVisualEcho, openFocusMode } = useLumioStore();
  const [similarImages, setSimilarImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (echoSourceImage) {
      fetchSimilarImages();
    }
  }, [echoSourceImage]);

  const fetchSimilarImages = async () => {
    if (!echoSourceImage) return;
    setLoading(true);
    try {
      const res = await fetch("/api/images?limit=50");
      if (res.ok) {
        const data = await res.json();
        const candidates: ImageItem[] = data.images;

        // Compute Visual Echo score for each candidate
        const scored = candidates
          .map((c) => ({
            item: c,
            score: computeVisualEchoScore(echoSourceImage, c),
          }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
          .map((x) => x.item);

        setSimilarImages(scored);
      }
    } catch (e) {
      console.error("Failed to compute visual echo", e);
    } finally {
      setLoading(false);
    }
  };

  if (!echoSourceImage) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-lumio-dark/95 to-black/90 backdrop-blur-xl p-4 sm:p-6">
        <div className="absolute inset-0" onClick={closeVisualEcho} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-5xl bg-gradient-to-b from-lumio-card/95 to-lumio-card/90 border border-lumio-border/50 rounded-3xl p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto text-foreground shadow-2xl shadow-black/50"
        >
          {/* Header - Enhanced */}
          <div className="flex items-center justify-between pb-6 border-b border-lumio-border/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-full bg-gradient-to-br from-gold-500/20 to-violet-500/20 text-gold-400 border border-gold-500/30 shadow-lg shadow-gold-500/20">
                  <Waves className="w-6 h-6 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-lumio-card animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  Visual Echo Engine <Sparkles className="w-5 h-5 text-gold-500" />
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Œuvres résonnant avec l'harmonie chromatique et le style de "{echoSourceImage.title}"
                </p>
              </div>
            </div>

            <button
              onClick={closeVisualEcho}
              className="p-2.5 rounded-full bg-lumio-dark/60 border border-lumio-border/50 hover:border-gold-500/50 text-muted-foreground hover:text-foreground hover:scale-110 transition-all shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Source Image Summary - Enhanced */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-lumio-dark/80 to-lumio-dark/40 border border-gold-500/30 hover:border-gold-500/50 transition-all">
            <div className="relative shrink-0">
              <img
                src={echoSourceImage.url}
                alt={echoSourceImage.title}
                className="w-20 h-20 rounded-xl object-cover border-2 border-gold-500/40 shadow-lg shadow-gold-500/20"
              />
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-gold-500 text-black text-[10px] font-bold">
                Source
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400">
                  Œuvre Source
                </span>
                <div className="flex gap-1">
                  {(() => {
                    try {
                      return JSON.parse(echoSourceImage.palette).slice(0, 3).map((hex: string, i: number) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: hex }}
                        />
                      ));
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              </div>
              <p className="text-base font-semibold text-foreground">{echoSourceImage.title}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="capitalize">{echoSourceImage.mood}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span className="font-mono text-[10px]">{echoSourceImage.dominantColor}</span>
              </div>
            </div>
          </div>

          {/* Recommendations Grid - Enhanced */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                Œuvres Visuellement Proches
              </h4>
              <span className="text-xs text-muted-foreground">
                {similarImages.length} résultats
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gold-500/10 border border-gold-500/30">
                  <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gold-400 font-medium">
                    Calcul de la résonance visuelle en cours...
                  </span>
                </div>
              </div>
            ) : similarImages.length === 0 ? (
              <div className="py-16 text-center">
                <div className="inline-flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-lumio-dark/40 border border-lumio-border/30">
                  <Waves className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Aucun "Visual Echo" correspondant trouvé pour le moment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {similarImages.map((img, index) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      closeVisualEcho();
                      openFocusMode(img, similarImages);
                    }}
                    className="group relative rounded-2xl overflow-hidden bg-lumio-dark border border-lumio-border/50 cursor-pointer hover:border-gold-500/50 hover:shadow-xl hover:shadow-gold-500/10 transition-all hover:scale-105"
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                      <p className="text-xs font-semibold text-foreground line-clamp-1 mb-1">
                        {img.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gold-400 capitalize">
                          {img.mood}
                        </span>
                        <div className="flex gap-1">
                          {(() => {
                            try {
                              return JSON.parse(img.palette).slice(0, 2).map((hex: string, i: number) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 rounded-full border border-white/30"
                                  style={{ backgroundColor: hex }}
                                />
                              ));
                            } catch {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    {/* Quick View Indicator */}
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-3 h-3 text-gold-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
