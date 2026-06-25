import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { useTheme } from '@/theme';

export interface SwipeAction {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

export interface SwipeRowProps {
  children: React.ReactNode;
  left?: SwipeAction;
  right?: SwipeAction;
}

/** Row with swipe-to-reveal actions (pin/favorite on the left, delete on the right). */
export function SwipeRow({ children, left, right }: SwipeRowProps) {
  const t = useTheme();
  const ref = useRef<Swipeable>(null);

  const renderAction = (action: SwipeAction, align: 'flex-start' | 'flex-end') => (
    <Pressable
      onPress={() => {
        ref.current?.close();
        action.onPress();
      }}
      style={{
        backgroundColor: action.color,
        justifyContent: 'center',
        alignItems: align === 'flex-end' ? 'flex-end' : 'flex-start',
        flex: 1,
        paddingHorizontal: t.spacing.xl,
        borderRadius: t.radii.lg,
      }}
    >
      <Ionicons name={action.icon} size={22} color="#FFFFFF" />
    </Pressable>
  );

  return (
    <Swipeable
      ref={ref}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={
        left
          ? () => <View style={{ flex: 1 }}>{renderAction(left, 'flex-start')}</View>
          : undefined
      }
      renderRightActions={
        right
          ? () => <View style={{ flex: 1 }}>{renderAction(right, 'flex-end')}</View>
          : undefined
      }
    >
      {children}
    </Swipeable>
  );
}
