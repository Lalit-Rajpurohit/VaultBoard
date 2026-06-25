import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

export function Divider({ spacing = 0 }: { spacing?: number }) {
  const t = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: t.colors.border,
        marginVertical: spacing,
      }}
    />
  );
}
