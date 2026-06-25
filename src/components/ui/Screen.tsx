import React from 'react';
import { View, type ViewProps } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export interface ScreenProps extends ViewProps {
  edges?: Edge[];
}

/** Root screen container: applies background + safe-area insets. */
export function Screen({ children, style, edges = ['top'], ...rest }: ScreenProps) {
  const t = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: t.colors.bg }, style]}
      {...rest}
    >
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
