import type { ID, Tag } from '@/types';
import { createId } from '@/utils/id';

import { all, first, run } from '../client';

export function listTags(): Tag[] {
  return all<{ id: string; name: string; color: string | null }>(
    'SELECT * FROM tags ORDER BY name'
  );
}

export function tagsWithCounts(): (Tag & { count: number })[] {
  return all<{ id: string; name: string; color: string | null; count: number }>(
    `SELECT t.*, COUNT(nt.note_id) AS count
     FROM tags t LEFT JOIN note_tags nt ON nt.tag_id = t.id
     GROUP BY t.id ORDER BY count DESC, t.name`
  );
}

/** Find or create a tag by name; returns its id. */
export function ensureTag(name: string, color: string | null = null): ID {
  const clean = name.trim().replace(/^#/, '');
  const existing = first<{ id: string }>('SELECT id FROM tags WHERE name = ?', [
    clean,
  ]);
  if (existing) return existing.id;
  const id = createId('tag');
  run('INSERT INTO tags(id, name, color) VALUES (?,?,?)', [id, clean, color]);
  return id;
}

export function deleteTag(id: ID): void {
  run('DELETE FROM tags WHERE id = ?', [id]);
}
