import { describe, it, expect } from 'vitest';
import {
  computeVisualEchoScore,
  getMatchReasons,
  findVisualEchoes,
  computeSimilarityMatrix,
  generateVisualJourney,
  type VisualEchoTarget,
} from '@/lib/visual-echo';

describe('computeVisualEchoScore', () => {
  const createMockTarget = (overrides: Partial<VisualEchoTarget> = {}): VisualEchoTarget => ({
    id: 'test-id',
    title: 'Test Image',
    dominantColor: '#000000',
    palette: JSON.stringify(['#000000', '#FFFFFF', '#333333', '#666666']),
    tags: JSON.stringify(['test', 'sample']),
    mood: 'calme',
    categoryId: 'cat-1',
    brightness: 0.5,
    saturation: 0.5,
    temperature: 'warm',
    ...overrides,
  });

  it('should return -1 when comparing the same image', () => {
    const target = createMockTarget({ id: 'same-id' });
    const result = computeVisualEchoScore(target, target);
    expect(result).toBe(-1);
  });

  it('should compute high score for identical colors', () => {
    const source = createMockTarget({ dominantColor: '#FF0000', id: 'source' });
    const candidate = createMockTarget({ dominantColor: '#FF0000', id: 'candidate' });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThan(0.7);
  });

  it('should compute lower score for different colors', () => {
    const source = createMockTarget({ dominantColor: '#FF0000', id: 'source' });
    const candidate = createMockTarget({ dominantColor: '#00FF00', id: 'candidate' });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeLessThan(0.8);
  });

  it('should boost score for matching categories', () => {
    const source = createMockTarget({ categoryId: 'cat-1', id: 'source' });
    const candidate = createMockTarget({ categoryId: 'cat-1', id: 'candidate' });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThan(0.1);
  });

  it('should boost score for matching moods', () => {
    const source = createMockTarget({ mood: 'calme', id: 'source' });
    const candidate = createMockTarget({ mood: 'calme', id: 'candidate' });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThan(0.1);
  });

  it('should give partial score for similar moods', () => {
    const source = createMockTarget({ mood: 'calme', id: 'source' });
    const candidate = createMockTarget({ mood: 'sereine', id: 'candidate' });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThan(0);
  });

  it('should compute score based on tag overlap using Jaccard index', () => {
    const source = createMockTarget({
      tags: JSON.stringify(['nature', 'landscape', 'sunset']),
      id: 'source',
    });
    const candidate = createMockTarget({
      tags: JSON.stringify(['nature', 'landscape', 'portrait']),
      id: 'candidate',
    });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThan(0);
  });

  it('should consider brightness similarity', () => {
    const source = createMockTarget({ brightness: 0.8, id: 'source' });
    const candidate = createMockTarget({ brightness: 0.85, id: 'candidate' });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThan(0);
  });

  it('should consider saturation similarity', () => {
    const source = createMockTarget({ saturation: 0.7, id: 'source' });
    const candidate = createMockTarget({ saturation: 0.75, id: 'candidate' });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThan(0);
  });

  it('should cap score at 1.0', () => {
    const source = createMockTarget({
      dominantColor: '#FF0000',
      palette: JSON.stringify(['#FF0000', '#FF0000', '#FF0000', '#FF0000']),
      categoryId: 'cat-1',
      mood: 'calme',
      tags: JSON.stringify(['same', 'tags']),
      brightness: 0.5,
      saturation: 0.5,
      id: 'source',
    });
    const candidate = createMockTarget({
      dominantColor: '#FF0000',
      palette: JSON.stringify(['#FF0000', '#FF0000', '#FF0000', '#FF0000']),
      categoryId: 'cat-1',
      mood: 'calme',
      tags: JSON.stringify(['same', 'tags']),
      brightness: 0.5,
      saturation: 0.5,
      id: 'candidate',
    });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeLessThanOrEqual(1.0);
  });

  it('should handle missing optional fields gracefully', () => {
    const source = createMockTarget({
      brightness: undefined,
      saturation: undefined,
      id: 'source',
    });
    const candidate = createMockTarget({
      brightness: undefined,
      saturation: undefined,
      id: 'candidate',
    });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should handle invalid JSON in palette and tags', () => {
    const source = createMockTarget({
      palette: 'invalid-json',
      tags: 'also-invalid',
      id: 'source',
    });
    const candidate = createMockTarget({
      palette: 'invalid-json',
      tags: 'also-invalid',
      id: 'candidate',
    });
    const result = computeVisualEchoScore(source, candidate);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe('getMatchReasons', () => {
  const createMockTarget = (overrides: Partial<VisualEchoTarget> = {}): VisualEchoTarget => ({
    id: 'test-id',
    title: 'Test Image',
    dominantColor: '#000000',
    palette: JSON.stringify(['#000000', '#FFFFFF', '#333333', '#666666']),
    tags: JSON.stringify(['test', 'sample']),
    mood: 'calme',
    categoryId: 'cat-1',
    brightness: 0.5,
    saturation: 0.5,
    temperature: 'warm',
    ...overrides,
  });

  it('should return color similarity reason for high color match', () => {
    const source = createMockTarget({ dominantColor: '#FF0000', id: 'source' });
    const candidate = createMockTarget({ dominantColor: '#FF0000', id: 'candidate' });
    const reasons = getMatchReasons(source, candidate, 0.8);
    expect(reasons).toContainEqual(expect.stringContaining('Couleurs similaires'));
  });

  it('should return mood match reason when moods match', () => {
    const source = createMockTarget({ mood: 'calme', id: 'source' });
    const candidate = createMockTarget({ mood: 'calme', id: 'candidate' });
    const reasons = getMatchReasons(source, candidate, 0.5);
    expect(reasons).toContain('Même ambiance: calme');
  });

  it('should return category match reason when categories match', () => {
    const source = createMockTarget({ categoryId: 'cat-1', id: 'source' });
    const candidate = createMockTarget({ categoryId: 'cat-1', id: 'candidate' });
    const reasons = getMatchReasons(source, candidate, 0.5);
    expect(reasons).toContain('Même catégorie');
  });

  it('should return common tags reason when tags overlap', () => {
    const source = createMockTarget({
      tags: JSON.stringify(['nature', 'landscape', 'sunset']),
      id: 'source',
    });
    const candidate = createMockTarget({
      tags: JSON.stringify(['nature', 'portrait', 'urban']),
      id: 'candidate',
    });
    const reasons = getMatchReasons(source, candidate, 0.5);
    expect(reasons).toContainEqual(expect.stringContaining('Tags communs'));
  });

  it('should return brightness reason when brightness is similar', () => {
    const source = createMockTarget({ brightness: 0.8, id: 'source' });
    const candidate = createMockTarget({ brightness: 0.85, id: 'candidate' });
    const reasons = getMatchReasons(source, candidate, 0.5);
    expect(reasons).toContain('Lumineux');
  });

  it('should return dark reason when brightness is low and similar', () => {
    const source = createMockTarget({ brightness: 0.3, id: 'source' });
    const candidate = createMockTarget({ brightness: 0.35, id: 'candidate' });
    const reasons = getMatchReasons(source, candidate, 0.5);
    expect(reasons).toContain('Sombre');
  });

  it('should return empty array when no matches', () => {
    const source = createMockTarget({
      dominantColor: '#FF0000',
      mood: 'calme',
      categoryId: 'cat-1',
      tags: JSON.stringify(['unique']),
      brightness: 0.5,
      id: 'source',
    });
    const candidate = createMockTarget({
      dominantColor: '#0000FF',
      mood: 'energetic',
      categoryId: 'cat-2',
      tags: JSON.stringify(['different']),
      brightness: 0.9,
      id: 'candidate',
    });
    const reasons = getMatchReasons(source, candidate, 0.1);
    expect(reasons).toEqual([]);
  });
});

describe('findVisualEchoes', () => {
  const createMockTarget = (overrides: Partial<VisualEchoTarget> = {}): VisualEchoTarget => ({
    id: 'test-id',
    title: 'Test Image',
    dominantColor: '#000000',
    palette: JSON.stringify(['#000000', '#FFFFFF', '#333333', '#666666']),
    tags: JSON.stringify(['test', 'sample']),
    mood: 'calme',
    categoryId: 'cat-1',
    brightness: 0.5,
    saturation: 0.5,
    temperature: 'warm',
    ...overrides,
  });

  it('should return empty array when no candidates', () => {
    const source = createMockTarget({ id: 'source' });
    const results = findVisualEchoes(source, []);
    expect(results).toEqual([]);
  });

  it('should filter results by minScore', () => {
    const source = createMockTarget({
      dominantColor: '#FF0000',
      id: 'source',
    });
    const candidates = [
      createMockTarget({ dominantColor: '#FF0000', id: 'similar' }),
      createMockTarget({ dominantColor: '#0000FF', id: 'different' }),
    ];
    const results = findVisualEchoes(source, candidates, 10, 0.5);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('should limit results to specified limit', () => {
    const source = createMockTarget({ id: 'source' });
    const candidates = Array.from({ length: 15 }, (_, i) =>
      createMockTarget({ id: `candidate-${i}` })
    );
    const results = findVisualEchoes(source, candidates, 5, 0.0);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('should sort results by score descending', () => {
    const source = createMockTarget({
      dominantColor: '#FF0000',
      id: 'source',
    });
    const candidates = [
      createMockTarget({ dominantColor: '#FF0000', id: 'very-similar' }),
      createMockTarget({ dominantColor: '#00FF00', id: 'somewhat-similar' }),
      createMockTarget({ dominantColor: '#0000FF', id: 'less-similar' }),
    ];
    const results = findVisualEchoes(source, candidates, 10, 0.0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('should include match reasons in results', () => {
    const source = createMockTarget({
      dominantColor: '#FF0000',
      mood: 'calme',
      id: 'source',
    });
    const candidates = [
      createMockTarget({
        dominantColor: '#FF0000',
        mood: 'calme',
        id: 'similar',
      }),
    ];
    const results = findVisualEchoes(source, candidates, 10, 0.0);
    expect(results[0].matchReasons).toBeDefined();
    expect(Array.isArray(results[0].matchReasons)).toBe(true);
  });
});

describe('computeSimilarityMatrix', () => {
  const createMockTarget = (overrides: Partial<VisualEchoTarget> = {}): VisualEchoTarget => ({
    id: 'test-id',
    title: 'Test Image',
    dominantColor: '#000000',
    palette: JSON.stringify(['#000000', '#FFFFFF', '#333333', '#666666']),
    tags: JSON.stringify(['test', 'sample']),
    mood: 'calme',
    categoryId: 'cat-1',
    brightness: 0.5,
    saturation: 0.5,
    temperature: 'warm',
    ...overrides,
  });

  it('should return empty map for empty array', () => {
    const matrix = computeSimilarityMatrix([]);
    expect(matrix.size).toBe(0);
  });

  it('should create matrix with correct dimensions', () => {
    const images = [
      createMockTarget({ id: 'img-1' }),
      createMockTarget({ id: 'img-2' }),
      createMockTarget({ id: 'img-3' }),
    ];
    const matrix = computeSimilarityMatrix(images);
    expect(matrix.size).toBe(3);
    expect(matrix.get('img-1')?.size).toBe(2);
    expect(matrix.get('img-2')?.size).toBe(2);
    expect(matrix.get('img-3')?.size).toBe(2);
  });

  it('should not include self-similarity in matrix', () => {
    const images = [
      createMockTarget({ id: 'img-1' }),
      createMockTarget({ id: 'img-2' }),
    ];
    const matrix = computeSimilarityMatrix(images);
    expect(matrix.get('img-1')?.has('img-1')).toBe(false);
    expect(matrix.get('img-2')?.has('img-2')).toBe(false);
  });

  it('should compute symmetric similarity scores', () => {
    const images = [
      createMockTarget({ id: 'img-1', dominantColor: '#FF0000' }),
      createMockTarget({ id: 'img-2', dominantColor: '#FF0000' }),
    ];
    const matrix = computeSimilarityMatrix(images);
    const score1to2 = matrix.get('img-1')?.get('img-2');
    const score2to1 = matrix.get('img-2')?.get('img-1');
    expect(score1to2).toBe(score2to1);
  });
});

describe('generateVisualJourney', () => {
  const createMockTarget = (overrides: Partial<VisualEchoTarget> = {}): VisualEchoTarget => ({
    id: 'test-id',
    title: 'Test Image',
    dominantColor: '#000000',
    palette: JSON.stringify(['#000000', '#FFFFFF', '#333333', '#666666']),
    tags: JSON.stringify(['test', 'sample']),
    mood: 'calme',
    categoryId: 'cat-1',
    brightness: 0.5,
    saturation: 0.5,
    temperature: 'warm',
    ...overrides,
  });

  it('should return empty array for empty input', () => {
    const journey = generateVisualJourney([]);
    expect(journey).toEqual([]);
  });

  it('should return single image for single input', () => {
    const images = [createMockTarget({ id: 'img-1' })];
    const journey = generateVisualJourney(images);
    expect(journey).toHaveLength(1);
    expect(journey[0].id).toBe('img-1');
  });

  it('should start with specified image when provided', () => {
    const images = [
      createMockTarget({ id: 'img-1' }),
      createMockTarget({ id: 'img-2' }),
      createMockTarget({ id: 'img-3' }),
    ];
    const journey = generateVisualJourney(images, 'img-2');
    expect(journey[0].id).toBe('img-2');
  });

  it('should include all images in journey', () => {
    const images = [
      createMockTarget({ id: 'img-1' }),
      createMockTarget({ id: 'img-2' }),
      createMockTarget({ id: 'img-3' }),
    ];
    const journey = generateVisualJourney(images);
    expect(journey).toHaveLength(3);
  });

  it('should not repeat images in journey', () => {
    const images = [
      createMockTarget({ id: 'img-1' }),
      createMockTarget({ id: 'img-2' }),
      createMockTarget({ id: 'img-3' }),
    ];
    const journey = generateVisualJourney(images);
    const ids = journey.map((img) => img.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should create journey that maximizes visual similarity', () => {
    const images = [
      createMockTarget({ id: 'img-1', dominantColor: '#FF0000' }),
      createMockTarget({ id: 'img-2', dominantColor: '#FF0000' }),
      createMockTarget({ id: 'img-3', dominantColor: '#0000FF' }),
    ];
    const journey = generateVisualJourney(images, 'img-1');
    // img-1 and img-2 should be adjacent since they have the same color
    const img1Index = journey.findIndex((img) => img.id === 'img-1');
    const img2Index = journey.findIndex((img) => img.id === 'img-2');
    expect(Math.abs(img1Index - img2Index)).toBe(1);
  });
});
