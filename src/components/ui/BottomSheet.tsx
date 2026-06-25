import React, { useEffect } from 'react';
import { Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useKeyboardHeight } from '@/hooks';
import { useTheme } from '@/theme';

import { Text } from './Text';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Lightweight slide-up sheet on a scrim. Tap scrim or swipe-down handle to close. */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);
  // Track the keyboard so the sheet (and its inputs) lift above it.
  const keyboardHeight = useKeyboardHeight();

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : height, { duration: 220 });
  }, [visible, height, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: t.colors.scrim }}
          onPress={onClose}
        />
        <Animated.View
          style={[
            sheetStyle,
            {
              backgroundColor: t.colors.elevated,
              borderTopLeftRadius: t.radii.xl,
              borderTopRightRadius: t.radii.xl,
              paddingHorizontal: t.spacing.xl,
              paddingTop: t.spacing.md,
              // When the keyboard is open, reserve its height so inputs stay visible.
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight + t.spacing.md
                  : insets.bottom + t.spacing.xl,
              maxHeight: '88%',
            },
          ]}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: t.colors.borderStrong,
              marginBottom: t.spacing.md,
            }}
          />
          {title ? (
            <Text variant="h2" weight="semibold" style={{ marginBottom: t.spacing.md }}>
              {title}
            </Text>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
