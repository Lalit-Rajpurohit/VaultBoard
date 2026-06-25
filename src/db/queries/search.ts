import type { SearchResult } from '@/types';
import { plainPreview } from '@/utils/text';

import { all } from '../client';

/** Turn raw user input into a safe FTS5 prefix query: `foo bar` -> `foo* bar*`. */
function toFtsQuery(raw: string): string {
  const terms = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return '';
  return terms.map((t) => `${t}*`).join(' ');
}

export interface SearchFilters {
  types?: ('note' | 'task' | 'card')[];
}

export function search(raw: string, filters: SearchFilters = {}): SearchResult[] {
  const query = raw.trim();
  if (query.length < 1) return [];
  const types = filters.types ?? ['note', 'task', 'card'];
  const results: SearchResult[] = [];

  // Notes via FTS5.
  if (types.includes('note')) {
    const fts = toFtsQuery(query);
    if (fts) {
      const rows = all<{
        note_id: string;
        title: string;
        body: string;
        updated_at: number;
      }>(
        `SELECT f.note_id, n.title, n.body_md AS body, n.updated_at
         FROM notes_fts f JOIN notes n ON n.id = f.note_id
         WHERE notes_fts MATCH ? AND n.is_archived = 0
         ORDER BY rank LIMIT 30`,
        [fts]
      );
      for (const r of rows) {
        results.push({
          id: r.note_id,
          type: 'note',
          title: r.title || 'Untitled',
          snippet: plainPreview(r.body, 100),
          updatedAt: r.updated_at,
        });
      }
    }
  }

  const like = `%${query.replace(/[%_]/g, '')}%`;

  // Cards via LIKE (small dataset).
  if (types.includes('card')) {
    const rows = all<{
      id: string;
      title: string;
      description: string;
      updated_at: number;
    }>(
      `SELECT id, title, description, updated_at FROM cards
       WHERE title LIKE ? OR description LIKE ? ORDER BY updated_at DESC LIMIT 20`,
      [like, like]
    );
    for (const r of rows) {
      results.push({
        id: r.id,
        type: 'card',
        title: r.title,
        snippet: plainPreview(r.description, 80),
        updatedAt: r.updated_at,
      });
    }
  }

  // Tasks via LIKE.
  if (types.includes('task')) {
    const rows = all<{ id: string; title: string; created_at: number }>(
      `SELECT id, title, created_at FROM tasks WHERE title LIKE ?
       ORDER BY created_at DESC LIMIT 20`,
      [like]
    );
    for (const r of rows) {
      results.push({
        id: r.id,
        type: 'task',
        title: r.title,
        snippet: '',
        updatedAt: r.created_at,
      });
    }
  }

  return results;
}
