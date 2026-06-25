import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/theme';

type Variant = 'display' | 'h1' | 'h2' | 'body' | 'caption' | 'small';
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'danger' | 'onAccent';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  center?: boolean;
}

/** Themed text primitive — the single source of typography in the app. */
export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  center,
  style,
  ...rest
}: TextProps) {
  const t = useTheme();
  const size = t.typography[variant];
  const colorMap: Record<Tone, string> = {
    default: t.colors.text,
    muted: t.colors.textMuted,
    faint: t.colors.textFaint,
    accent: t.colors.accent,
    danger: t.colors.danger,
    onAccent: t.colors.onAccent,
  };
  const defaultWeight =
    variant === 'display' || variant === 'h1'
      ? 'bold'
      : variant === 'h2'
        ? 'semibold'
        : 'regular';
  return (
    <RNText
      {...rest}
      style={[
        {
          fontSize: size,
          color: colorMap[tone],
          fontWeight: t.typography.weight[weight ?? defaultWeight],
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
    />
  );
}
