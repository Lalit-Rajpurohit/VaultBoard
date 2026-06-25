/** Light & dark color surfaces. Accent is layered in by the ThemeProvider. */

export interface Palette {
  scheme: 'light' | 'dark';
  bg: string;
  surface: string;
  elevated: string;
  overlay: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  borderStrong: string;
  // Status / semantic
  success: string;
  warning: string;
  danger: string;
  // Scrim used behind sheets/modals
  scrim: string;
}

export const darkPalette: Palette = {
  scheme: 'dark',
  bg: '#0E0F13',
  surface: '#16181F',
  elevated: '#1C1F28',
  overlay: '#23262F',
  text: '#ECEDF1',
  textMuted: '#9AA0AE',
  textFaint: '#646A78',
  border: '#262A35',
  borderStrong: '#333845',
  success: '#34D399',
  warning: '#F5A623',
  danger: '#FF6B6B',
  scrim: 'rgba(0,0,0,0.6)',
};

export const lightPalette: Palette = {
  scheme: 'light',
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  overlay: '#F1F3F7',
  text: '#1A1C22',
  textMuted: '#5C6270',
  textFaint: '#9097A4',
  border: '#E6E9EF',
  borderStrong: '#D6DAE2',
  success: '#0F9D63',
  warning: '#C77700',
  danger: '#E0405A',
  scrim: 'rgba(20,22,28,0.4)',
};
