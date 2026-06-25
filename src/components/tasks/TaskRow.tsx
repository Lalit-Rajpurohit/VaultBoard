import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { PriorityDot, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Task } from '@/types';
import { dueLabel, isOverdue } from '@/utils/date';

export interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
}

export function TaskRow({ task, onToggle, onPress }: TaskRowProps) {
  const t = useTheme();
  const done = task.status === 'done';
  const overdue = !done && isOverdue(task.dueAt);
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.md,
        paddingVertical: t.spacing.md,
        paddingHorizontal: t.spacing.lg,
        backgroundColor: t.colors.surface,
        borderRadius: t.radii.md,
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      <Pressable onPress={onToggle} hitSlop={10}>
        <Ionicons
          name={done ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={done ? t.colors.accent : t.colors.textFaint}
        />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            textDecorationLine: done ? 'line-through' : 'none',
            color: done ? t.colors.textMuted : t.colors.text,
          }}
        >
          {task.title}
        </Text>
        {task.dueAt ? (
          <Text variant="small" tone={overdue ? 'danger' : 'faint'}>
            {dueLabel(task.dueAt)}
            {task.recurrence !== 'none' ? ` · ${task.recurrence}` : ''}
          </Text>
        ) : null}
      </View>
      <PriorityDot priority={task.priority} />
    </Pressable>
  );
}
