import type { ID, Note, Tag } from '@/types';
import { now } from '@/utils/date';
import { createId } from '@/utils/id';
import { countWords, extractLinkTitles } from '@/utils/text';

import { all, bool, first, intBool, run, tx } from '../client';

interface NoteRow {
  id: string;
  title: string;
  body_md: string;
  folder_id: string | null;
  cover_uri: string | null;
  is_pinned: number;
  is_favorite: number;
  is_archived: number;
  word_count: number;
  created_at: number;
  updated_at: number;
}

function mapNote(r: NoteRow): Note {
  return {
    id: r.id,
    title: r.title,
    bodyMd: r.body_md,
    folderId: r.folder_id,
    coverUri: r.cover_uri,
    isPinned: bool(r.is_pinned),
    isFavorite: bool(r.is_favorite),
    isArchived: bool(r.is_archived),
    wordCount: r.word_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const SELECT = 'SELECT * FROM notes';

export function listNotes(opts: { includeArchived?: boolean } = {}): Note[] {
  const where = opts.includeArchived ? '' : 'WHERE is_archived = 0';
  return all<NoteRow>(
    `${SELECT} ${where} ORDER BY is_pinned DESC, updated_at DESC`
  ).map(mapNote);
}

export function recentNotes(limit = 6): Note[] {
  return all<NoteRow>(
    `${SELECT} WHERE is_archived = 0 ORDER BY updated_at DESC LIMIT ?`,
    [limit]
  ).map(mapNote);
}

export function getNote(id: ID): Note | null {
  const row = first<NoteRow>(`${SELECT} WHERE id = ?`, [id]);
  if (!row) return null;
  const note = mapNote(row);
  note.tags = tagsForNote(id);
  return note;
}

export function tagsForNote(noteId: ID): Tag[] {
  return all<{ id: string; name: string; color: string | null }>(
    `SELECT t.* FROM tags t
     JOIN note_tags nt ON nt.tag_id = t.id
     WHERE nt.note_id = ? ORDER BY t.name`,
    [noteId]
  ).map((t) => ({ id: t.id, name: t.name, color: t.color }));
}

export function createNote(input: Partial<Note> = {}): Note {
  const ts = now();
  const id = input.id ?? createId('note');
  const body = input.bodyMd ?? '';
  run(
    `INSERT INTO notes
       (id, title, body_md, folder_id, cover_uri, is_pinned, is_favorite, is_archived, word_count, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      input.title ?? '',
      body,
      input.folderId ?? null,
      input.coverUri ?? null,
      intBool(input.isPinned ?? false),
      intBool(input.isFavorite ?? false),
      intBool(input.isArchived ?? false),
      countWords(body),
      ts,
      ts,
    ]
  );
  syncLinks(id, body);
  return getNote(id)!;
}

export function updateNote(
  id: ID,
  patch: Partial<Pick<Note, 'title' | 'bodyMd' | 'folderId' | 'coverUri'>>
): void {
  const existing = first<NoteRow>(`${SELECT} WHERE id = ?`, [id]);
  if (!existing) return;
  const title = patch.title ?? existing.title;
  const body = patch.bodyMd ?? existing.body_md;
  run(
    `UPDATE notes SET title = ?, body_md = ?, folder_id = ?, cover_uri = ?,
       word_count = ?, updated_at = ? WHERE id = ?`,
    [
      title,
      body,
      patch.folderId !== undefined ? patch.folderId : existing.folder_id,
      patch.coverUri !== undefined ? patch.coverUri : existing.cover_uri,
      countWords(body),
      now(),
      id,
    ]
  );
  if (patch.bodyMd !== undefined) syncLinks(id, body);
}

export function togglePin(id: ID): void {
  run('UPDATE notes SET is_pinned = 1 - is_pinned, updated_at = ? WHERE id = ?', [
    now(),
    id,
  ]);
}

export function toggleFavorite(id: ID): void {
  run('UPDATE notes SET is_favorite = 1 - is_favorite WHERE id = ?', [id]);
}

export function archiveNote(id: ID, archived = true): void {
  run('UPDATE notes SET is_archived = ?, updated_at = ? WHERE id = ?', [
    intBool(archived),
    now(),
    id,
  ]);
}

export function deleteNote(id: ID): void {
  run('DELETE FROM notes WHERE id = ?', [id]);
}

export function duplicateNote(id: ID): Note | null {
  const src = getNote(id);
  if (!src) return null;
  const copy = createNote({
    title: `${src.title || 'Untitled'} (copy)`,
    bodyMd: src.bodyMd,
    folderId: src.folderId,
  });
  // Carry over tags.
  for (const tag of src.tags ?? []) {
    run('INSERT OR IGNORE INTO note_tags(note_id, tag_id) VALUES (?,?)', [
      copy.id,
      tag.id,
    ]);
  }
  return getNote(copy.id);
}

export function setNoteTags(noteId: ID, tagIds: ID[]): void {
  tx(() => {
    run('DELETE FROM note_tags WHERE note_id = ?', [noteId]);
    for (const tagId of tagIds) {
      run('INSERT OR IGNORE INTO note_tags(note_id, tag_id) VALUES (?,?)', [
        noteId,
        tagId,
      ]);
    }
  });
}

// --- backlinks --------------------------------------------------------------

/** Rebuild note_links for a note from its [[wiki links]] (matched by title). */
export function syncLinks(noteId: ID, body: string): void {
  const titles = extractLinkTitles(body);
  tx(() => {
    run('DELETE FROM note_links WHERE source_note_id = ?', [noteId]);
    for (const title of titles) {
      const target = first<{ id: string }>(
        'SELECT id FROM notes WHERE title = ? AND id != ? LIMIT 1',
        [title, noteId]
      );
      if (target) {
        run(
          'INSERT OR IGNORE INTO note_links(source_note_id, target_note_id) VALUES (?,?)',
          [noteId, target.id]
        );
      }
    }
  });
}

/** Notes that link TO the given note (backlinks panel). */
export function backlinksFor(noteId: ID): Note[] {
  return all<NoteRow>(
    `${SELECT} WHERE id IN (
       SELECT source_note_id FROM note_links WHERE target_note_id = ?
     ) ORDER BY updated_at DESC`,
    [noteId]
  ).map(mapNote);
}

export function notesInFolder(folderId: ID): Note[] {
  return all<NoteRow>(
    `${SELECT} WHERE folder_id = ? AND is_archived = 0 ORDER BY updated_at DESC`,
    [folderId]
  ).map(mapNote);
}
