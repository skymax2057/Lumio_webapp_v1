"use client";

import { ImageCard } from "@/components/image-card";
import { ImageItem, useLumioStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface MasonryGridProps {
  initialImages: ImageItem[];
}

export function MasonryGrid({ initialImages }: MasonryGridProps) {
  const {
    selectedCategory,
    selectedMood,
    searchQuery,
    selectedTag,
    initializeLikesMap,
  } = useLumioStore();

  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Initialize likes map in Zustand store
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      initializeLikesMap(initialImages);
    }
  }, [initialImages, initializeLikesMap]);

  // Client filtering & dynamic server fetch on filter change
  useEffect(() => {
    fetchFilteredImages();
  }, [selectedCategory, selectedMood, searchQuery, selectedTag]);

  const fetchFilteredImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedMood !== "all") params.set("mood", selectedMood);
      if (searchQuery) params.set("search", searchQuery);
      if (selectedTag) params.set("tag", selectedTag);
      params.set("page", "1");

      const res = await fetch(`/api/images?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
        initializeLikesMap(data.images);
        setPage(1);
        setHasMore(data.hasMore);
      }
    } catch (e) {
      console.error("Error fetching filtered images", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedMood !== "all") params.set("mood", selectedMood);
      if (searchQuery) params.set("search", searchQuery);
      if (selectedTag) params.set("tag", selectedTag);
      params.set("page", nextPage.toString());

      const res = await fetch(`/api/images?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, ...data.images]);
        initializeLikesMap(data.images);
        setPage(nextPage);
        setHasMore(data.hasMore);
      }
    } catch (e) {
      console.error("Error loading more images", e);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && images.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-24 text-center space-y-8 rounded-3xl bg-gradient-to-br from-lumio-card/60 to-violet-500/10 luxury-border luxury-spacing-lg geometric-pattern luxury-border corner-accent"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
          <Sparkles className="w-16 h-16 text-violet-400 mx-auto animate-bounce relative z-10" />
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-2xl font-bold gold-gradient-text">
            Aucune œuvre trouvée
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Aucune création ne correspond aux critères sélectionnés. 
            <span className="block mt-2 text-violet-400">Essayez d'effacer les filtres ou de faire une recherche différente.</span>
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => {
              // Reset filters logic would go here
              window.location.reload();
            }}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-semibold hover:brightness-110 transition-all shadow-lg shadow-violet-500/25"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header with image count */}
      {!loading && images.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              <span className="text-violet-400 font-semibold">{images.length}</span> œuvres trouvées
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Affichage:</span>
            <button className="px-3 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-medium border border-violet-500/30">
              Masonry
            </button>
          </div>
        </motion.div>
      )}

      {/* CSS Column Masonry Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.4,
                delay: Math.min(index * 0.05, 0.3),
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="break-inside-avoid"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <ImageCard image={img} queue={images} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {loading && images.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-lumio-card border border-violet-500/30">
            <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-sm text-violet-400">Chargement des créations...</span>
          </div>
        </motion.div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 text-center"
        >
          <button
            onClick={loadMore}
            className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-semibold hover:brightness-110 transition-all shadow-lg shadow-violet-500/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Charger plus d'œuvres...
            </span>
          </button>
        </motion.div>
      )}

      {/* End of results */}
      {!hasMore && images.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-lumio-card/50 border border-violet-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Toutes les œuvres ont été chargées</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
