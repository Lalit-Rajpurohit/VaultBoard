import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { CardDetailSheet } from '@/components/boards/CardDetailSheet';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { Chip, Header, IconButton, Screen, Text } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import { useBoards } from '@/store';
import { useTheme } from '@/theme';
import type { Card, Priority } from '@/types';

type BoardRoute = RouteProp<RootStackParamList, 'BoardDetail'>;

const FILTERS: { label: string; value: Priority | -1 }[] = [
  { label: 'All', value: -1 },
  { label: 'High', value: 3 },
  { label: 'Medium', value: 2 },
  { label: 'Low', value: 1 },
];

export function BoardDetailScreen() {
  const t = useTheme();
  const nav = useNavigation();
  const route = useRoute<BoardRoute>();
  const { id } = route.params;

  const board = useBoards((s) => s.active);
  const open = useBoards((s) => s.open);
  const togglePin = useBoards((s) => s.togglePin);
  const reorderColumn = useBoards((s) => s.reorderColumn);
  const addCard = useBoards((s) => s.addCard);
  const addColumn = useBoards((s) => s.addColumn);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Priority | -1>(-1);

  useEffect(() => {
    open(id);
  }, [id, open]);

  if (!board) {
    return (
      <Screen>
        <Header onBack={() => nav.goBack()} title="Board" />
      </Screen>
    );
  }

  const activeCard: Card | null =
    board.columns.flatMap((c) => c.cards).find((c) => c.id === activeCardId) ?? null;

  const applyFilter = (cards: Card[]) =>
    filter === -1 ? cards : cards.filter((c) => c.priority === filter);

  return (
    <Screen edges={['top']}>
      <Header
        onBack={() => nav.goBack()}
        title={board.name}
        subtitle={`${board.columns.reduce((n, c) => n + c.cards.length, 0)} cards`}
        right={
          <>
            <IconButton
              name={board.isPinned ? 'bookmark' : 'bookmark-outline'}
              color={board.isPinned ? t.colors.accent : undefined}
              onPress={() => togglePin(board.id)}
            />
            <IconButton name="add" onPress={() => addColumn('New column')} accessibilityLabel="Add column" />
          </>
        }
      />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: t.spacing.lg,
            paddingVertical: 4,
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                selected={filter === f.value}
                onPress={() => setFilter(f.value)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.md,
          paddingBottom: t.spacing.xl,
        }}
      >
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={{ ...column, cards: applyFilter(column.cards) }}
            // Reordering is only meaningful over the full set; when a filter is
            // active the dropped order omits hidden cards, so skip the write
            // (the list re-reads from the DB and snaps back).
            onReorder={(ids) => {
              if (filter === -1) reorderColumn(column.id, ids);
            }}
            onAddCard={(title) => addCard(column.id, title)}
            onCardPress={(card) => setActiveCardId(card.id)}
            onCardLongPress={() => undefined}
          />
        ))}
        {board.columns.length === 0 ? (
          <Text tone="muted" style={{ padding: t.spacing.xl }}>
            No columns yet — tap + to add one.
          </Text>
        ) : null}
      </ScrollView>

      <CardDetailSheet board={board} card={activeCard} onClose={() => setActiveCardId(null)} />
    </Screen>
  );
}
