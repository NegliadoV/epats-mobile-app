/* Дизайн-токены — 1-в-1 из src/app/globals.css сайта */

type Gradient = readonly [string, string, ...string[]];

export interface Colors {
  bgPrimary: string; bgSecondary: string; bgCard: string; bgCardHover: string; navBg: string;
  border: string; borderAccent: string; accent: string; accentLight: string; accentGlow: string;
  gold: string; coral: string; pink: string; orchid: string; tg: string; danger: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  sunset: Gradient; sunsetSoft: Gradient; lagoon: Gradient; glow: Gradient; shadow: string;
}

export type ThemeName = 'dark' | 'light';

export const palette: Record<ThemeName, Colors> = {
  dark: {
    bgPrimary: '#120b1e',
    bgSecondary: '#1a1030',
    bgCard: '#1c1233',
    bgCardHover: '#241843',
    navBg: 'rgba(18,11,30,0.82)',
    border: 'rgba(255,255,255,0.08)',
    borderAccent: 'rgba(255,107,74,0.55)',
    accent: '#1fd1c1',
    accentLight: '#5eead4',
    accentGlow: 'rgba(31,209,193,0.14)',
    gold: '#ffb547',
    coral: '#ff6b4a',
    pink: '#ff9a3c',
    orchid: '#b46bff',
    tg: '#2aabee',
    danger: '#ef4444',
    textPrimary: '#fbf4ff',
    textSecondary: '#c4b5d9',
    textMuted: '#7c6c96',
    sunset: ['#ff6b4a', '#ff9a3c', '#ffb547'] as const,
    sunsetSoft: ['rgba(255,107,74,0.18)', 'rgba(255,154,60,0.14)', 'rgba(255,181,71,0.16)'] as const,
    lagoon: ['#1fd1c1', '#3b82f6'] as const,
    glow: ['rgba(180,107,255,0.22)', 'rgba(18,11,30,0)'] as const,
    shadow: '#000000',
  },
  light: {
    bgPrimary: '#fff7ec',
    bgSecondary: '#fffdf8',
    bgCard: '#ffffff',
    bgCardHover: '#fffaf2',
    navBg: 'rgba(255,247,236,0.88)',
    border: 'rgba(90,50,20,0.10)',
    borderAccent: 'rgba(255,154,60,0.45)',
    accent: '#0fa89a',
    accentLight: '#14b8a6',
    accentGlow: 'rgba(15,168,154,0.10)',
    gold: '#e08a00',
    coral: '#f2542d',
    pink: '#e8730a',
    orchid: '#8b3dff',
    tg: '#2aabee',
    danger: '#dc2626',
    textPrimary: '#2a1630',
    textSecondary: '#5b4660',
    textMuted: '#a08a94',
    sunset: ['#f2542d', '#e8730a', '#f59e0b'] as const,
    sunsetSoft: ['rgba(242,84,45,0.10)', 'rgba(232,115,10,0.08)', 'rgba(245,158,11,0.10)'] as const,
    lagoon: ['#0fa89a', '#2563eb'] as const,
    glow: ['rgba(255,154,60,0.18)', 'rgba(255,247,236,0)'] as const,
    shadow: '#783c14',
  },
};


export const fonts = {
  display: 'Unbounded_800ExtraBold',
  displaySemi: 'Unbounded_600SemiBold',
  body: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyHeavy: 'Manrope_800ExtraBold',
};

export const radius = { sm: 8, md: 14, lg: 18, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
