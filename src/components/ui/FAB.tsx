import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme';

export interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** Floating action button — the one-tap capture entry point. */
export function FAB({ onPress, icon = 'add' }: FABProps) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          right: t.spacing.xl,
          bottom: t.spacing.xl,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.92))}
        onPressOut={() => (scale.value = withSpring(1))}
        accessibilityLabel="Quick add"
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: t.colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: t.colors.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 14,
          elevation: 8,
        }}
      >
        <Ionicons name={icon} size={28} color={t.colors.onAccent} />
      </Pressable>
    </Animated.View>
  );
}
