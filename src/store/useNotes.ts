import { create } from 'zustand';

import { notesQ } from '@/db';
import type { ID, Note } from '@/types';

export type NoteSort = 'updated' | 'created' | 'alpha';

interface NotesState {
  notes: Note[];
  refresh: () => void;
  create: (partial?: Partial<Note>) => Note;
  update: (id: ID, patch: Partial<Pick<Note, 'title' | 'bodyMd' | 'folderId' | 'coverUri'>>) => void;
  togglePin: (id: ID) => void;
  toggleFavorite: (id: ID) => void;
  archive: (id: ID) => void;
  remove: (id: ID) => void;
  duplicate: (id: ID) => Note | null;
  setTags: (id: ID, tagIds: ID[]) => void;
}

export const useNotes = create<NotesState>((set) => {
  const refresh = () => set({ notes: notesQ.listNotes() });
  return {
    notes: [],
    refresh,
    create: (partial) => {
      const note = notesQ.createNote(partial);
      refresh();
      return note;
    },
    update: (id, patch) => {
      notesQ.updateNote(id, patch);
      refresh();
    },
    togglePin: (id) => {
      notesQ.togglePin(id);
      refresh();
    },
    toggleFavorite: (id) => {
      notesQ.toggleFavorite(id);
      refresh();
    },
    archive: (id) => {
      notesQ.archiveNote(id, true);
      refresh();
    },
    remove: (id) => {
      notesQ.deleteNote(id);
      refresh();
    },
    duplicate: (id) => {
      const copy = notesQ.duplicateNote(id);
      refresh();
      return copy;
    },
    setTags: (id, tagIds) => {
      notesQ.setNoteTags(id, tagIds);
      refresh();
    },
  };
});

/** Sort helper kept out of the store so screens can sort derived lists. */
export function sortNotes(notes: Note[], sort: NoteSort): Note[] {
  const copy = [...notes];
  switch (sort) {
    case 'created':
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case 'alpha':
      return copy.sort((a, b) => (a.title || 'Untitled').localeCompare(b.title || 'Untitled'));
    default:
      return copy.sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.updatedAt - a.updatedAt);
  }
}
