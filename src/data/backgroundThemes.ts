export interface LyricBackgroundTheme {
  id: string;
  name: string;
  nameTa: string;
  description: string;
  category: 'dark' | 'vibrant' | 'ambient' | 'nature' | 'warm' | 'light';
  backgroundStyle: string; // CSS background value (gradient or solid)
  textColor: string; // Text color hex
  textShadow?: string; // Text shadow for crisp legibility over gradients
  previewBg: string; // Mini swatch preview CSS background
  accentColor: string; // Accent color hex
  tag: string;
}

export const LYRIC_BACKGROUND_THEMES: LyricBackgroundTheme[] = [
  {
    id: 'midnight-sanctuary',
    name: 'Midnight Sanctuary',
    nameTa: 'ஆலயம் (Midnight)',
    description: 'Deep obsidian navy with subtle sapphire vignette',
    category: 'dark',
    backgroundStyle: 'radial-gradient(ellipse at 50% 30%, #172554 0%, #0f172a 50%, #020617 100%)',
    textColor: '#ffffff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(30,58,138,0.4)',
    previewBg: 'linear-gradient(135deg, #172554, #020617)',
    accentColor: '#38bdf8',
    tag: 'Classic',
  },
  {
    id: 'heavenly-dawn',
    name: 'Heavenly Dawn',
    nameTa: 'விடியற்காலை (Sunrise)',
    description: 'Celestial amber, rose, and golden morning glory',
    category: 'warm',
    backgroundStyle: 'linear-gradient(135deg, #1e1b4b 0%, #4c0519 35%, #831843 65%, #d97706 100%)',
    textColor: '#ffffff',
    textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 20px rgba(217,119,6,0.3)',
    previewBg: 'linear-gradient(135deg, #4c0519, #d97706)',
    accentColor: '#f59e0b',
    tag: 'Dawn',
  },
  {
    id: 'royal-sapphire',
    name: 'Royal Sapphire',
    nameTa: 'ராஜ நீலம் (Sapphire)',
    description: 'Deep majestic sapphire & vibrant cobalt aura',
    category: 'vibrant',
    backgroundStyle: 'radial-gradient(circle at 50% 35%, #1d4ed8 0%, #1e1b4b 50%, #030712 100%)',
    textColor: '#f8fafc',
    textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 25px rgba(29,78,216,0.5)',
    previewBg: 'linear-gradient(135deg, #1d4ed8, #030712)',
    accentColor: '#60a5fa',
    tag: 'Majestic',
  },
  {
    id: 'emerald-grace',
    name: 'Emerald Grace',
    nameTa: 'பச்சை அருள் (Emerald)',
    description: 'Rich forest emerald velvet & deep teal ambiance',
    category: 'nature',
    backgroundStyle: 'radial-gradient(ellipse at 50% 25%, #047857 0%, #064e3b 40%, #022c22 75%, #020617 100%)',
    textColor: '#f0fdf4',
    textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(4,120,87,0.4)',
    previewBg: 'linear-gradient(135deg, #047857, #022c22)',
    accentColor: '#34d399',
    tag: 'Peace',
  },
  {
    id: 'purple-praise',
    name: 'Purple Praise',
    nameTa: 'துதி ஊதா (Amethyst)',
    description: 'Majestic royal amethyst and twilight lilac glow',
    category: 'ambient',
    backgroundStyle: 'linear-gradient(145deg, #3b0764 0%, #581c87 40%, #2e1065 75%, #090514 100%)',
    textColor: '#faf5ff',
    textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 0 20px rgba(168,85,247,0.3)',
    previewBg: 'linear-gradient(135deg, #581c87, #090514)',
    accentColor: '#c084fc',
    tag: 'Worship',
  },
  {
    id: 'golden-glory',
    name: 'Golden Glory',
    nameTa: 'பொன் மகிமை (Golden)',
    description: 'Warm candlelight golden bronze & deep espresso amber',
    category: 'warm',
    backgroundStyle: 'radial-gradient(circle at 50% 35%, #92400e 0%, #451a03 50%, #0c0a09 100%)',
    textColor: '#fef08a',
    textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 25px rgba(234,179,8,0.35)',
    previewBg: 'linear-gradient(135deg, #92400e, #0c0a09)',
    accentColor: '#fbbf24',
    tag: 'Glory',
  },
  {
    id: 'ocean-worship',
    name: 'Ocean Waves',
    nameTa: 'கடலின் ஆழம் (Ocean)',
    description: 'Serene deep oceanic teal & cyan marine depth',
    category: 'nature',
    backgroundStyle: 'linear-gradient(135deg, #0e7490 0%, #0f766e 40%, #042f2e 75%, #020617 100%)',
    textColor: '#f0fdfa',
    textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(14,116,144,0.4)',
    previewBg: 'linear-gradient(135deg, #0e7490, #042f2e)',
    accentColor: '#2dd4bf',
    tag: 'Serene',
  },
  {
    id: 'crimson-communion',
    name: 'Crimson Communion',
    nameTa: 'இரத்தத்தின் உடன்படிக்கை (Ruby)',
    description: 'Deep communion ruby wine & burgundy velvet',
    category: 'warm',
    backgroundStyle: 'radial-gradient(circle at 50% 30%, #9f1239 0%, #4c0519 55%, #09050d 100%)',
    textColor: '#fff1f2',
    textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 0 20px rgba(225,29,72,0.4)',
    previewBg: 'linear-gradient(135deg, #9f1239, #09050d)',
    accentColor: '#fb7185',
    tag: 'Sacred',
  },
  {
    id: 'starlight-cosmos',
    name: 'Starlight Cosmos',
    nameTa: 'விண்மீன் (Cosmos)',
    description: 'Deep cosmic midnight with stellar indigo stardust sheen',
    category: 'dark',
    backgroundStyle: 'radial-gradient(ellipse at bottom, #312e81 0%, #1e1b4b 40%, #020617 100%)',
    textColor: '#f1f5f9',
    textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 0 15px rgba(99,102,241,0.4)',
    previewBg: 'linear-gradient(135deg, #312e81, #020617)',
    accentColor: '#818cf8',
    tag: 'Cosmic',
  },
  {
    id: 'clean-parchment',
    name: 'Clean Parchment',
    nameTa: 'வெள்ளைக் காகிதம் (Daylight)',
    description: 'Crisp daylight canvas with gentle contrast for illuminated halls',
    category: 'light',
    backgroundStyle: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 45%, #e2e8f0 100%)',
    textColor: '#0f172a',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
    previewBg: 'linear-gradient(135deg, #ffffff, #cbd5e1)',
    accentColor: '#3b82f6',
    tag: 'Daylight',
  }
];

export const DEFAULT_BACKGROUND_THEME_ID = 'midnight-sanctuary';

export function getBackgroundTheme(id?: string): LyricBackgroundTheme {
  if (!id) return LYRIC_BACKGROUND_THEMES[0];
  const found = LYRIC_BACKGROUND_THEMES.find(t => t.id === id);
  return found || LYRIC_BACKGROUND_THEMES[0];
}

export function getRandomBackgroundTheme(excludeId?: string): LyricBackgroundTheme {
  const filtered = excludeId 
    ? LYRIC_BACKGROUND_THEMES.filter(t => t.id !== excludeId)
    : LYRIC_BACKGROUND_THEMES;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || LYRIC_BACKGROUND_THEMES[0];
}
