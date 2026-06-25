import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { BottomSheet, Button, Text, TextField } from '@/components/ui';
import { navigate } from '@/navigation';
import { useBoards, useNotes, useTasks, useUI } from '@/store';
import { useTheme } from '@/theme';

type Mode = 'menu' | 'task' | 'board';

/** Global one-tap capture sheet (triggered by the FAB / Quick-Add). */
export function QuickAddSheet() {
  const t = useTheme();
  const open = useUI((s) => s.quickAddOpen);
  const close = useUI((s) => s.closeQuickAdd);
  const createNote = useNotes((s) => s.create);
  const createTask = useTasks((s) => s.create);
  const createBoard = useBoards((s) => s.createBoard);

  const [mode, setMode] = useState<Mode>('menu');
  const [text, setText] = useState('');

  const reset = () => {
    setMode('menu');
    setText('');
  };
  const dismiss = () => {
    reset();
    close();
  };

  const newNote = () => {
    const note = createNote({ title: '', bodyMd: '' });
    dismiss();
    navigate('NoteEditor', { id: note.id });
  };

  const submitTask = () => {
    if (!text.trim()) return;
    createTask({ title: text.trim() });
    dismiss();
  };

  const submitBoard = () => {
    if (!text.trim()) return;
    const board = createBoard(text.trim());
    dismiss();
    navigate('BoardDetail', { id: board.id });
  };

  return (
    <BottomSheet
      visible={open}
      onClose={dismiss}
      title={mode === 'menu' ? 'Quick add' : mode === 'task' ? 'New task' : 'New board'}
    >
      {mode === 'menu' ? (
        <View style={{ gap: t.spacing.sm }}>
          <Option icon="document-text" label="Note" hint="Capture a thought" onPress={newNote} />
          <Option icon="checkmark-circle" label="Task" hint="Add a to-do" onPress={() => setMode('task')} />
          <Option icon="grid" label="Board" hint="Start a Kanban board" onPress={() => setMode('board')} />
        </View>
      ) : (
        <View style={{ gap: t.spacing.lg }}>
          <TextField
            autoFocus
            value={text}
            onChangeText={setText}
            placeholder={mode === 'task' ? 'What needs doing?' : 'Board name'}
            onSubmitEditing={mode === 'task' ? submitTask : submitBoard}
            returnKeyType="done"
          />
          <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" variant="secondary" onPress={reset} fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Add"
                onPress={mode === 'task' ? submitTask : submitBoard}
                fullWidth
              />
            </View>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

function Option({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.md,
        padding: t.spacing.md,
        borderRadius: t.radii.md,
        backgroundColor: pressed ? t.colors.overlay : t.colors.surface,
        borderWidth: 1,
        borderColor: t.colors.border,
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: t.radii.md,
          backgroundColor: t.colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={20} color={t.colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text weight="semibold">{label}</Text>
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={t.colors.textFaint} />
    </Pressable>
  );
}
