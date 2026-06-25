import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useSettings } from '@/store';
import type { AccentKey } from '@/types';

import { darkPalette, lightPalette, type Palette } from './palettes';
import {
  spacing,
  radii,
  accents,
  priorityColors,
  buildTypography,
  type TypographyTokens,
} from './tokens';

export interface Theme {
  colors: Palette & {
    accent: string;
    accentSoft: string;
    onAccent: string;
    priority: typeof priorityColors;
  };
  spacing: typeof spacing;
  radii: typeof radii;
  typography: TypographyTokens;
  isDark: boolean;
  accentKey: AccentKey;
  /** Soft elevation shadow preset (subtle on dark, real on light). */
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = useSettings((s) => s.themeMode);
  const accent = useSettings((s) => s.accent);
  const typographyScale = useSettings((s) => s.typography);

  const theme = useMemo<Theme>(() => {
    const resolved =
      themeMode === 'system' ? (systemScheme ?? 'dark') : themeMode;
    const isDark = resolved === 'dark';
    const palette = isDark ? darkPalette : lightPalette;
    const a = accents[accent];

    return {
      colors: {
        ...palette,
        accent: a.base,
        accentSoft: a.soft,
        onAccent: a.on,
        priority: priorityColors,
      },
      spacing,
      radii,
      typography: buildTypography(typographyScale),
      isDark,
      accentKey: accent,
      shadow: isDark
        ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 4,
          }
        : {
            shadowColor: '#1A1C22',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: 3,
          },
    };
  }, [themeMode, systemScheme, accent, typographyScale]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
