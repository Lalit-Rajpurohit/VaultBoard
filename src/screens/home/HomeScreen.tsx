import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { NoteCard } from '@/components/notes/NoteCard';
import { TaskRow } from '@/components/tasks/TaskRow';
import {
  Chip,
  FAB,
  Header,
  IconButton,
  ProgressBar,
  Screen,
  Surface,
  Text,
} from '@/components/ui';
import { useRefreshOnFocus } from '@/hooks';
import type { RootStackParamList } from '@/navigation';
import { useBoards, useNotes, useTasks, useUI } from '@/store';
import { useTheme } from '@/theme';
import { fullDate, isDueToday, isOverdue } from '@/utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const t = useTheme();
  const nav = useNavigation<Nav>();
  const openQuickAdd = useUI((s) => s.openQuickAdd);

  const tasks = useTasks((s) => s.tasks);
  const toggleTask = useTasks((s) => s.toggle);
  const refreshTasks = useTasks((s) => s.refresh);
  const notes = useNotes((s) => s.notes);
  const refreshNotes = useNotes((s) => s.refresh);
  const boards = useBoards((s) => s.boards);
  const refreshBoards = useBoards((s) => s.refresh);

  useRefreshOnFocus(() => {
    refreshTasks();
    refreshNotes();
    refreshBoards();
  });

  const todayTasks = tasks.filter(
    (task) => task.status !== 'done' && (isDueToday(task.dueAt) || isOverdue(task.dueAt))
  );
  const recent = notes.slice(0, 5);
  const pinnedBoards = boards.filter((b) => b.isPinned);

  const completedToday = tasks.filter(
    (task) => task.status === 'done' && task.completedAt && isDueToday(task.completedAt)
  ).length;
  const totalToday = todayTasks.length + completedToday;
  const progress = totalToday === 0 ? 0 : completedToday / totalToday;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          large
          subtitle={fullDate(Date.now())}
          title={greeting}
          right={<IconButton name="search" filled onPress={() => nav.navigate('Search')} />}
        />

        {/* Productivity summary */}
        <View style={{ paddingHorizontal: t.spacing.xl, marginBottom: t.spacing.lg }}>
          <Surface elevated padded style={{ gap: t.spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Stat value={String(completedToday)} label="Done today" />
              <Stat value={String(todayTasks.length)} label="Remaining" />
              <Stat value={String(notes.length)} label="Notes" />
              <Stat value={String(boards.length)} label="Boards" />
            </View>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="caption" tone="muted">
                  Today's progress
                </Text>
                <Text variant="caption" tone="accent" weight="semibold">
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <ProgressBar value={progress} />
            </View>
          </Surface>
        </View>

        {/* Today's tasks */}
        <Section
          title="Today"
          actionLabel="All tasks"
          onAction={() => nav.navigate('Tasks')}
        />
        <View style={{ paddingHorizontal: t.spacing.xl, gap: t.spacing.sm }}>
          {todayTasks.length === 0 ? (
            <Surface padded>
              <Text tone="muted">Nothing due today. Enjoy the clarity. ✨</Text>
            </Surface>
          ) : (
            todayTasks
              .slice(0, 4)
              .map((task) => (
                <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
              ))
          )}
        </View>

        {/* Pinned boards */}
        {pinnedBoards.length > 0 && (
          <>
            <Section title="Pinned boards" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: t.spacing.xl, gap: t.spacing.md }}
            >
              {pinnedBoards.map((board) => (
                <Pressable
                  key={board.id}
                  onPress={() => nav.navigate('BoardDetail', { id: board.id })}
                >
                  <Surface elevated padded style={{ width: 180, gap: t.spacing.sm }}>
                    <Chip label="Board" icon="grid" small />
                    <Text variant="h2" weight="semibold" numberOfLines={2}>
                      {board.name}
                    </Text>
                    <Text variant="small" tone="faint">
                      Tap to open
                    </Text>
                  </Surface>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Recent notes */}
        <Section
          title="Recent notes"
          actionLabel="All notes"
          onAction={() => nav.navigate('Tabs', { screen: 'Notes' })}
        />
        <View style={{ paddingHorizontal: t.spacing.xl, gap: t.spacing.md }}>
          {recent.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPress={() => nav.navigate('NoteDetail', { id: note.id })}
            />
          ))}
        </View>
      </ScrollView>

      <FAB onPress={openQuickAdd} />
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text variant="h1" weight="bold">
        {value}
      </Text>
      <Text variant="small" tone="faint">
        {label}
      </Text>
    </View>
  );
}

function Section({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: t.spacing.xl,
        marginTop: t.spacing.xl,
        marginBottom: t.spacing.md,
      }}
    >
      <Text variant="h2" weight="semibold">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text variant="caption" tone="accent" weight="medium">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
