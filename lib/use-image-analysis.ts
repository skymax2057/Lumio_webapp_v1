"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { analyzeImageFromUrl, LumioColorAnalysis } from "./color-extractor-advanced";

interface UseImageAnalysisOptions {
  /** Whether to automatically analyze when image loads */
  autoAnalyze?: boolean;
  /** Cache analysis results to avoid re-analyzing same images */
  cacheResults?: boolean;
  /** Debounce time in ms for analysis */
  debounceMs?: number;
}

interface UseImageAnalysisResult {
  /** The analysis result */
  analysis: LumioColorAnalysis | null;
  /** Whether analysis is in progress */
  isLoading: boolean;
  /** Error message if analysis failed */
  error: string | null;
  /** Manually trigger analysis */
  analyze: (imageUrl: string) => Promise<void>;
  /** Reset the analysis state */
  reset: () => void;
}

// Simple in-memory cache
const analysisCache = new Map<string, LumioColorAnalysis>();

/**
 * Hook for analyzing images and extracting colors/mood
 * Uses canvas-based analysis for accurate results
 */
export function useImageAnalysis(
  options: UseImageAnalysisOptions = {}
): UseImageAnalysisResult {
  const {
    autoAnalyze = true,
    cacheResults = true,
    debounceMs = 300,
  } = options;

  const [analysis, setAnalysis] = useState<LumioColorAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const analyze = useCallback(async (imageUrl: string) => {
    // Check cache first
    if (cacheResults && analysisCache.has(imageUrl)) {
      const cached = analysisCache.get(imageUrl);
      if (cached) {
        setAnalysis(cached);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeImageFromUrl(imageUrl);
      setAnalysis(result);
      
      // Cache result
      if (cacheResults) {
        analysisCache.set(imageUrl, result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'analyse");
      console.error("Image analysis failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [cacheResults]);

  const reset = useCallback(() => {
    setAnalysis(null);
    setIsLoading(false);
    setError(null);
  }, []);

  // Debounced analyze function
  const debouncedAnalyze = useCallback((imageUrl: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      analyze(imageUrl);
    }, debounceMs);
  }, [analyze, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    analysis,
    isLoading,
    error,
    analyze,
    reset,
  };
}

/**
 * Hook specifically for analyzing images when they load in the DOM
 * Automatically extracts colors when an image element is available
 */
export function useImageElementAnalysis(
  imageRef: React.RefObject<HTMLImageElement>,
  options: UseImageAnalysisOptions = {}
): UseImageAnalysisResult {
  const { analysis, isLoading, error, analyze, reset } = useImageAnalysis(options);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || !image.src) return;

    const handleLoad = () => {
      setImageLoaded(true);
      if (options.autoAnalyze !== false) {
        analyze(image.src);
      }
    };

    const handleError = () => {
      analyze(""); // Trigger error state
    };

    if (image.complete) {
      handleLoad();
    } else {
      image.addEventListener("load", handleLoad);
      image.addEventListener("error", handleError);
    }

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [imageRef, options.autoAnalyze, analyze]);

  return { analysis, isLoading, error, analyze, reset };
}

/**
 * Batch analyze multiple images
 * Returns results as they complete
 */
export async function batchAnalyzeImages(
  imageUrls: string[],
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number, result: LumioColorAnalysis | null) => void;
  } = {}
): Promise<Map<string, LumioColorAnalysis | null>> {
  const { concurrency = 3, onProgress } = options;
  const results = new Map<string, LumioColorAnalysis | null>();
  let completed = 0;

  // Process in batches to avoid overwhelming the browser
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(url => analyzeImageFromUrl(url).catch(() => null))
    );

    batchResults.forEach((result, index) => {
      const url = batch[index];
      if (result.status === "fulfilled" && result.value) {
        results.set(url, result.value);
        analysisCache.set(url, result.value);
      } else {
        results.set(url, null);
      }
      completed++;
      onProgress?.(completed, imageUrls.length, result.status === "fulfilled" ? result.value : null);
    });
  }

  return results;
}

/**
 * Get cached analysis for an image
 */
export function getCachedAnalysis(imageUrl: string): LumioColorAnalysis | null {
  return analysisCache.get(imageUrl) || null;
}

/**
 * Clear the analysis cache
 */
export function clearAnalysisCache(): void {
  analysisCache.clear();
}

/**
 * Preload and analyze images for faster subsequent access
 */
export async function preloadAndAnalyze(
  imageUrls: string[]
): Promise<void> {
  await batchAnalyzeImages(imageUrls, {
    concurrency: 5,
  });
}