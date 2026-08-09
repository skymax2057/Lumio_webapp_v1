import { describe, it, expect } from 'vitest';
import { extractColorAndMoodFromImage, type LumioColorAnalysis } from '@/lib/color-extractor';

describe('extractColorAndMoodFromImage', () => {
  it('should return a valid LumioColorAnalysis object', () => {
    const result = extractColorAndMoodFromImage('https://example.com/image.jpg');
    expect(result).toHaveProperty('dominantColor');
    expect(result).toHaveProperty('palette');
    expect(result).toHaveProperty('mood');
    expect(typeof result.dominantColor).toBe('string');
    expect(Array.isArray(result.palette)).toBe(true);
    expect(typeof result.mood).toBe('string');
  });

  it('should return a dominant color in hex format', () => {
    const result = extractColorAndMoodFromImage('https://example.com/image.jpg');
    expect(result.dominantColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should return a palette with exactly 4 colors', () => {
    const result = extractColorAndMoodFromImage('https://example.com/image.jpg');
    expect(result.palette).toHaveLength(4);
  });

  it('should return all palette colors in valid hex format', () => {
    const result = extractColorAndMoodFromImage('https://example.com/image.jpg');
    result.palette.forEach((color) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('should return a mood from the preset moods', () => {
    const presetMoods = ['calme', 'énergique', 'mystérieuse', 'sereine', 'minimaliste', 'vibrante', 'sombre', 'chaleureuse'];
    const result = extractColorAndMoodFromImage('https://example.com/image.jpg');
    expect(presetMoods).toContain(result.mood);
  });

  it('should be deterministic for the same URL', () => {
    const url = 'https://example.com/image.jpg';
    const result1 = extractColorAndMoodFromImage(url);
    const result2 = extractColorAndMoodFromImage(url);
    expect(result1).toEqual(result2);
  });

  it('should produce different results for different URLs', () => {
    const result1 = extractColorAndMoodFromImage('https://example.com/image1.jpg');
    const result2 = extractColorAndMoodFromImage('https://example.com/image2.jpg');
    // While there's a small chance of collision, with different URLs we expect different results
    const resultsEqual = 
      result1.dominantColor === result2.dominantColor &&
      result1.mood === result2.mood &&
      JSON.stringify(result1.palette) === JSON.stringify(result2.palette);
    expect(resultsEqual).toBe(false);
  });

  it('should handle empty string URL', () => {
    const result = extractColorAndMoodFromImage('');
    expect(result).toHaveProperty('dominantColor');
    expect(result).toHaveProperty('palette');
    expect(result).toHaveProperty('mood');
  });

  it('should handle special characters in URL', () => {
    const result = extractColorAndMoodFromImage('https://example.com/image-with-special-chars_123.jpg?size=large');
    expect(result).toHaveProperty('dominantColor');
    expect(result).toHaveProperty('palette');
    expect(result).toHaveProperty('mood');
  });

  it('should handle very long URLs', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '/image.jpg';
    const result = extractColorAndMoodFromImage(longUrl);
    expect(result).toHaveProperty('dominantColor');
    expect(result).toHaveProperty('palette');
    expect(result).toHaveProperty('mood');
  });

  it('should handle URLs with similar paths differently', () => {
    const result1 = extractColorAndMoodFromImage('https://example.com/images/image.jpg');
    const result2 = extractColorAndMoodFromImage('https://example.com/images/image.png');
    // Even with similar paths, the extension difference should produce different results
    // We check that at least one property differs
    const resultsEqual = 
      result1.dominantColor === result2.dominantColor &&
      result1.mood === result2.mood &&
      JSON.stringify(result1.palette) === JSON.stringify(result2.palette);
    expect(resultsEqual).toBe(false);
  });

  it('should return dominant color that exists in palette', () => {
    const result = extractColorAndMoodFromImage('https://example.com/image.jpg');
    expect(result.palette).toContain(result.dominantColor);
  });

  it('should produce consistent palette selection', () => {
    const url = 'https://example.com/test-image.jpg';
    const result1 = extractColorAndMoodFromImage(url);
    const result2 = extractColorAndMoodFromImage(url);
    expect(result1.palette).toEqual(result2.palette);
  });

  it('should handle URLs without protocol', () => {
    const result = extractColorAndMoodFromImage('example.com/image.jpg');
    expect(result).toHaveProperty('dominantColor');
    expect(result).toHaveProperty('palette');
    expect(result).toHaveProperty('mood');
  });

  it('should handle data URLs', () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD';
    const result = extractColorAndMoodFromImage(dataUrl);
    expect(result).toHaveProperty('dominantColor');
    expect(result).toHaveProperty('palette');
    expect(result).toHaveProperty('mood');
  });

  it('should handle relative paths', () => {
    const result = extractColorAndMoodFromImage('/images/local-image.jpg');
    expect(result).toHaveProperty('dominantColor');
    expect(result).toHaveProperty('palette');
    expect(result).toHaveProperty('mood');
  });

  it('should be case-sensitive for URLs', () => {
    const result1 = extractColorAndMoodFromImage('https://example.com/image.jpg');
    const result2 = extractColorAndMoodFromImage('https://example.com/IMAGE.jpg');
    expect(result1).not.toEqual(result2);
  });

  it('should produce valid color palette structure', () => {
    const result = extractColorAndMoodFromImage('https://example.com/image.jpg');
    expect(result.palette).toBeInstanceOf(Array);
    expect(result.palette.length).toBeGreaterThan(0);
    result.palette.forEach(color => {
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
