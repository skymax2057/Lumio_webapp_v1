import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCompactNumber(number: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

export function hexToRgb(hex: string) {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Calculate color similarity distance (0 to 1, higher means closer match)
export function calculateColorDistance(hex1: string, hex2: string): number {
  try {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);

    const deltaR = c1.r - c2.r;
    const deltaG = c1.g - c2.g;
    const deltaB = c1.b - c2.b;

    // Euclidean distance in RGB space max ~441
    const distance = Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
    const similarity = Math.max(0, 1 - distance / 441.67);
    return similarity;
  } catch {
    return 0.5;
  }
}
