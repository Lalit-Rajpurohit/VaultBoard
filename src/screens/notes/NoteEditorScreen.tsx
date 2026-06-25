import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Chip, Header, IconButton, Screen, Text, TextField } from '@/components/ui';
import { useAutosave, useKeyboardHeight } from '@/hooks';
import type { RootStackParamList } from '@/navigation';
import { pickImage } from '@/services';
import { useLibrary, useNotes } from '@/store';
import { useTheme } from '@/theme';
import type { Tag } from '@/types';
import { notesQ } from '@/db';
import { countWords } from '@/utils/text';
import { relativeTime } from '@/utils/date';

type EditorRoute = RouteProp<RootStackParamList, 'NoteEditor'>;

export function NoteEditorScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditorRoute>();
  const update = useNotes((s) => s.update);
  const allNotes = useNotes((s) => s.notes);
  const ensureTag = useLibrary((s) => s.ensureTag);
  const folders = useLibrary((s) => s.folders);
  const bodyRef = useRef<TextInput>(null);
  const keyboardHeight = useKeyboardHeight();

  // Ensure a note row exists (Quick-Add passes an id; deep links may not).
  const noteId = useMemo(() => route.params?.id ?? notesQ.createNote().id, [route.params?.id]);
  const initial = useMemo(() => notesQ.getNote(noteId), [noteId]);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.bodyMd ?? '');
  const [folderId, setFolderId] = useState<string | null>(initial?.folderId ?? null);
  const [coverUri, setCoverUri] = useState<string | null>(initial?.coverUri ?? null);
  const [tags, setTags] = useState<Tag[]>(initial?.tags ?? []);
  const [tagDraft, setTagDraft] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const value = useMemo(
    () => ({ title, bodyMd: body, folderId, coverUri }),
    [title, body, folderId, coverUri]
  );
  const saveState = useAutosave(value, (v) => update(noteId, v), 600);

  // [[ wiki-link ]] autocomplete based on cursor position.
  const linkQuery = useMemo(() => {
    const before = body.slice(0, selection.start);
    const open = before.lastIndexOf('[[');
    const close = before.lastIndexOf(']]');
    if (open > close) return before.slice(open + 2);
    return null;
  }, [body, selection.start]);

  const linkSuggestions = useMemo(() => {
    if (linkQuery == null) return [];
    const q = linkQuery.toLowerCase();
    return allNotes
      .filter((n) => n.id !== noteId && (n.title || 'Untitled').toLowerCase().includes(q))
      .slice(0, 5);
  }, [linkQuery, allNotes, noteId]);

  const insertLink = (linkTitle: string) => {
    const before = body.slice(0, selection.start);
    const open = before.lastIndexOf('[[');
    const next = `${body.slice(0, open + 2)}${linkTitle}]]${body.slice(selection.start)}`;
    setBody(next);
  };

  // Toolbar: wrap selection or insert at line start.
  const wrapSelection = (token: string) => {
    const { start, end } = selection;
    const sel = body.slice(start, end) || 'text';
    setBody(`${body.slice(0, start)}${token}${sel}${token}${body.slice(end)}`);
  };
  const prefixLine = (prefix: string) => {
    const { start } = selection;
    const lineStart = body.lastIndexOf('\n', start - 1) + 1;
    setBody(`${body.slice(0, lineStart)}${prefix}${body.slice(lineStart)}`);
  };
  const insertLinkToken = () => {
    const { start, end } = selection;
    const sel = body.slice(start, end);
    setBody(`${body.slice(0, start)}[[${sel}]]${body.slice(end)}`);
  };

  const commitTag = () => {
    const name = tagDraft.trim().replace(/^#/, '');
    if (!name) return;
    const id = ensureTag(name);
    if (!tags.some((tg) => tg.id === id)) {
      const next = [...tags, { id, name, color: null }];
      setTags(next);
      notesQ.setNoteTags(noteId, next.map((x) => x.id));
    }
    setTagDraft('');
  };
  const removeTag = (id: string) => {
    const next = tags.filter((tg) => tg.id !== id);
    setTags(next);
    notesQ.setNoteTags(noteId, next.map((x) => x.id));
  };

  const onPickCover = async () => {
    const uri = await pickImage();
    if (uri) setCoverUri(uri);
  };

  const goBack = () => {
    update(noteId, value); // flush before leaving
    nav.goBack();
  };

  return (
    <Screen edges={['top']}>
      <Header
        onBack={goBack}
        subtitle={`${countWords(body)} words · ${saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : `Edited ${relativeTime(initial?.updatedAt ?? Date.now())}`}`}
        right={
          <>
            <IconButton name="image-outline" onPress={onPickCover} accessibilityLabel="Cover image" />
            <IconButton
              name="eye-outline"
              onPress={() => nav.navigate('NoteDetail', { id: noteId })}
              accessibilityLabel="Preview"
            />
          </>
        }
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: t.spacing.xl,
            paddingBottom: 40 + keyboardHeight,
            gap: t.spacing.md,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {coverUri ? (
            <View>
              <Image
                source={{ uri: coverUri }}
                style={{ width: '100%', height: 150, borderRadius: t.radii.lg }}
              />
              <Pressable
                onPress={() => setCoverUri(null)}
                style={{ position: 'absolute', top: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={26} color="#fff" />
              </Pressable>
            </View>
          ) : null}

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={t.colors.textFaint}
            style={{ fontSize: t.typography.display, fontWeight: '700', color: t.colors.text }}
          />

          {/* Folder + tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Chip
                label="No folder"
                icon="folder-outline"
                selected={folderId === null}
                onPress={() => setFolderId(null)}
              />
              {folders.map((f) => (
                <Chip
                  key={f.id}
                  label={f.name}
                  icon="folder"
                  selected={folderId === f.id}
                  onPress={() => setFolderId(f.id)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {tags.map((tg) => (
              <Chip key={tg.id} label={`#${tg.name}`} icon="close" onPress={() => removeTag(tg.id)} />
            ))}
            <View style={{ width: 130 }}>
              <TextField
                value={tagDraft}
                onChangeText={setTagDraft}
                placeholder="#tag"
                onSubmitEditing={commitTag}
                returnKeyType="done"
                autoCapitalize="none"
                style={{ paddingVertical: 6 }}
              />
            </View>
          </View>

          <TextInput
            ref={bodyRef}
            value={body}
            onChangeText={setBody}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            placeholder="Start writing… use [[ to link notes"
            placeholderTextColor={t.colors.textFaint}
            multiline
            style={{
              fontSize: t.typography.body,
              color: t.colors.text,
              lineHeight: t.typography.body * 1.6,
              minHeight: 240,
              textAlignVertical: 'top',
            }}
          />
        </ScrollView>

        {/* Link autocomplete */}
        {linkSuggestions.length > 0 && (
          <View
            style={{
              backgroundColor: t.colors.elevated,
              borderTopWidth: 1,
              borderColor: t.colors.border,
              paddingVertical: 6,
            }}
          >
            {linkSuggestions.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => insertLink(n.title || 'Untitled')}
                style={{ paddingHorizontal: t.spacing.xl, paddingVertical: 10, flexDirection: 'row', gap: 8 }}
              >
                <Ionicons name="link" size={16} color={t.colors.accent} />
                <Text>{n.title || 'Untitled'}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Markdown toolbar — lifts above the keyboard when open */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: t.spacing.md,
            paddingVertical: 6,
            borderTopWidth: 1,
            borderColor: t.colors.border,
            backgroundColor: t.colors.surface,
            marginBottom: keyboardHeight,
          }}
        >
          <IconButton name="text" onPress={() => prefixLine('# ')} accessibilityLabel="Heading" />
          <IconButton name="ellipsis-horizontal" onPress={() => wrapSelection('**')} accessibilityLabel="Bold" />
          <IconButton name="list" onPress={() => prefixLine('- ')} accessibilityLabel="List" />
          <IconButton name="checkbox-outline" onPress={() => prefixLine('- [ ] ')} accessibilityLabel="Checkbox" />
          <IconButton name="link" onPress={insertLinkToken} accessibilityLabel="Link" />
          <View style={{ flex: 1 }} />
          <IconButton name="image-outline" onPress={onPickCover} />
        </View>
      </View>
    </Screen>
  );
}
