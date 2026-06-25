import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Elegant centered empty state used on every list. */
export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const t = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: t.spacing.xxxl * 1.5,
        paddingHorizontal: t.spacing.xl,
        gap: t.spacing.md,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: t.radii.xl,
          backgroundColor: t.colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={32} color={t.colors.accent} />
      </View>
      <Text variant="h2" weight="semibold" center>
        {title}
      </Text>
      {subtitle ? (
        <Text tone="muted" center style={{ maxWidth: 280 }}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: t.spacing.sm }}>
          <Button title={actionLabel} icon="add" onPress={onAction} size="sm" />
        </View>
      ) : null}
    </View>
  );
}
