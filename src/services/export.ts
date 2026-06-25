// Classic FileSystem API (writeAsStringAsync / cacheDirectory) lives under
// /legacy on SDK 54.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { boardsQ, notesQ, tasksQ } from '@/db';

/** Build a full JSON snapshot of the vault (notes, tasks, boards). */
export function buildBackup(): string {
  const notes = notesQ.listNotes({ includeArchived: true });
  const boards = boardsQ.listBoards().map((b) => boardsQ.getBoard(b.id));
  const tasks = tasksQ.listTasks();
  return JSON.stringify(
    { version: 1, exportedAt: Date.now(), notes, boards, tasks },
    null,
    2
  );
}

/** Concatenate all notes into a single Markdown document. */
export function buildMarkdown(): string {
  const notes = notesQ.listNotes();
  return notes
    .map((n) => `# ${n.title || 'Untitled'}\n\n${n.bodyMd}\n`)
    .join('\n---\n\n');
}

async function writeAndShare(filename: string, contents: string, mime: string): Promise<void> {
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, contents);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: mime, dialogTitle: 'Export VaultBoard' });
  }
}

export async function exportJson(): Promise<void> {
  await writeAndShare('vaultboard-backup.json', buildBackup(), 'application/json');
}

export async function exportMarkdown(): Promise<void> {
  await writeAndShare('vaultboard-notes.md', buildMarkdown(), 'text/markdown');
}
