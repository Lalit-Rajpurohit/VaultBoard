import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { GraphHint } from '@/components/vault/GraphHint';
import { Chip, Header, IconButton, Screen, Surface, Text } from '@/components/ui';
import { useRefreshOnFocus } from '@/hooks';
import type { RootStackParamList } from '@/navigation';
import { useLibrary, useNotes } from '@/store';
import { useTheme } from '@/theme';
import { relativeTime } from '@/utils/date';

export function VaultScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const notes = useNotes((s) => s.notes);
  const refreshNotes = useNotes((s) => s.refresh);
  const tags = useLibrary((s) => s.tags);
  const refreshLib = useLibrary((s) => s.refresh);

  useRefreshOnFocus(() => {
    refreshNotes();
    refreshLib();
  });

  const starred = notes.filter((n) => n.isFavorite);
  const recent = notes.slice(0, 6);

  return (
    <Screen>
      <Header
        large
        title="Vault"
        subtitle="Your knowledge graph"
        right={
          <IconButton name="pricetags-outline" onPress={() => nav.navigate('TagsFolders' as never)} />
        }
      />
      <ScrollView contentContainerStyle={{ padding: t.spacing.xl, gap: t.spacing.xl, paddingBottom: 60 }}>
        <GraphHint notes={notes} />

        <Section title="Starred">
          {starred.length === 0 ? (
            <Text tone="faint" variant="caption">
              Star notes to keep them close.
            </Text>
          ) : (
            starred.map((n) => (
              <PageRow
                key={n.id}
                icon="star"
                title={n.title || 'Untitled'}
                meta={`${n.wordCount} words`}
                onPress={() => nav.navigate('NoteDetail', { id: n.id })}
              />
            ))
          )}
        </Section>

        <Section title="Recent pages">
          {recent.map((n) => (
            <PageRow
              key={n.id}
              icon="document-text-outline"
              title={n.title || 'Untitled'}
              meta={relativeTime(n.updatedAt)}
              onPress={() => nav.navigate('NoteDetail', { id: n.id })}
            />
          ))}
        </Section>

        <Section title="Tags">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {tags.length === 0 ? (
              <Text tone="faint" variant="caption">
                No tags yet.
              </Text>
            ) : (
              tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={`#${tag.name} ${tag.count}`}
                  color={tag.color ?? undefined}
                  onPress={() => nav.navigate('TagsFolders' as never)}
                />
              ))
            )}
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <Text variant="h2" weight="semibold">
        {title}
      </Text>
      {children}
    </View>
  );
}

function PageRow({
  icon,
  title,
  meta,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  meta: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress}>
      <Surface padded style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <Ionicons name={icon} size={18} color={t.colors.accent} />
        <Text weight="medium" style={{ flex: 1 }} numberOfLines={1}>
          {title}
        </Text>
        <Text variant="small" tone="faint">
          {meta}
        </Text>
      </Surface>
    </Pressable>
  );
}
