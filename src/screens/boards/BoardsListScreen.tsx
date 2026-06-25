import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { EmptyState, FAB, Header, ProgressBar, Screen, Surface, SwipeRow, Text } from '@/components/ui';
import { boardsQ } from '@/db';
import { useRefreshOnFocus } from '@/hooks';
import type { RootStackParamList } from '@/navigation';
import { useBoards, useUI } from '@/store';
import { useTheme } from '@/theme';

export function BoardsListScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const boards = useBoards((s) => s.boards);
  const refresh = useBoards((s) => s.refresh);
  const togglePin = useBoards((s) => s.togglePin);
  const remove = useBoards((s) => s.removeBoard);
  const openQuickAdd = useUI((s) => s.openQuickAdd);

  useRefreshOnFocus(refresh);

  return (
    <Screen>
      <Header large title="Boards" />
      <ScrollView contentContainerStyle={{ padding: t.spacing.xl, gap: t.spacing.md, paddingBottom: 120 }}>
        {boards.length === 0 ? (
          <EmptyState
            icon="grid-outline"
            title="No boards yet"
            subtitle="Organize work into Kanban columns and cards."
            actionLabel="New board"
            onAction={openQuickAdd}
          />
        ) : (
          boards.map((board) => {
            const data = boardsQ.getBoard(board.id);
            const all = data?.columns.flatMap((c) => c.cards) ?? [];
            const doneCol = data?.columns.find((c) => /done/i.test(c.name));
            const done = doneCol?.cards.length ?? 0;
            const progress = all.length === 0 ? 0 : done / all.length;
            return (
              <SwipeRow
                key={board.id}
                left={{
                  icon: board.isPinned ? 'bookmark' : 'bookmark-outline',
                  color: t.colors.accent,
                  onPress: () => togglePin(board.id),
                }}
                right={{ icon: 'trash', color: t.colors.danger, onPress: () => remove(board.id) }}
              >
                <Pressable onPress={() => nav.navigate('BoardDetail', { id: board.id })}>
                  <Surface padded style={{ gap: t.spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: t.radii.md,
                          backgroundColor: t.colors.accentSoft,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="grid" size={20} color={t.colors.accent} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="h2" weight="semibold" numberOfLines={1}>
                          {board.name}
                        </Text>
                        <Text variant="caption" tone="muted">
                          {all.length} cards · {data?.columns.length ?? 0} columns
                        </Text>
                      </View>
                      {board.isPinned ? (
                        <Ionicons name="bookmark" size={16} color={t.colors.accent} />
                      ) : null}
                    </View>
                    <ProgressBar value={progress} />
                  </Surface>
                </Pressable>
              </SwipeRow>
            );
          })
        )}
      </ScrollView>
      <FAB onPress={openQuickAdd} />
    </Screen>
  );
}
