import { migrate } from './migrate';
import { seedIfEmpty } from './seed';

export * as notesQ from './queries/notes';
export * as boardsQ from './queries/boards';
export * as tasksQ from './queries/tasks';
export * as tagsQ from './queries/tags';
export * as foldersQ from './queries/folders';
export * as searchQ from './queries/search';
export * as settingsQ from './queries/settings';
export { getDb } from './client';

/** Call once at app start: run migrations then seed demo content if empty. */
export function initDatabase(): void {
  migrate();
  seedIfEmpty();
}
