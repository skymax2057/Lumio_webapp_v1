import { calculateColorDistance } from './utils';

export interface VisualEchoTarget {
  id: string;
  title: string;
  categoryId?: string | null;
  dominantColor: string;
  palette: string; // JSON string
  tags: string; // JSON string
  mood: string;
  brightness?: number;
  saturation?: number;
  temperature?: string;
  viewsCount?: number;
  likesCount?: number;
  createdAt?: string | Date;
}

export interface VisualEchoResult {
  image: VisualEchoTarget;
  score: number;
  matchReasons: string[];
}

/**
 * Enhanced Visual Echo Scoring Algorithm
 * Uses multi-factor analysis for more accurate visual similarity matching
 */
export function computeVisualEchoScore(
  source: VisualEchoTarget,
  candidate: VisualEchoTarget
): number {
  if (source.id === candidate.id) return -1;

  let score = 0;
  const weights = {
    color: 0.25,
    palette: 0.15,
    category: 0.15,
    mood: 0.15,
    tags: 0.15,
    brightness: 0.08,
    saturation: 0.07,
  };

  // 1. Dominant color distance (25% weight)
  const colorSim = calculateColorDistance(source.dominantColor, candidate.dominantColor);
  score += colorSim * weights.color;

  // 2. Palette similarity (15% weight)
  try {
    const sourcePalette: string[] = JSON.parse(source.palette || '[]');
    const candidatePalette: string[] = JSON.parse(candidate.palette || '[]');
    
    if (sourcePalette.length > 0 && candidatePalette.length > 0) {
      let paletteScore = 0;
      const comparisons = Math.min(sourcePalette.length, candidatePalette.length, 4);
      
      for (let i = 0; i < comparisons; i++) {
        const sim = calculateColorDistance(sourcePalette[i], candidatePalette[i]);
        paletteScore += sim / comparisons;
      }
      score += paletteScore * weights.palette;
    }
  } catch {
    // Ignore palette parse errors
  }

  // 3. Category match (15% weight)
  if (source.categoryId && source.categoryId === candidate.categoryId) {
    score += weights.category;
  }

  // 4. Mood match (15% weight)
  if (source.mood && source.mood === candidate.mood) {
    score += weights.mood;
  } else if (source.mood && candidate.mood) {
    // Partial mood similarity
    const moodGroups = {
      calm: ['calme', 'sereine', 'minimaliste'],
      energetic: ['énergique', 'vibrante'],
      mysterious: ['mystérieuse', 'sombre', 'chaleureuse'],
    };
    
    for (const group of Object.values(moodGroups)) {
      if (group.includes(source.mood) && group.includes(candidate.mood)) {
        score += weights.mood * 0.5;
        break;
      }
    }
  }

  // 5. Tag overlap (15% weight)
  try {
    const sourceTags: string[] = JSON.parse(source.tags || '[]');
    const candidateTags: string[] = JSON.parse(candidate.tags || '[]');

    if (sourceTags.length > 0 && candidateTags.length > 0) {
      const intersection = sourceTags.filter((t) => candidateTags.includes(t));
      const union = new Set([...sourceTags, ...candidateTags]).size;
      const jaccard = intersection.length / union;
      score += jaccard * weights.tags;
    }
  } catch {
    // Ignore tag parse errors
  }

  // 6. Brightness similarity (8% weight)
  if (source.brightness !== undefined && candidate.brightness !== undefined) {
    const brightnessDiff = Math.abs(source.brightness - candidate.brightness);
    score += (1 - brightnessDiff) * weights.brightness;
  }

  // 7. Saturation similarity (7% weight)
  if (source.saturation !== undefined && candidate.saturation !== undefined) {
    const saturationDiff = Math.abs(source.saturation - candidate.saturation);
    score += (1 - saturationDiff) * weights.saturation;
  }

  return Math.min(1, score); // Cap at 1.0
}

/**
 * Get match reasons for transparency
 */
export function getMatchReasons(
  source: VisualEchoTarget,
  candidate: VisualEchoTarget,
  score: number
): string[] {
  const reasons: string[] = [];

  // Color match
  const colorSim = calculateColorDistance(source.dominantColor, candidate.dominantColor);
  if (colorSim > 0.7) {
    reasons.push(`Couleurs similaires (${Math.round(colorSim * 100)}%)`);
  }

  // Mood match
  if (source.mood === candidate.mood) {
    reasons.push(`Même ambiance: ${source.mood}`);
  }

  // Category match
  if (source.categoryId && source.categoryId === candidate.categoryId) {
    reasons.push('Même catégorie');
  }

  // Tag overlap
  try {
    const sourceTags: string[] = JSON.parse(source.tags || '[]');
    const candidateTags: string[] = JSON.parse(candidate.tags || '[]');
    const commonTags = sourceTags.filter((t) => candidateTags.includes(t));
    if (commonTags.length > 0) {
      reasons.push(`Tags communs: ${commonTags.slice(0, 3).join(', ')}`);
    }
  } catch {
    // Ignore
  }

  // Brightness
  if (source.brightness !== undefined && candidate.brightness !== undefined) {
    const diff = Math.abs(source.brightness - candidate.brightness);
    if (diff < 0.15) {
      reasons.push(source.brightness > 0.6 ? 'Lumineux' : 'Sombre');
    }
  }

  return reasons;
}

/**
 * Find visual echoes for a given image
 * Returns sorted results with match reasons
 */
export function findVisualEchoes(
  source: VisualEchoTarget,
  candidates: VisualEchoTarget[],
  limit: number = 12,
  minScore: number = 0.3
): VisualEchoResult[] {
  const results: VisualEchoResult[] = [];

  for (const candidate of candidates) {
    const score = computeVisualEchoScore(source, candidate);
    if (score >= minScore) {
      const reasons = getMatchReasons(source, candidate, score);
      results.push({
        image: candidate,
        score,
        matchReasons: reasons,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Advanced: Compute similarity matrix for multiple images
 * Useful for generating curated galleries
 */
export function computeSimilarityMatrix(
  images: VisualEchoTarget[]
): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>();

  for (const img1 of images) {
    const row = new Map<string, number>();
    for (const img2 of images) {
      if (img1.id !== img2.id) {
        const score = computeVisualEchoScore(img1, img2);
        row.set(img2.id, score);
      }
    }
    matrix.set(img1.id, row);
  }

  return matrix;
}

/**
 * Generate a curated gallery path that maximizes visual flow
 * Uses a greedy algorithm to create a smooth visual journey
 */
export function generateVisualJourney(
  images: VisualEchoTarget[],
  startImageId?: string
): VisualEchoTarget[] {
  if (images.length === 0) return [];

  const remaining = [...images];
  const journey: VisualEchoTarget[] = [];

  // Start with the specified image or the first one
  let current = startImageId
    ? remaining.find((img) => img.id === startImageId) || remaining[0]
    : remaining[0];

  journey.push(current);
  remaining.splice(remaining.indexOf(current), 1);

  // Greedily add the most similar remaining image
  while (remaining.length > 0) {
    let bestNext: VisualEchoTarget | null = null;
    let bestScore = -1;

    for (const candidate of remaining) {
      const score = computeVisualEchoScore(current, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestNext = candidate;
      }
    }

    if (bestNext) {
      journey.push(bestNext);
      current = bestNext;
      remaining.splice(remaining.indexOf(bestNext), 1);
    }
  }

  return journey;
}
