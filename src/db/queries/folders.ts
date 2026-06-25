import type { Folder, ID } from '@/types';
import { createId } from '@/utils/id';

import { all, run } from '../client';

interface FolderRow {
  id: string;
  name: string;
  parent_id: string | null;
  color: string | null;
  sort: number;
}

const mapFolder = (r: FolderRow): Folder => ({
  id: r.id,
  name: r.name,
  parentId: r.parent_id,
  color: r.color,
  sort: r.sort,
});

export function listFolders(): Folder[] {
  return all<FolderRow>('SELECT * FROM folders ORDER BY sort, name').map(
    mapFolder
  );
}

export function foldersWithCounts(): (Folder & { count: number })[] {
  return all<FolderRow & { count: number }>(
    `SELECT f.*, COUNT(n.id) AS count
     FROM folders f LEFT JOIN notes n ON n.folder_id = f.id AND n.is_archived = 0
     GROUP BY f.id ORDER BY f.sort, f.name`
  ).map((r) => ({ ...mapFolder(r), count: r.count }));
}

export function createFolder(name: string, parentId: ID | null = null): Folder {
  const id = createId('fold');
  run('INSERT INTO folders(id, name, parent_id, sort) VALUES (?,?,?,0)', [
    id,
    name.trim(),
    parentId,
  ]);
  return { id, name: name.trim(), parentId, color: null, sort: 0 };
}

export function renameFolder(id: ID, name: string): void {
  run('UPDATE folders SET name = ? WHERE id = ?', [name.trim(), id]);
}

export function deleteFolder(id: ID): void {
  run('DELETE FROM folders WHERE id = ?', [id]);
}
