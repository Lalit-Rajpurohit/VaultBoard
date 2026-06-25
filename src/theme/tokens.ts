import type { AccentKey, TypographyScale } from '@/types';

/** 4-pt spacing grid. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

/** Accent palettes — each provides a base + a soft tint for chips/wash. */
export const accents: Record<AccentKey, { base: string; soft: string; on: string }> = {
  indigo: { base: '#6D7CFF', soft: 'rgba(109,124,255,0.16)', on: '#FFFFFF' },
  emerald: { base: '#34D399', soft: 'rgba(52,211,153,0.16)', on: '#06281D' },
  amber: { base: '#F5A623', soft: 'rgba(245,166,35,0.16)', on: '#3A2602' },
  rose: { base: '#FB7185', soft: 'rgba(251,113,133,0.16)', on: '#3A0A12' },
  violet: { base: '#A78BFA', soft: 'rgba(167,139,250,0.16)', on: '#1E0F3A' },
};

export const accentKeys = Object.keys(accents) as AccentKey[];

/** Semantic priority colors (shared across light/dark). */
export const priorityColors = {
  0: '#9AA0AE',
  1: '#5AA9E6',
  2: '#F5A623',
  3: '#FF6B6B',
} as const;

/** Base font sizes, adjusted by the user's typography scale. */
const baseType = {
  display: 28,
  h1: 22,
  h2: 18,
  body: 15,
  caption: 13,
  small: 11,
} as const;

const scaleDelta: Record<TypographyScale, number> = {
  compact: -1,
  default: 0,
  comfortable: 2,
};

export type TypographyTokens = {
  display: number;
  h1: number;
  h2: number;
  body: number;
  caption: number;
  small: number;
  weight: { regular: '400'; medium: '500'; semibold: '600'; bold: '700' };
};

export function buildTypography(scale: TypographyScale): TypographyTokens {
  const d = scaleDelta[scale];
  return {
    display: baseType.display + d,
    h1: baseType.h1 + d,
    h2: baseType.h2 + d,
    body: baseType.body + d,
    caption: baseType.caption + d,
    small: baseType.small + d,
    weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  };
}
