"use client";

import { ImageItem } from "@/lib/store";
import { getDiverseRecommendations } from "@/lib/recommendation-engine";
import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useLumioStore } from "@/lib/store";

interface ImageRecommendationsProps {
  currentImage: ImageItem;
  allImages: ImageItem[];
  onSelectImage: (image: ImageItem) => void;
}

export function ImageRecommendations({
  currentImage,
  allImages,
  onSelectImage,
}: ImageRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ImageItem[]>([]);
  const { likedImagesMap } = useLumioStore();

  useEffect(() => {
    // Calculate recommendations when current image changes
    const recs = getDiverseRecommendations(currentImage, allImages, 5);
    setRecommendations(recs);
  }, [currentImage, allImages]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gold-400" />
        <h4 className="text-sm font-semibold text-foreground">
          Vous aimerez aussi
        </h4>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {recommendations.map((image, index) => {
          const likeState = likedImagesMap[image.id] || {
            liked: !!image.isLikedByCurrentUser,
            count: image._count?.likes ?? 0,
          };

          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => onSelectImage(image)}
            >
              <div className="aspect-square rounded-xl overflow-hidden border border-lumio-border hover:border-gold-500/50 transition-all">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Like indicator */}
                <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                  <Heart className={`w-2.5 h-2.5 ${likeState.liked ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                  <span className="text-[8px] text-white font-medium">{likeState.count}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
