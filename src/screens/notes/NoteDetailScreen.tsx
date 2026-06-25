import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { MarkdownView } from '@/components/notes/MarkdownView';
import {
  Chip,
  Divider,
  Header,
  IconButton,
  Screen,
  Surface,
  Text,
} from '@/components/ui';
import { notesQ } from '@/db';
import type { RootStackParamList } from '@/navigation';
import { useNotes } from '@/store';
import { useTheme } from '@/theme';
import type { Note } from '@/types';
import { relativeTime } from '@/utils/date';

type DetailRoute = RouteProp<RootStackParamList, 'NoteDetail'>;

export function NoteDetailScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<DetailRoute>();
  const { id } = route.params;
  const togglePin = useNotes((s) => s.togglePin);
  const toggleFavorite = useNotes((s) => s.toggleFavorite);
  const remove = useNotes((s) => s.remove);
  const duplicate = useNotes((s) => s.duplicate);

  const [note, setNote] = useState<Note | null>(null);
  const [backlinks, setBacklinks] = useState<Note[]>([]);

  useFocusEffect(
    useCallback(() => {
      setNote(notesQ.getNote(id));
      setBacklinks(notesQ.backlinksFor(id));
    }, [id])
  );

  const openLinkedTitle = (title: string) => {
    const target = notesQ.listNotes().find((n) => (n.title || 'Untitled') === title);
    if (target) nav.navigate('NoteDetail', { id: target.id });
  };

  if (!note) {
    return (
      <Screen>
        <Header onBack={() => nav.goBack()} title="Note" />
        <Text tone="muted" style={{ padding: t.spacing.xl }}>
          This note no longer exists.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        onBack={() => nav.goBack()}
        right={
          <>
            <IconButton
              name={note.isFavorite ? 'star' : 'star-outline'}
              color={note.isFavorite ? t.colors.warning : undefined}
              onPress={() => {
                toggleFavorite(note.id);
                setNote(notesQ.getNote(id));
              }}
            />
            <IconButton
              name={note.isPinned ? 'bookmark' : 'bookmark-outline'}
              color={note.isPinned ? t.colors.accent : undefined}
              onPress={() => {
                togglePin(note.id);
                setNote(notesQ.getNote(id));
              }}
            />
            <IconButton
              name="create-outline"
              onPress={() => nav.navigate('NoteEditor', { id: note.id })}
            />
          </>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: t.spacing.xl, paddingBottom: 60, gap: t.spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {note.coverUri ? (
          <Image
            source={{ uri: note.coverUri }}
            style={{ width: '100%', height: 170, borderRadius: t.radii.lg }}
          />
        ) : null}

        <View style={{ gap: 6 }}>
          <Text variant="display" weight="bold">
            {note.title || 'Untitled'}
          </Text>
          <Text variant="caption" tone="faint">
            Edited {relativeTime(note.updatedAt)} · {note.wordCount} words
          </Text>
        </View>

        {(note.tags ?? []).length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {note.tags!.map((tag) => (
              <Chip key={tag.id} label={`#${tag.name}`} color={tag.color ?? undefined} small />
            ))}
          </View>
        )}

        <Divider />

        {note.bodyMd.trim() ? (
          <MarkdownView source={note.bodyMd} onLinkPress={openLinkedTitle} />
        ) : (
          <Text tone="faint">This note is empty. Tap edit to start writing.</Text>
        )}

        {/* Backlinks */}
        <Divider spacing={2} />
        <View style={{ gap: t.spacing.sm }}>
          <Text variant="h2" weight="semibold">
            Backlinks {backlinks.length > 0 ? `· ${backlinks.length}` : ''}
          </Text>
          {backlinks.length === 0 ? (
            <Text tone="faint" variant="caption">
              No notes link here yet. Reference this note with [[{note.title || 'Untitled'}]].
            </Text>
          ) : (
            backlinks.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => nav.navigate('NoteDetail', { id: b.id })}
              >
                <Surface padded style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
                  <Text weight="medium" style={{ flex: 1 }} numberOfLines={1}>
                    {b.title || 'Untitled'}
                  </Text>
                  <IconButton name="arrow-forward" size={16} />
                </Surface>
              </Pressable>
            ))
          )}
        </View>

        {/* Footer actions */}
        <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.sm }}>
          <Pressable
            onPress={() => {
              const copy = duplicate(note.id);
              if (copy) nav.navigate('NoteDetail', { id: copy.id });
            }}
            style={actionStyle(t)}
          >
            <IconButton name="copy-outline" size={18} />
            <Text variant="caption">Duplicate</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              remove(note.id);
              nav.goBack();
            }}
            style={actionStyle(t)}
          >
            <IconButton name="trash-outline" size={18} color={t.colors.danger} />
            <Text variant="caption" tone="danger">
              Delete
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const actionStyle = (t: ReturnType<typeof useTheme>) => ({
  flex: 1,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 4,
  paddingVertical: t.spacing.sm,
  borderRadius: t.radii.md,
  borderWidth: 1,
  borderColor: t.colors.border,
  backgroundColor: t.colors.surface,
});
