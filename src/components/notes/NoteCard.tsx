import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Chip, Surface, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Note } from '@/types';
import { relativeTime } from '@/utils/date';
import { plainPreview } from '@/utils/text';

export interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
  const t = useTheme();
  const preview = plainPreview(note.bodyMd, 120);
  return (
    <Pressable onPress={onPress}>
      <Surface padded style={{ gap: t.spacing.sm }}>
        {note.coverUri ? (
          <Image
            source={{ uri: note.coverUri }}
            style={{
              width: '100%',
              height: 96,
              borderRadius: t.radii.md,
              marginBottom: t.spacing.xs,
            }}
          />
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          <Text variant="h2" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
            {note.title || 'Untitled'}
          </Text>
          {note.isFavorite ? <Ionicons name="star" size={15} color={t.colors.warning} /> : null}
          {note.isPinned ? <Ionicons name="bookmark" size={15} color={t.colors.accent} /> : null}
        </View>

        {preview ? (
          <Text tone="muted" numberOfLines={2}>
            {preview}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, marginTop: 2 }}>
          <Text variant="small" tone="faint">
            {relativeTime(note.updatedAt)} · {note.wordCount} words
          </Text>
          <View style={{ flex: 1 }} />
          {(note.tags ?? []).slice(0, 2).map((tag) => (
            <Chip key={tag.id} label={tag.name} color={tag.color ?? undefined} small />
          ))}
        </View>
      </Surface>
    </Pressable>
  );
}
