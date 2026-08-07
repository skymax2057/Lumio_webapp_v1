"use client";

import { ImageCard } from "@/components/image-card";
import { ImageItem } from "@/lib/store";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AsymmetricalGalleryProps {
  images: ImageItem[];
  title?: string;
  description?: string;
}

export function AsymmetricalGallery({ images, title, description }: AsymmetricalGalleryProps) {
  if (!images || images.length === 0) return null;

  // Display first 8 images in asymmetrical layout
  const displayImages = images.slice(0, 8);

  return (
    <section className="luxury-section luxury-border">
      {/* Header */}
      {(title || description) && (
        <div className="mb-12 text-center">
          {title && (
            <h2 className="text-3xl md:text-4xl font-display font-bold luxury-tracking mb-4">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              {description}
            </p>
          )}
          <div className="divider-gold mt-6" />
        </div>
      )}

      {/* Asymmetrical Grid Layout */}
      <div className="asymmetrical-grid-4">
        {displayImages.map((image, index) => {
          // Determine span based on index for asymmetrical effect
          const spanCols = index === 0 || index === 3 ? "span-2-cols" : "";
          const spanRows = index === 0 ? "span-2-rows" : "";
          
          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${spanCols} ${spanRows} relative`}
            >
              <div className="h-full luxury-border rounded-2xl overflow-hidden bg-lumio-card">
                <ImageCard image={image} queue={displayImages} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative element */}
      {images.length > 8 && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold luxury-tracking">
            <Sparkles className="w-4 h-4" />
            {images.length - 8} autres créations disponibles
          </div>
        </div>
      )}
    </section>
  );
}
