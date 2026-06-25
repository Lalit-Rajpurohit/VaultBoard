import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, type PressableProps, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title?: string;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  fullWidth,
  disabled,
  ...rest
}: ButtonProps) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const pad = size === 'sm' ? t.spacing.sm : size === 'lg' ? t.spacing.lg : t.spacing.md;
  const height = size === 'sm' ? 36 : size === 'lg' ? 54 : 46;

  const bg: Record<Variant, string> = {
    primary: t.colors.accent,
    secondary: t.colors.overlay,
    ghost: 'transparent',
    danger: t.colors.danger,
  };
  const fg: Record<Variant, string> = {
    primary: t.colors.onAccent,
    secondary: t.colors.text,
    ghost: t.colors.accent,
    danger: '#FFFFFF',
  };

  return (
    <Animated.View style={[animStyle, fullWidth && { width: '100%' }]}>
      <Pressable
        {...rest}
        disabled={disabled || loading}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 90 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
        style={{
          height,
          paddingHorizontal: pad + 4,
          borderRadius: t.radii.md,
          backgroundColor: bg[variant],
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: t.colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.spacing.sm,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={fg[variant]} size="small" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
            {icon && <Ionicons name={icon} size={18} color={fg[variant]} />}
            {title ? (
              <Text weight="semibold" style={{ color: fg[variant] }}>
                {title}
              </Text>
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
