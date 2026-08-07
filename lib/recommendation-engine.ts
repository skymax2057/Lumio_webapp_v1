import { ImageItem } from "./store";

/**
 * Calculate color similarity between two palettes
 * Uses average Euclidean distance between RGB values
 */
function calculateColorSimilarity(palette1: string[], palette2: string[]): number {
  if (!palette1.length || !palette2.length) return 0;

  let totalDistance = 0;
  const comparisons = Math.min(palette1.length, palette2.length);

  for (let i = 0; i < comparisons; i++) {
    const color1 = hexToRgb(palette1[i]);
    const color2 = hexToRgb(palette2[i]);
    
    if (color1 && color2) {
      const distance = Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
      );
      totalDistance += distance;
    }
  }

  // Normalize: max distance per color is sqrt(255^2 * 3) ≈ 441.67
  const maxDistance = comparisons * 441.67;
  const similarity = 1 - (totalDistance / maxDistance);
  
  return Math.max(0, similarity);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate mood similarity
 */
function calculateMoodSimilarity(mood1: string, mood2: string): number {
  if (!mood1 || !mood2) return 0;
  return mood1.toLowerCase() === mood2.toLowerCase() ? 1 : 0;
}

/**
 * Calculate overall similarity score between two images
 */
export function calculateSimilarity(image1: ImageItem, image2: ImageItem): number {
  // Same image? Not similar
  if (image1.id === image2.id) return 0;

  let score = 0;
  let weights = 0;

  // Color similarity (weight: 0.6)
  try {
    const palette1 = JSON.parse(image1.palette);
    const palette2 = JSON.parse(image2.palette);
    const colorSim = calculateColorSimilarity(palette1, palette2);
    score += colorSim * 0.6;
    weights += 0.6;
  } catch {
    // Fallback to dominant color
    const colorSim = calculateColorSimilarity([image1.dominantColor], [image2.dominantColor]);
    score += colorSim * 0.6;
    weights += 0.6;
  }

  // Mood similarity (weight: 0.3)
  const moodSim = calculateMoodSimilarity(image1.mood, image2.mood);
  score += moodSim * 0.3;
  weights += 0.3;

  // Category similarity (weight: 0.1)
  if (image1.category?.id === image2.category?.id) {
    score += 0.1;
    weights += 0.1;
  }

  return weights > 0 ? score / weights : 0;
}

/**
 * Get recommended images based on similarity
 */
export function getRecommendations(
  targetImage: ImageItem,
  allImages: ImageItem[],
  limit: number = 6
): ImageItem[] {
  // Calculate similarity scores
  const scoredImages = allImages
    .map((image) => ({
      image,
      score: calculateSimilarity(targetImage, image),
    }))
    .filter((item) => item.score > 0) // Only include similar images
    .sort((a, b) => b.score - a.score); // Sort by similarity (highest first)

  // Return top recommendations
  return scoredImages.slice(0, limit).map((item) => item.image);
}

/**
 * Get diverse recommendations (avoid too similar images)
 */
export function getDiverseRecommendations(
  targetImage: ImageItem,
  allImages: ImageItem[],
  limit: number = 6
): ImageItem[] {
  const recommendations: ImageItem[] = [];
  const usedMoods = new Set<string>([targetImage.mood]);
  const usedCategories = new Set<string>([targetImage.category?.id || ""]);

  // First, get highly similar images
  const similarImages = getRecommendations(targetImage, allImages, limit * 2);

  // Then select diverse ones
  for (const image of similarImages) {
    if (recommendations.length >= limit) break;

    const mood = image.mood;
    const categoryId = image.category?.id || "";

    // Skip if we already have similar mood/category (unless we have few recommendations)
    if (recommendations.length < 2 || (!usedMoods.has(mood) && !usedCategories.has(categoryId))) {
      recommendations.push(image);
      usedMoods.add(mood);
      usedCategories.add(categoryId);
    }
  }

  // If we don't have enough, fill with remaining similar images
  if (recommendations.length < limit) {
    for (const image of similarImages) {
      if (recommendations.length >= limit) break;
      if (!recommendations.find((r) => r.id === image.id)) {
        recommendations.push(image);
      }
    }
  }

  return recommendations;
}
