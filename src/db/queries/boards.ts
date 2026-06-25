import type {
  Board,
  BoardWithData,
  Card,
  ChecklistItem,
  Column,
  ID,
  Priority,
} from '@/types';
import { now } from '@/utils/date';
import { createId } from '@/utils/id';

import { all, bool, first, intBool, run, tx } from '../client';

// --- row mappers ------------------------------------------------------------

interface BoardRow {
  id: string;
  name: string;
  is_pinned: number;
  color: string | null;
  created_at: number;
  updated_at: number;
}
const mapBoard = (r: BoardRow): Board => ({
  id: r.id,
  name: r.name,
  isPinned: bool(r.is_pinned),
  color: r.color,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

interface CardRow {
  id: string;
  column_id: string;
  board_id: string;
  title: string;
  description: string;
  due_at: number | null;
  priority: number;
  sort: number;
  created_at: number;
  updated_at: number;
}
const mapCard = (r: CardRow): Card => ({
  id: r.id,
  columnId: r.column_id,
  boardId: r.board_id,
  title: r.title,
  description: r.description,
  dueAt: r.due_at,
  priority: r.priority as Priority,
  sort: r.sort,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  labels: labelsForCard(r.id),
  checklist: checklistForCard(r.id),
});

// --- boards -----------------------------------------------------------------

export function listBoards(): Board[] {
  return all<BoardRow>(
    'SELECT * FROM boards ORDER BY is_pinned DESC, updated_at DESC'
  ).map(mapBoard);
}

export function pinnedBoards(): Board[] {
  return all<BoardRow>(
    'SELECT * FROM boards WHERE is_pinned = 1 ORDER BY updated_at DESC'
  ).map(mapBoard);
}

export function getBoard(id: ID): BoardWithData | null {
  const row = first<BoardRow>('SELECT * FROM boards WHERE id = ?', [id]);
  if (!row) return null;
  const columns = all<{ id: string; board_id: string; name: string; sort: number }>(
    'SELECT * FROM columns WHERE board_id = ? ORDER BY sort',
    [id]
  ).map((c) => {
    const cards = all<CardRow>(
      'SELECT * FROM cards WHERE column_id = ? ORDER BY sort, created_at',
      [c.id]
    ).map(mapCard);
    return {
      id: c.id,
      boardId: c.board_id,
      name: c.name,
      sort: c.sort,
      cards,
    };
  });
  return { ...mapBoard(row), columns };
}

export function createBoard(name: string, withDefaults = true): Board {
  const ts = now();
  const id = createId('board');
  run(
    'INSERT INTO boards(id, name, is_pinned, created_at, updated_at) VALUES (?,?,0,?,?)',
    [id, name.trim(), ts, ts]
  );
  if (withDefaults) {
    ['To Do', 'In Progress', 'Done'].forEach((n, i) => addColumn(id, n, i));
  }
  return mapBoard(first<BoardRow>('SELECT * FROM boards WHERE id = ?', [id])!);
}

export function toggleBoardPin(id: ID): void {
  run('UPDATE boards SET is_pinned = 1 - is_pinned WHERE id = ?', [id]);
}

export function deleteBoard(id: ID): void {
  run('DELETE FROM boards WHERE id = ?', [id]);
}

function touchBoard(id: ID): void {
  run('UPDATE boards SET updated_at = ? WHERE id = ?', [now(), id]);
}

// --- columns ----------------------------------------------------------------

export function addColumn(boardId: ID, name: string, sort?: number): Column {
  const id = createId('col');
  const order =
    sort ??
    (first<{ n: number }>(
      'SELECT COALESCE(MAX(sort)+1,0) AS n FROM columns WHERE board_id = ?',
      [boardId]
    )?.n ??
      0);
  run('INSERT INTO columns(id, board_id, name, sort) VALUES (?,?,?,?)', [
    id,
    boardId,
    name.trim(),
    order,
  ]);
  return { id, boardId, name: name.trim(), sort: order };
}

export function renameColumn(id: ID, name: string): void {
  run('UPDATE columns SET name = ? WHERE id = ?', [name.trim(), id]);
}

export function deleteColumn(id: ID): void {
  run('DELETE FROM columns WHERE id = ?', [id]);
}

// --- cards ------------------------------------------------------------------

export function addCard(
  boardId: ID,
  columnId: ID,
  title: string,
  extra: Partial<Card> = {}
): Card {
  const ts = now();
  const id = createId('card');
  const sort =
    first<{ n: number }>(
      'SELECT COALESCE(MAX(sort)+1,0) AS n FROM cards WHERE column_id = ?',
      [columnId]
    )?.n ?? 0;
  run(
    `INSERT INTO cards(id, column_id, board_id, title, description, due_at, priority, sort, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      columnId,
      boardId,
      title.trim(),
      extra.description ?? '',
      extra.dueAt ?? null,
      extra.priority ?? 0,
      sort,
      ts,
      ts,
    ]
  );
  touchBoard(boardId);
  return mapCard(first<CardRow>('SELECT * FROM cards WHERE id = ?', [id])!);
}

export function updateCard(
  id: ID,
  patch: Partial<Pick<Card, 'title' | 'description' | 'dueAt' | 'priority'>>
): void {
  const c = first<CardRow>('SELECT * FROM cards WHERE id = ?', [id]);
  if (!c) return;
  run(
    `UPDATE cards SET title = ?, description = ?, due_at = ?, priority = ?, updated_at = ? WHERE id = ?`,
    [
      patch.title ?? c.title,
      patch.description ?? c.description,
      patch.dueAt !== undefined ? patch.dueAt : c.due_at,
      patch.priority ?? c.priority,
      now(),
      id,
    ]
  );
  touchBoard(c.board_id);
}

export function deleteCard(id: ID): void {
  run('DELETE FROM cards WHERE id = ?', [id]);
}

/** Reorder the cards in a column to match the given id order. */
export function reorderColumn(columnId: ID, orderedIds: ID[]): void {
  tx(() => {
    orderedIds.forEach((cardId, i) => {
      run('UPDATE cards SET sort = ?, column_id = ? WHERE id = ?', [
        i,
        columnId,
        cardId,
      ]);
    });
  });
}

/** Move a card to another column, appended at the end. */
export function moveCard(cardId: ID, toColumnId: ID): void {
  const sort =
    first<{ n: number }>(
      'SELECT COALESCE(MAX(sort)+1,0) AS n FROM cards WHERE column_id = ?',
      [toColumnId]
    )?.n ?? 0;
  run('UPDATE cards SET column_id = ?, sort = ?, updated_at = ? WHERE id = ?', [
    toColumnId,
    sort,
    now(),
    cardId,
  ]);
}

// --- labels & checklist -----------------------------------------------------

export function labelsForCard(cardId: ID): string[] {
  return all<{ label: string }>(
    'SELECT label FROM card_labels WHERE card_id = ? ORDER BY label',
    [cardId]
  ).map((r) => r.label);
}

export function setCardLabels(cardId: ID, labels: string[]): void {
  tx(() => {
    run('DELETE FROM card_labels WHERE card_id = ?', [cardId]);
    for (const label of labels) {
      run('INSERT OR IGNORE INTO card_labels(card_id, label) VALUES (?,?)', [
        cardId,
        label,
      ]);
    }
  });
}

export function checklistForCard(cardId: ID): ChecklistItem[] {
  return all<{ id: string; card_id: string; text: string; done: number; sort: number }>(
    'SELECT * FROM checklist_items WHERE card_id = ? ORDER BY sort',
    [cardId]
  ).map((r) => ({
    id: r.id,
    cardId: r.card_id,
    text: r.text,
    done: bool(r.done),
    sort: r.sort,
  }));
}

export function addChecklistItem(cardId: ID, text: string): ChecklistItem {
  const id = createId('chk');
  const sort =
    first<{ n: number }>(
      'SELECT COALESCE(MAX(sort)+1,0) AS n FROM checklist_items WHERE card_id = ?',
      [cardId]
    )?.n ?? 0;
  run(
    'INSERT INTO checklist_items(id, card_id, text, done, sort) VALUES (?,?,?,0,?)',
    [id, cardId, text.trim(), sort]
  );
  return { id, cardId, text: text.trim(), done: false, sort };
}

export function toggleChecklistItem(id: ID): void {
  run('UPDATE checklist_items SET done = 1 - done WHERE id = ?', [id]);
}

export function deleteChecklistItem(id: ID): void {
  run('DELETE FROM checklist_items WHERE id = ?', [id]);
}
