import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme, type Theme } from './ThemeProvider';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Builds a StyleSheet from a factory that receives the active theme, memoised
 * so styles only rebuild when the theme actually changes.
 *
 *   const styles = useThemedStyles((t) => ({ root: { backgroundColor: t.colors.bg } }));
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
