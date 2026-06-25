import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Chip, EmptyState, IconButton, Screen, SearchBar, Surface, Text } from '@/components/ui';
import { searchQ } from '@/db';
import { useDebounce } from '@/hooks';
import type { RootStackParamList } from '@/navigation';
import { useTheme } from '@/theme';
import type { SearchResult } from '@/types';
import { relativeTime } from '@/utils/date';

type TypeFilter = 'all' | 'note' | 'task' | 'card';

const TYPE_META: Record<
  SearchResult['type'],
  { icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  note: { icon: 'document-text', label: 'Note' },
  task: { icon: 'checkmark-circle', label: 'Task' },
  card: { icon: 'grid', label: 'Card' },
};

export function SearchScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TypeFilter>('all');
  const debounced = useDebounce(query, 200);

  const results = useMemo(() => {
    if (!debounced.trim()) return [];
    return searchQ.search(debounced, {
      types: filter === 'all' ? undefined : [filter],
    });
  }, [debounced, filter]);

  const onOpen = (r: SearchResult) => {
    if (r.type === 'note') nav.navigate('NoteDetail', { id: r.id });
    else if (r.type === 'card') nav.navigate('Tabs', { screen: 'Boards' });
    else nav.navigate('Tasks');
  };

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing.sm,
          paddingHorizontal: t.spacing.lg,
          paddingVertical: t.spacing.sm,
        }}
      >
        <IconButton name="chevron-back" onPress={() => nav.goBack()} />
        <View style={{ flex: 1 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search everything" autoFocus />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: 6 }}
        style={{ maxHeight: 44 }}
      >
        {(['all', 'note', 'task', 'card'] as TypeFilter[]).map((f) => (
          <Chip
            key={f}
            label={f === 'all' ? 'All' : `${TYPE_META[f].label}s`}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: t.spacing.xl, gap: t.spacing.sm }}>
        {!debounced.trim() ? (
          <EmptyState
            icon="search"
            title="Search your vault"
            subtitle="Find notes, tasks and cards instantly — powered by full-text search."
          />
        ) : results.length === 0 ? (
          <EmptyState icon="sad-outline" title="No results" subtitle={`Nothing matches "${debounced}".`} />
        ) : (
          results.map((r) => (
            <Pressable key={`${r.type}-${r.id}`} onPress={() => onOpen(r)}>
              <Surface padded style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'center' }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: t.radii.md,
                    backgroundColor: t.colors.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={TYPE_META[r.type].icon} size={18} color={t.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold" numberOfLines={1}>
                    {r.title}
                  </Text>
                  {r.snippet ? (
                    <Text variant="caption" tone="muted" numberOfLines={1}>
                      {r.snippet}
                    </Text>
                  ) : (
                    <Text variant="caption" tone="faint">
                      {TYPE_META[r.type].label} · {relativeTime(r.updatedAt)}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={t.colors.textFaint} />
              </Surface>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
