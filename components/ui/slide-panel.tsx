"use client";

import { ReactNode, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: "right" | "left" | "top" | "bottom";
  className?: string;
  overlayClassName?: string;
}

export function SlidePanel({
  isOpen,
  onClose,
  children,
  position = "right",
  className = "",
  overlayClassName = "",
}: SlidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const slideVariants = {
    right: {
      open: { x: 0 },
      closed: { x: "100%" },
    },
    left: {
      open: { x: 0 },
      closed: { x: "-100%" },
    },
    top: {
      open: { y: 0 },
      closed: { y: "-100%" },
    },
    bottom: {
      open: { y: 0 },
      closed: { y: "100%" },
    },
  };

  const axis = position === "left" || position === "right" ? "x" : "y";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleOverlayClick}
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${overlayClassName}`}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={slideVariants[position].closed}
            animate={slideVariants[position].open}
            exit={slideVariants[position].closed}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className={`fixed z-50 glass-premium premium-gold-border shadow-gold-intense ${className} ${
              position === "right" ? "right-0 top-0 h-full w-80 max-w-full"
              : position === "left" ? "left-0 top-0 h-full w-80 max-w-full"
              : position === "top" ? "top-0 left-0 w-full h-80 max-h-full"
              : "bottom-0 left-0 w-full h-80 max-h-full"
            }`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
