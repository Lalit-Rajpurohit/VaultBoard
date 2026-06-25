import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  small?: boolean;
}

/** Pill used for tags, filters and labels. */
export function Chip({ label, selected, onPress, color, icon, small }: ChipProps) {
  const t = useTheme();
  const accent = color ?? t.colors.accent;
  const Wrapper: typeof Pressable | typeof View = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: small ? t.spacing.sm : t.spacing.md,
        paddingVertical: small ? 4 : 6,
        borderRadius: t.radii.pill,
        backgroundColor: selected ? accent : t.colors.overlay,
        borderWidth: 1,
        borderColor: selected ? accent : t.colors.border,
      }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={small ? 12 : 14}
          color={selected ? t.colors.onAccent : t.colors.textMuted}
        />
      )}
      {!icon && color && (
        <View
          style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: accent }}
        />
      )}
      <Text
        variant={small ? 'small' : 'caption'}
        weight="medium"
        style={{ color: selected ? t.colors.onAccent : t.colors.textMuted }}
      >
        {label}
      </Text>
    </Wrapper>
  );
}
