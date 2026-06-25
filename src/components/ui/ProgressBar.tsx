import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 6 }: ProgressBarProps) {
  const t = useTheme();
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View
      style={{
        height,
        borderRadius: height,
        backgroundColor: t.colors.overlay,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: color ?? t.colors.accent,
        }}
      />
    </View>
  );
}
