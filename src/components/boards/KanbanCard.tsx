import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { Chip, PriorityDot, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Card } from '@/types';
import { dueLabel, isOverdue } from '@/utils/date';

export interface KanbanCardProps {
  card: Card;
  onPress: () => void;
  onLongPress?: () => void;
  dragging?: boolean;
}

export function KanbanCard({ card, onPress, onLongPress, dragging }: KanbanCardProps) {
  const t = useTheme();
  const checklist = card.checklist ?? [];
  const doneCount = checklist.filter((c) => c.done).length;
  const overdue = isOverdue(card.dueAt);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200}
      style={{
        backgroundColor: t.colors.surface,
        borderRadius: t.radii.md,
        borderWidth: 1,
        borderColor: dragging ? t.colors.accent : t.colors.border,
        padding: t.spacing.md,
        gap: t.spacing.sm,
        ...(dragging ? t.shadow : {}),
      }}
    >
      {(card.labels ?? []).length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {card.labels!.map((l) => (
            <Chip key={l} label={l} small />
          ))}
        </View>
      ) : null}

      <Text weight="medium" numberOfLines={3}>
        {card.title}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        <PriorityDot priority={card.priority} />
        {card.dueAt ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={overdue ? t.colors.danger : t.colors.textFaint}
            />
            <Text variant="small" tone={overdue ? 'danger' : 'faint'}>
              {dueLabel(card.dueAt)}
            </Text>
          </View>
        ) : null}
        {checklist.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="checkbox-outline" size={12} color={t.colors.textFaint} />
            <Text variant="small" tone="faint">
              {doneCount}/{checklist.length}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
