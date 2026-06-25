/**
 * Shared domain types for VaultBoard.
 * These mirror the SQLite schema (see src/db/schema.ts). Integer booleans from
 * SQLite (0 / 1) are mapped to real booleans inside the query layer, so types
 * here use `boolean` rather than 0 | 1.
 */

export type ID = string;
export type Timestamp = number; // epoch milliseconds

export type Priority = 0 | 1 | 2 | 3; // 0 none, 1 low, 2 medium, 3 high
export const PRIORITY_LABELS: Record<Priority, string> = {
  0: 'None',
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type OwnerType = 'note' | 'card';
export type AttachmentKind = 'image' | 'file';

export interface Folder {
  id: ID;
  name: string;
  parentId: ID | null;
  color: string | null;
  sort: number;
}

export interface Tag {
  id: ID;
  name: string;
  color: string | null;
}

export interface Note {
  id: ID;
  title: string;
  bodyMd: string;
  folderId: ID | null;
  coverUri: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  wordCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** Hydrated by query layer when requested. */
  tags?: Tag[];
}

export interface Board {
  id: ID;
  name: string;
  isPinned: boolean;
  color: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Column {
  id: ID;
  boardId: ID;
  name: string;
  sort: number;
}

export interface ChecklistItem {
  id: ID;
  cardId: ID;
  text: string;
  done: boolean;
  sort: number;
}

export interface Card {
  id: ID;
  columnId: ID;
  boardId: ID;
  title: string;
  description: string;
  dueAt: Timestamp | null;
  priority: Priority;
  sort: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** Hydrated by query layer. */
  labels?: string[];
  checklist?: ChecklistItem[];
}

export interface Task {
  id: ID;
  title: string;
  noteId: ID | null;
  cardId: ID | null;
  dueAt: Timestamp | null;
  priority: Priority;
  status: TaskStatus;
  recurrence: Recurrence;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface Attachment {
  id: ID;
  ownerType: OwnerType;
  ownerId: ID;
  uri: string;
  kind: AttachmentKind;
  createdAt: Timestamp;
}

/** A board with its columns and cards hydrated — used by the board detail screen. */
export interface BoardWithData extends Board {
  columns: (Column & { cards: Card[] })[];
}

/** Unified global-search result row. */
export interface SearchResult {
  id: ID;
  type: 'note' | 'task' | 'card';
  title: string;
  snippet: string;
  updatedAt: Timestamp;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentKey = 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
export type TypographyScale = 'compact' | 'default' | 'comfortable';

export interface AppSettings {
  themeMode: ThemeMode;
  accent: AccentKey;
  typography: TypographyScale;
  appLockEnabled: boolean;
  onboarded: boolean;
}
