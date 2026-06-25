import React, { forwardRef } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, style, ...rest }, ref) => {
    const t = useTheme();
    return (
      <View style={{ gap: 6, width: '100%' }}>
        {label ? (
          <Text variant="caption" tone="muted" weight="medium">
            {label}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={t.colors.textFaint}
          style={[
            {
              backgroundColor: t.colors.overlay,
              borderRadius: t.radii.md,
              borderWidth: 1,
              borderColor: error ? t.colors.danger : t.colors.border,
              paddingHorizontal: t.spacing.md,
              paddingVertical: t.spacing.md,
              color: t.colors.text,
              fontSize: t.typography.body,
            },
            style,
          ]}
          {...rest}
        />
        {error ? (
          <Text variant="small" tone="danger">
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
);

TextField.displayName = 'TextField';
