import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { Priority } from '@/types';

export function PriorityDot({ priority, size = 8 }: { priority: Priority; size?: number }) {
  const t = useTheme();
  if (priority === 0) return null;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: t.colors.priority[priority],
      }}
    />
  );
}
