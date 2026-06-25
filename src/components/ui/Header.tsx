import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  large?: boolean;
}

/** Screen header. Large variant for top-level tabs, compact for detail screens. */
export function Header({ title, subtitle, onBack, right, large }: HeaderProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.sm,
        paddingHorizontal: t.spacing.xl,
        paddingVertical: t.spacing.md,
        minHeight: 52,
      }}
    >
      {onBack ? <IconButton name="chevron-back" onPress={onBack} /> : null}
      <View style={{ flex: 1 }}>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
        {title ? (
          <Text variant={large ? 'display' : 'h1'} weight="bold" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>
      {right ? <View style={{ flexDirection: 'row', gap: 4 }}>{right}</View> : null}
    </View>
  );
}
