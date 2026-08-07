/**
 * Advanced Color Extraction using Canvas API
 * Analyzes actual image pixels to extract dominant colors and generate moods
 */

export interface ColorPalette {
  dominantColor: string;
  palette: string[];
  accentColors: string[];
  brightness: number;
  saturation: number;
  temperature: 'warm' | 'cool' | 'neutral';
}

export interface LumioColorAnalysis {
  dominantColor: string;
  palette: string[];
  mood: string;
  brightness: number;
  saturation: number;
  temperature: 'warm' | 'cool' | 'neutral';
}

// Mood mapping based on color characteristics
const MOOD_PROFILES = {
  warm_bright: { mood: 'énergique', description: 'Couleurs chaudes et lumineuses' },
  warm_dark: { mood: 'chaleureuse', description: 'Couleurs chaudes et sombres' },
  cool_bright: { mood: 'sereine', description: 'Couleurs froides et lumineuses' },
  cool_dark: { mood: 'mystérieuse', description: 'Couleurs froides et sombres' },
  neutral_bright: { mood: 'minimaliste', description: 'Couleurs neutres et lumineuses' },
  neutral_dark: { mood: 'sombre', description: 'Couleurs neutres et sombres' },
  high_saturation: { mood: 'vibrante', description: 'Couleurs très saturées' },
  low_saturation: { mood: 'calme', description: 'Couleurs désaturées' },
};

/**
 * Convert RGB to HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Convert HEX to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Calculate brightness of a color (0-1)
 */
function getBrightness(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Calculate saturation of a color (0-1)
 */
function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  return max === 0 ? 0 : delta / max;
}

/**
 * Determine color temperature
 */
function getTemperature(r: number, g: number, b: number): 'warm' | 'cool' | 'neutral' {
  // Warm colors have more red/yellow, cool colors have more blue
  const warmThreshold = r - b;
  if (warmThreshold > 30) return 'warm';
  if (warmThreshold < -30) return 'cool';
  return 'neutral';
}

/**
 * Quantize colors using a simplified octree approach
 * Reduces millions of colors to a manageable palette
 */
function quantizeColors(pixels: Uint8ClampedArray, colorCount: number = 8): string[] {
  const colorMap = new Map<string, number>();
  
  // Sample pixels (every 4th pixel for performance)
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Quantize to reduce color space (round to nearest 32)
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    
    const key = `${qr},${qg},${qb}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }
  
  // Sort by frequency and take top colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount * 2)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return { r, g, b, hex: rgbToHex(r, g, b) };
    });
  
  // Further reduce to exact colorCount using k-means-like clustering
  if (sortedColors.length <= colorCount) {
    return sortedColors.map(c => c.hex);
  }
  
  // Simple clustering: pick most distant colors
  const result = [sortedColors[0].hex];
  
  for (let i = 1; i < sortedColors.length && result.length < colorCount; i++) {
    const color = sortedColors[i];
    let minDistance = Infinity;
    
    for (const existing of result) {
      const existingRgb = hexToRgb(existing);
      const distance = Math.sqrt(
        Math.pow(color.r - existingRgb.r, 2) +
        Math.pow(color.g - existingRgb.g, 2) +
        Math.pow(color.b - existingRgb.b, 2)
      );
      minDistance = Math.min(minDistance, distance);
    }
    
    // Only add if sufficiently different
    if (minDistance > 80) {
      result.push(color.hex);
    }
  }
  
  // If we still don't have enough, add the most frequent remaining
  while (result.length < colorCount) {
    for (const color of sortedColors) {
      if (!result.includes(color.hex)) {
        result.push(color.hex);
        break;
      }
    }
  }
  
  return result;
}

/**
 * Extract colors from an image element
 */
export function extractColorsFromImageElement(
  img: HTMLImageElement,
  maxColors: number = 8
): ColorPalette {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Resize for performance (max 100x100 for analysis)
  const maxDim = 100;
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  
  // Extract quantized colors
  const palette = quantizeColors(pixels, maxColors);
  
  // Calculate overall brightness and saturation
  let totalBrightness = 0;
  let totalSaturation = 0;
  let totalR = 0, totalG = 0, totalB = 0;
  let pixelCount = 0;
  
  for (let i = 0; i < pixels.length; i += 16) {
    const a = pixels[i + 3];
    if (a < 128) continue;
    
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    totalBrightness += getBrightness(r, g, b);
    totalSaturation += getSaturation(r, g, b);
    totalR += r;
    totalG += g;
    totalB += b;
    pixelCount++;
  }
  
  const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0.5;
  const avgSaturation = pixelCount > 0 ? totalSaturation / pixelCount : 0.5;
  const avgR = pixelCount > 0 ? totalR / pixelCount : 128;
  const avgG = pixelCount > 0 ? totalG / pixelCount : 128;
  const avgB = pixelCount > 0 ? totalB / pixelCount : 128;
  
  const temperature = getTemperature(avgR, avgG, avgB);
  
  // Dominant color is the most frequent
  const dominantColor = palette[0] || '#131317';
  
  // Accent colors are the most different from dominant
  const dominantRgb = hexToRgb(dominantColor);
  const accentColors = palette.slice(1).filter((color, index) => {
    if (index >= 3) return false;
    const rgb = hexToRgb(color);
    const distance = Math.sqrt(
      Math.pow(rgb.r - dominantRgb.r, 2) +
      Math.pow(rgb.g - dominantRgb.g, 2) +
      Math.pow(rgb.b - dominantRgb.b, 2)
    );
    return distance > 50;
  });
  
  return {
    dominantColor,
    palette,
    accentColors,
    brightness: avgBrightness,
    saturation: avgSaturation,
    temperature,
  };
}

/**
 * Determine mood based on color characteristics
 */
export function determineMood(
  brightness: number,
  saturation: number,
  temperature: 'warm' | 'cool' | 'neutral'
): string {
  // High saturation takes priority
  if (saturation > 0.6) {
    return MOOD_PROFILES.high_saturation.mood;
  }
  if (saturation < 0.3) {
    return MOOD_PROFILES.low_saturation.mood;
  }
  
  // Then brightness and temperature
  const brightnessLevel = brightness > 0.6 ? 'bright' : 'dark';
  
  if (temperature === 'warm') {
    return MOOD_PROFILES[`warm_${brightnessLevel}`].mood;
  }
  if (temperature === 'cool') {
    return MOOD_PROFILES[`cool_${brightnessLevel}`].mood;
  }
  
  return MOOD_PROFILES[`neutral_${brightnessLevel}`].mood;
}

/**
 * Main function to analyze an image URL
 * Returns a promise with the color analysis
 */
export async function analyzeImageFromUrl(imageUrl: string): Promise<LumioColorAnalysis> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const palette = extractColorsFromImageElement(img);
        const mood = determineMood(palette.brightness, palette.saturation, palette.temperature);
        
        resolve({
          dominantColor: palette.dominantColor,
          palette: palette.palette,
          mood,
          brightness: palette.brightness,
          saturation: palette.saturation,
          temperature: palette.temperature,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Generate a harmonious color scheme from a dominant color
 */
export function generateColorScheme(baseColor: string): {
  complementary: string;
  analogous: string[];
  triadic: string[];
  monochromatic: string[];
} {
  const rgb = hexToRgb(baseColor);
  
  // Convert to HSL
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  // Helper to convert HSL back to hex
  function hslToHex(hue: number, sat: number, light: number): string {
    let r, g, b;
    
    if (sat === 0) {
      r = g = b = light;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
  }
  
  // Complementary (180°)
  const complementary = hslToHex((h + 0.5) % 1, s, l);
  
  // Analogous (±30°)
  const analogous = [
    hslToHex((h + 0.083) % 1, s, l),
    hslToHex((h - 0.083 + 1) % 1, s, l),
  ];
  
  // Triadic (120° apart)
  const triadic = [
    hslToHex((h + 0.333) % 1, s, l),
    hslToHex((h + 0.666) % 1, s, l),
  ];
  
  // Monochromatic (same hue, different lightness)
  const monochromatic = [
    hslToHex(h, s, Math.max(0, l - 0.3)),
    hslToHex(h, s, Math.min(1, l + 0.2)),
    hslToHex(h, Math.max(0, s - 0.3), l),
  ];
  
  return { complementary, analogous, triadic, monochromatic };
}