import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Chip, Header, Screen, Segmented, Surface, Text, TextField } from '@/components/ui';
import { useRefreshOnFocus } from '@/hooks';
import { useLibrary } from '@/store';
import { useTheme } from '@/theme';

type Tab = 'folders' | 'tags';

export function TagsFoldersScreen() {
  const t = useTheme();
  const nav = useNavigation();
  const { tags, folders, refresh, createFolder, deleteFolder, deleteTag } = useLibrary();
  const [tab, setTab] = useState<Tab>('folders');
  const [draft, setDraft] = useState('');

  useRefreshOnFocus(refresh);

  return (
    <Screen>
      <Header onBack={() => nav.goBack()} title="Tags & Folders" />
      <View style={{ paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.md }}>
        <Segmented<Tab>
          options={[
            { label: 'Folders', value: 'folders' },
            { label: 'Tags', value: 'tags' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: t.spacing.xl, paddingTop: 0, gap: t.spacing.md }}>
        {tab === 'folders' ? (
          <>
            <View style={{ flexDirection: 'row', gap: t.spacing.sm, alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="New folder"
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Folder name"
                  onSubmitEditing={() => {
                    if (draft.trim()) createFolder(draft.trim());
                    setDraft('');
                  }}
                  returnKeyType="done"
                />
              </View>
            </View>
            {folders.map((f) => (
              <Surface key={f.id} padded style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <Ionicons name="folder" size={20} color={t.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text weight="medium">{f.name}</Text>
                  <Text variant="caption" tone="faint">
                    {f.count} notes
                  </Text>
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    Alert.alert('Delete folder?', `"${f.name}" notes will be kept and unfiled.`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteFolder(f.id) },
                    ])
                  }
                >
                  <Ionicons name="trash-outline" size={18} color={t.colors.textFaint} />
                </Pressable>
              </Surface>
            ))}
            {folders.length === 0 ? (
              <Text tone="faint" variant="caption">
                No folders yet.
              </Text>
            ) : null}
          </>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {tags.length === 0 ? (
              <Text tone="faint" variant="caption">
                Tags you add to notes will appear here.
              </Text>
            ) : (
              tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={`#${tag.name} ${tag.count}`}
                  color={tag.color ?? undefined}
                  icon="close"
                  onPress={() =>
                    Alert.alert('Remove tag?', `Remove "#${tag.name}" from all notes?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => deleteTag(tag.id) },
                    ])
                  }
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
