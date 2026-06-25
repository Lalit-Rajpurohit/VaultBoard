import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { TaskRow } from '@/components/tasks/TaskRow';
import {
  EmptyState,
  FAB,
  Header,
  Screen,
  Segmented,
  SwipeRow,
  Text,
} from '@/components/ui';
import { useRefreshOnFocus } from '@/hooks';
import { useTasks, useUI } from '@/store';
import { useTheme } from '@/theme';
import { isDueToday, isOverdue, isUpcoming } from '@/utils/date';

type TaskView = 'today' | 'upcoming' | 'completed';

export function TasksScreen() {
  const t = useTheme();
  const nav = useNavigation();
  const tasks = useTasks((s) => s.tasks);
  const refresh = useTasks((s) => s.refresh);
  const toggle = useTasks((s) => s.toggle);
  const remove = useTasks((s) => s.remove);
  const openQuickAdd = useUI((s) => s.openQuickAdd);
  const [view, setView] = useState<TaskView>('today');

  useRefreshOnFocus(refresh);

  const visible = useMemo(() => {
    if (view === 'completed') return tasks.filter((task) => task.status === 'done');
    if (view === 'upcoming')
      return tasks.filter(
        (task) =>
          task.status !== 'done' &&
          isUpcoming(task.dueAt) &&
          !isDueToday(task.dueAt) &&
          !isOverdue(task.dueAt)
      );
    return tasks.filter(
      (task) => task.status !== 'done' && (isDueToday(task.dueAt) || isOverdue(task.dueAt) || !task.dueAt)
    );
  }, [tasks, view]);

  return (
    <Screen>
      <Header onBack={() => nav.goBack()} title="Tasks" />
      <View style={{ paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.md }}>
        <Segmented<TaskView>
          options={[
            { label: 'Today', value: 'today' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Completed', value: 'completed' },
          ]}
          value={view}
          onChange={setView}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: t.spacing.xl, paddingTop: 0, gap: t.spacing.sm, paddingBottom: 120 }}>
        {visible.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title={view === 'completed' ? 'Nothing completed yet' : 'All clear'}
            subtitle={
              view === 'today'
                ? 'No tasks due today. Add one to get going.'
                : view === 'upcoming'
                  ? 'No tasks scheduled in the next week.'
                  : 'Completed tasks will show up here.'
            }
            actionLabel={view !== 'completed' ? 'New task' : undefined}
            onAction={openQuickAdd}
          />
        ) : (
          visible.map((task) => (
            <SwipeRow
              key={task.id}
              right={{ icon: 'trash', color: t.colors.danger, onPress: () => remove(task.id) }}
            >
              <TaskRow task={task} onToggle={() => toggle(task.id)} />
            </SwipeRow>
          ))
        )}
        {view === 'today' && visible.length > 0 ? (
          <Text variant="small" tone="faint" center style={{ marginTop: t.spacing.md }}>
            Swipe left to delete · tap the circle to complete
          </Text>
        ) : null}
      </ScrollView>

      <FAB onPress={openQuickAdd} />
    </Screen>
  );
}
