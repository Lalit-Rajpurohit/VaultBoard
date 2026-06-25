import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { Button, Header, Screen, Surface, Text } from '@/components/ui';
import { boardsQ, notesQ, tasksQ } from '@/db';
import { exportJson, exportMarkdown } from '@/services';
import { useTheme } from '@/theme';

export function BackupRestoreScreen() {
  const t = useTheme();
  const nav = useNavigation();
  const [busy, setBusy] = useState<string | null>(null);

  const counts = {
    notes: notesQ.listNotes({ includeArchived: true }).length,
    boards: boardsQ.listBoards().length,
    tasks: tasksQ.listTasks().length,
  };

  const run = async (key: string, fn: () => Promise<void>) => {
    try {
      setBusy(key);
      await fn();
    } catch (e) {
      Alert.alert('Export failed', String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <Header onBack={() => nav.goBack()} title="Backup & Restore" />
      <ScrollView contentContainerStyle={{ padding: t.spacing.xl, gap: t.spacing.lg }}>
        <Surface elevated padded style={{ gap: t.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <Ionicons name="shield-checkmark-outline" size={26} color={t.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text weight="semibold">Local snapshot</Text>
              <Text variant="caption" tone="muted">
                {counts.notes} notes · {counts.boards} boards · {counts.tasks} tasks
              </Text>
            </View>
          </View>
          <Text variant="caption" tone="faint">
            Everything stays on your device. Export a portable copy any time and share it to cloud storage,
            email, or another device.
          </Text>
        </Surface>

        <View style={{ gap: t.spacing.sm }}>
          <Text variant="caption" tone="faint" weight="semibold">
            EXPORT
          </Text>
          <Button
            title="Export full backup (JSON)"
            icon="code-download-outline"
            variant="secondary"
            loading={busy === 'json'}
            onPress={() => run('json', exportJson)}
            fullWidth
          />
          <Button
            title="Export notes (Markdown)"
            icon="document-outline"
            variant="secondary"
            loading={busy === 'md'}
            onPress={() => run('md', exportMarkdown)}
            fullWidth
          />
        </View>

        <View style={{ gap: t.spacing.sm }}>
          <Text variant="caption" tone="faint" weight="semibold">
            RESTORE
          </Text>
          <Surface padded style={{ gap: t.spacing.sm }}>
            <Text weight="medium">Import from backup</Text>
            <Text variant="caption" tone="muted">
              Restoring from a JSON backup merges notes, boards and tasks into your vault. This action is
              scaffolded — wire a document picker to enable it.
            </Text>
            <Button
              title="Choose backup file"
              icon="folder-open-outline"
              variant="ghost"
              onPress={() =>
                Alert.alert(
                  'Restore',
                  'Import is stubbed in this build. Hook up expo-document-picker + the JSON parser in services/backup to finish it.'
                )
              }
            />
          </Surface>
        </View>
      </ScrollView>
    </Screen>
  );
}
