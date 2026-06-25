import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export interface SegmentedProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.colors.overlay,
        borderRadius: t.radii.md,
        padding: 3,
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: t.radii.sm,
              alignItems: 'center',
              backgroundColor: active ? t.colors.surface : 'transparent',
              ...(active ? t.shadow : {}),
            }}
          >
            <Text
              variant="caption"
              weight={active ? 'semibold' : 'medium'}
              tone={active ? 'default' : 'muted'}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
