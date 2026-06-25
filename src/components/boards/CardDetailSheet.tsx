import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import {
  BottomSheet,
  Button,
  Chip,
  Divider,
  Segmented,
  Text,
  TextField,
} from '@/components/ui';
import { useBoards } from '@/store';
import { useTheme } from '@/theme';
import type { BoardWithData, Card, Priority } from '@/types';
import { addDays, dueLabel, startOfDay } from '@/utils/date';

export interface CardDetailSheetProps {
  board: BoardWithData;
  card: Card | null;
  onClose: () => void;
}

const PRIORITIES: { label: string; value: string }[] = [
  { label: 'None', value: '0' },
  { label: 'Low', value: '1' },
  { label: 'Med', value: '2' },
  { label: 'High', value: '3' },
];

export function CardDetailSheet({ board, card, onClose }: CardDetailSheetProps) {
  const t = useTheme();
  const {
    updateCard,
    removeCard,
    moveCard,
    setLabels,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
  } = useBoards();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labelDraft, setLabelDraft] = useState('');
  const [checkDraft, setCheckDraft] = useState('');

  useEffect(() => {
    setTitle(card?.title ?? '');
    setDescription(card?.description ?? '');
  }, [card]);

  if (!card) return null;

  const commit = (patch: Partial<Pick<Card, 'title' | 'description' | 'priority' | 'dueAt'>>) =>
    updateCard(card.id, patch);

  const setDue = (ts: number | null) => commit({ dueAt: ts });

  return (
    <BottomSheet visible={!!card} onClose={onClose} title="Card">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: t.spacing.lg }}>
          <TextField
            value={title}
            onChangeText={setTitle}
            onEndEditing={() => commit({ title })}
            placeholder="Card title"
          />

          <View>
            <Text variant="caption" tone="muted" weight="medium" style={{ marginBottom: 6 }}>
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              onEndEditing={() => commit({ description })}
              placeholder="Add details…"
              placeholderTextColor={t.colors.textFaint}
              multiline
              style={{
                minHeight: 70,
                backgroundColor: t.colors.overlay,
                borderRadius: t.radii.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing.md,
                color: t.colors.text,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Priority */}
          <View style={{ gap: 6 }}>
            <Text variant="caption" tone="muted" weight="medium">
              Priority
            </Text>
            <Segmented
              options={PRIORITIES}
              value={String(card.priority)}
              onChange={(v) => commit({ priority: Number(v) as Priority })}
            />
          </View>

          {/* Due date */}
          <View style={{ gap: 6 }}>
            <Text variant="caption" tone="muted" weight="medium">
              Due {card.dueAt ? `· ${dueLabel(card.dueAt)}` : ''}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <Chip label="Today" onPress={() => setDue(startOfDay(new Date()).getTime())} />
              <Chip
                label="Tomorrow"
                onPress={() => setDue(addDays(startOfDay(new Date()), 1).getTime())}
              />
              <Chip
                label="+3 days"
                onPress={() => setDue(addDays(startOfDay(new Date()), 3).getTime())}
              />
              {card.dueAt ? <Chip label="Clear" icon="close" onPress={() => setDue(null)} /> : null}
            </View>
          </View>

          {/* Labels */}
          <View style={{ gap: 6 }}>
            <Text variant="caption" tone="muted" weight="medium">
              Labels
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {(card.labels ?? []).map((l) => (
                <Chip
                  key={l}
                  label={l}
                  icon="close"
                  onPress={() => setLabels(card.id, (card.labels ?? []).filter((x) => x !== l))}
                />
              ))}
            </View>
            <TextField
              value={labelDraft}
              onChangeText={setLabelDraft}
              placeholder="Add label…"
              returnKeyType="done"
              onSubmitEditing={() => {
                const v = labelDraft.trim();
                if (v && !(card.labels ?? []).includes(v)) {
                  setLabels(card.id, [...(card.labels ?? []), v]);
                }
                setLabelDraft('');
              }}
            />
          </View>

          {/* Checklist */}
          <View style={{ gap: 6 }}>
            <Text variant="caption" tone="muted" weight="medium">
              Checklist
            </Text>
            {(card.checklist ?? []).map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
                <Pressable onPress={() => toggleChecklistItem(card.id, item.id)} hitSlop={8}>
                  <Ionicons
                    name={item.done ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={item.done ? t.colors.accent : t.colors.textFaint}
                  />
                </Pressable>
                <Text
                  style={{
                    flex: 1,
                    textDecorationLine: item.done ? 'line-through' : 'none',
                    color: item.done ? t.colors.textMuted : t.colors.text,
                  }}
                >
                  {item.text}
                </Text>
                <Pressable onPress={() => removeChecklistItem(card.id, item.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={t.colors.textFaint} />
                </Pressable>
              </View>
            ))}
            <TextField
              value={checkDraft}
              onChangeText={setCheckDraft}
              placeholder="Add checklist item…"
              returnKeyType="done"
              onSubmitEditing={() => {
                if (checkDraft.trim()) addChecklistItem(card.id, checkDraft.trim());
                setCheckDraft('');
              }}
            />
          </View>

          <Divider spacing={2} />

          {/* Move between columns */}
          <View style={{ gap: 6 }}>
            <Text variant="caption" tone="muted" weight="medium">
              Move to
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {board.columns.map((col) => (
                <Chip
                  key={col.id}
                  label={col.name}
                  selected={col.id === card.columnId}
                  onPress={() => moveCard(card.id, col.id)}
                />
              ))}
            </View>
          </View>

          <Button
            title="Delete card"
            variant="danger"
            icon="trash"
            onPress={() => {
              removeCard(card.id);
              onClose();
            }}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
