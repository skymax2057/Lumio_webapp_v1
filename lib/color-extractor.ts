export interface LumioColorAnalysis {
  dominantColor: string;
  palette: string[];
  mood: string;
}

const PRESET_MOODS = [
  'calme',
  'énergique',
  'mystérieuse',
  'sereine',
  'minimaliste',
  'vibrante',
  'sombre',
  'chaleureuse'
];

export function extractColorAndMoodFromImage(imageUrl: string): LumioColorAnalysis {
  // Deterministic fallback color generation based on image string
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    hash = imageUrl.charCodeAt(i) + ((hash << 5) - hash);
  }

  const moodIndex = Math.abs(hash) % PRESET_MOODS.length;
  const mood = PRESET_MOODS[moodIndex];

  const goldPalette = ['#0A0A0B', '#D4AF37', '#252530', '#E2E8F0'];
  const warmPalette = ['#1E1B18', '#C5A059', '#8C7243', '#F5F5F0'];
  const azurePalette = ['#0F172A', '#38BDF8', '#1E293B', '#F8FAFC'];
  const emeraldPalette = ['#064E3B', '#10B981', '#022C22', '#ECFDF5'];
  const sunsetPalette = ['#7C2D12', '#F97316', '#451A03', '#FFF7ED'];
  const violetPalette = ['#2D124D', '#9333EA', '#3B0764', '#F3E8FF'];

  const palettes = [goldPalette, warmPalette, azurePalette, emeraldPalette, sunsetPalette, violetPalette];
  const selectedPalette = palettes[Math.abs(hash) % palettes.length];

  return {
    dominantColor: selectedPalette[1],
    palette: selectedPalette,
    mood,
  };
}
