import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { NoteCard } from '@/components/notes/NoteCard';
import {
  Chip,
  EmptyState,
  FAB,
  Header,
  IconButton,
  Screen,
  SearchBar,
  SwipeRow,
  Text,
} from '@/components/ui';
import { useRefreshOnFocus } from '@/hooks';
import type { RootStackParamList } from '@/navigation';
import { sortNotes, useLibrary, useNotes, useUI, type NoteSort } from '@/store';
import { useTheme } from '@/theme';
import { plainPreview } from '@/utils/text';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SORTS: { label: string; value: NoteSort }[] = [
  { label: 'Latest', value: 'updated' },
  { label: 'Oldest', value: 'created' },
  { label: 'A–Z', value: 'alpha' },
];

export function NotesListScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const openQuickAdd = useUI((s) => s.openQuickAdd);

  const notes = useNotes((s) => s.notes);
  const refresh = useNotes((s) => s.refresh);
  const togglePin = useNotes((s) => s.togglePin);
  const remove = useNotes((s) => s.remove);
  const folders = useLibrary((s) => s.folders);
  const refreshLibrary = useLibrary((s) => s.refresh);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<NoteSort>('updated');
  const [folderId, setFolderId] = useState<string | null>(null);

  useRefreshOnFocus(() => {
    refresh();
    refreshLibrary();
  });

  const filtered = useMemo(() => {
    let list = notes;
    if (folderId) list = list.filter((n) => n.folderId === folderId);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          plainPreview(n.bodyMd, 400).toLowerCase().includes(q)
      );
    }
    return sortNotes(list, sort);
  }, [notes, folderId, query, sort]);

  const pinned = filtered.filter((n) => n.isPinned);
  const others = filtered.filter((n) => !n.isPinned);

  const cycleSort = () => {
    const idx = SORTS.findIndex((s) => s.value === sort);
    setSort(SORTS[(idx + 1) % SORTS.length].value);
  };

  return (
    <Screen>
      <Header
        large
        title="Notes"
        right={
          <>
            <IconButton name="swap-vertical" onPress={cycleSort} accessibilityLabel="Change sort" />
            <IconButton name="search" onPress={() => nav.navigate('Search')} />
          </>
        }
      />

      <View style={{ paddingHorizontal: t.spacing.xl, gap: t.spacing.md }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search notes" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="small" tone="faint">
            {SORTS.find((s) => s.value === sort)?.label}
          </Text>
        </View>
        {folders.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Chip label="All" selected={folderId === null} onPress={() => setFolderId(null)} />
              {folders.map((f) => (
                <Chip
                  key={f.id}
                  label={`${f.name} ${f.count}`}
                  selected={folderId === f.id}
                  onPress={() => setFolderId(folderId === f.id ? null : f.id)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: t.spacing.xl, paddingBottom: 120, gap: t.spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title={query ? 'No matching notes' : 'No notes yet'}
            subtitle={query ? 'Try a different search.' : 'Capture your first thought in one tap.'}
            actionLabel={query ? undefined : 'New note'}
            onAction={openQuickAdd}
          />
        ) : null}

        {pinned.length > 0 && (
          <Text variant="caption" tone="faint" weight="semibold" style={{ marginTop: 4 }}>
            PINNED
          </Text>
        )}
        {pinned.map((note) => (
          <SwipeRow
            key={note.id}
            left={{ icon: 'bookmark', color: t.colors.accent, onPress: () => togglePin(note.id) }}
            right={{ icon: 'trash', color: t.colors.danger, onPress: () => remove(note.id) }}
          >
            <NoteCard note={note} onPress={() => nav.navigate('NoteDetail', { id: note.id })} />
          </SwipeRow>
        ))}

        {pinned.length > 0 && others.length > 0 && (
          <Text variant="caption" tone="faint" weight="semibold" style={{ marginTop: 4 }}>
            ALL NOTES
          </Text>
        )}
        {others.map((note) => (
          <SwipeRow
            key={note.id}
            left={{ icon: 'bookmark-outline', color: t.colors.accent, onPress: () => togglePin(note.id) }}
            right={{ icon: 'trash', color: t.colors.danger, onPress: () => remove(note.id) }}
          >
            <NoteCard note={note} onPress={() => nav.navigate('NoteDetail', { id: note.id })} />
          </SwipeRow>
        ))}
      </ScrollView>

      <FAB onPress={openQuickAdd} />
    </Screen>
  );
}
