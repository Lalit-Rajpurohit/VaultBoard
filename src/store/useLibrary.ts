import { create } from 'zustand';

import { foldersQ, tagsQ } from '@/db';
import type { Folder, ID, Tag } from '@/types';

/** Tags + folders — the lightweight "organization" store. */
interface LibraryState {
  tags: (Tag & { count: number })[];
  folders: (Folder & { count: number })[];
  refresh: () => void;
  ensureTag: (name: string) => ID;
  createFolder: (name: string) => Folder;
  renameFolder: (id: ID, name: string) => void;
  deleteFolder: (id: ID) => void;
  deleteTag: (id: ID) => void;
}

export const useLibrary = create<LibraryState>((set) => {
  const refresh = () =>
    set({ tags: tagsQ.tagsWithCounts(), folders: foldersQ.foldersWithCounts() });
  return {
    tags: [],
    folders: [],
    refresh,
    ensureTag: (name) => {
      const id = tagsQ.ensureTag(name);
      refresh();
      return id;
    },
    createFolder: (name) => {
      const f = foldersQ.createFolder(name);
      refresh();
      return f;
    },
    renameFolder: (id, name) => {
      foldersQ.renameFolder(id, name);
      refresh();
    },
    deleteFolder: (id) => {
      foldersQ.deleteFolder(id);
      refresh();
    },
    deleteTag: (id) => {
      tagsQ.deleteTag(id);
      refresh();
    },
  };
});
