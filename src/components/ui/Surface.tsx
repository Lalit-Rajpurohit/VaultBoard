import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme';

export interface SurfaceProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
  rounded?: boolean;
  bordered?: boolean;
}

/** A themed panel — the base container for cards, sheets and sections. */
export function Surface({
  elevated,
  padded,
  rounded = true,
  bordered = true,
  style,
  ...rest
}: SurfaceProps) {
  const t = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: elevated ? t.colors.elevated : t.colors.surface,
          borderRadius: rounded ? t.radii.lg : 0,
          borderWidth: bordered ? StyleSheetHairline : 0,
          borderColor: t.colors.border,
          padding: padded ? t.spacing.lg : 0,
        },
        elevated && t.shadow,
        style,
      ]}
    />
  );
}

// 1px on most devices; kept as a constant to avoid importing StyleSheet here.
const StyleSheetHairline = 1;
