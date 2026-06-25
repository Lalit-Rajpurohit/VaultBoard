import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  autoFocus,
  onSubmitEditing,
}: SearchBarProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.sm,
        backgroundColor: t.colors.overlay,
        borderRadius: t.radii.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        paddingHorizontal: t.spacing.md,
        height: 44,
      }}
    >
      <Ionicons name="search" size={18} color={t.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textFaint}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        style={{ flex: 1, color: t.colors.text, fontSize: t.typography.body }}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={t.colors.textFaint} />
        </Pressable>
      )}
    </View>
  );
}
