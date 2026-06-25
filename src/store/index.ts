import { useBoards } from './useBoards';
import { useLibrary } from './useLibrary';
import { useNotes } from './useNotes';
import { useSettings } from './useSettings';
import { useTasks } from './useTasks';

export { useSettings } from './useSettings';
export { useNotes, sortNotes, type NoteSort } from './useNotes';
export { useBoards } from './useBoards';
export { useTasks } from './useTasks';
export { useLibrary } from './useLibrary';
export { useUI } from './useUI';

/** Hydrate every store from the DB after migrations + seed have run. */
export function hydrateStores(): void {
  useSettings.getState().hydrate();
  useNotes.getState().refresh();
  useBoards.getState().refresh();
  useTasks.getState().refresh();
  useLibrary.getState().refresh();
}
