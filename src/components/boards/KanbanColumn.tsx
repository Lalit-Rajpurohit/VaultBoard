import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, TextInput, View, useWindowDimensions } from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';

import { Text } from '@/components/ui';
import { useKeyboardHeight } from '@/hooks';
import { useTheme } from '@/theme';
import type { Card, Column } from '@/types';

import { KanbanCard } from './KanbanCard';

export interface KanbanColumnProps {
  column: Column & { cards: Card[] };
  onReorder: (orderedIds: string[]) => void;
  onAddCard: (title: string) => void;
  onCardPress: (card: Card) => void;
  onCardLongPress: (card: Card) => void;
}

/** One Kanban column with drag-to-reorder cards and an inline add-card input. */
export function KanbanColumn({
  column,
  onReorder,
  onAddCard,
  onCardPress,
  onCardLongPress,
}: KanbanColumnProps) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const colWidth = Math.min(300, width * 0.82);

  const submit = () => {
    if (draft.trim()) onAddCard(draft.trim());
    setDraft('');
    setAdding(false);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Card>) => (
    <ScaleDecorator>
      <View style={{ marginBottom: t.spacing.sm }}>
        <KanbanCard
          card={item}
          dragging={isActive}
          onPress={() => onCardPress(item)}
          onLongPress={drag}
        />
      </View>
    </ScaleDecorator>
  );

  return (
    <View
      style={{
        width: colWidth,
        marginRight: t.spacing.md,
        backgroundColor: t.isDark ? t.colors.surface : t.colors.overlay,
        borderRadius: t.radii.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing.md,
        // Lift the inline "Add card" input above the keyboard while typing.
        paddingBottom:
          adding && keyboardHeight > 0 ? keyboardHeight + t.spacing.md : t.spacing.md,
        maxHeight: '100%',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: t.spacing.sm,
          paddingHorizontal: 2,
        }}
      >
        <Text weight="semibold">{column.name}</Text>
        <View
          style={{
            minWidth: 22,
            height: 22,
            paddingHorizontal: 6,
            borderRadius: 11,
            backgroundColor: t.colors.overlay,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="small" tone="muted">
            {column.cards.length}
          </Text>
        </View>
      </View>

      <DraggableFlatList
        data={column.cards}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => onReorder(data.map((c) => c.id))}
        showsVerticalScrollIndicator={false}
        activationDistance={12}
        ListEmptyComponent={
          <Text variant="caption" tone="faint" style={{ paddingVertical: t.spacing.md }}>
            No cards yet
          </Text>
        }
      />

      {adding ? (
        <TextInput
          autoFocus
          value={draft}
          onChangeText={setDraft}
          placeholder="Card title…"
          placeholderTextColor={t.colors.textFaint}
          onSubmitEditing={submit}
          onBlur={submit}
          returnKeyType="done"
          style={{
            backgroundColor: t.colors.surface,
            borderRadius: t.radii.md,
            borderWidth: 1,
            borderColor: t.colors.accent,
            paddingHorizontal: t.spacing.md,
            paddingVertical: t.spacing.sm,
            color: t.colors.text,
            marginTop: 4,
          }}
        />
      ) : (
        <Pressable
          onPress={() => setAdding(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: t.spacing.sm,
            paddingHorizontal: 2,
            marginTop: 2,
          }}
        >
          <Ionicons name="add" size={18} color={t.colors.textMuted} />
          <Text tone="muted" variant="caption">
            Add card
          </Text>
        </Pressable>
      )}
    </View>
  );
}
