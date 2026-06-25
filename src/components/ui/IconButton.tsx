import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme';

export interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: string;
  filled?: boolean;
  accessibilityLabel?: string;
}

export function IconButton({
  name,
  onPress,
  size = 22,
  color,
  filled,
  accessibilityLabel,
}: IconButtonProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: t.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: filled ? t.colors.overlay : 'transparent',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={name} size={size} color={color ?? t.colors.text} />
    </Pressable>
  );
}
