import { create } from 'zustand';

import { boardsQ } from '@/db';
import type { Board, BoardWithData, Card, ID, Priority } from '@/types';

interface BoardsState {
  boards: Board[];
  active: BoardWithData | null;
  refresh: () => void;
  open: (id: ID) => void;
  createBoard: (name: string) => Board;
  togglePin: (id: ID) => void;
  removeBoard: (id: ID) => void;
  addCard: (columnId: ID, title: string) => void;
  updateCard: (id: ID, patch: Partial<Pick<Card, 'title' | 'description' | 'dueAt' | 'priority'>>) => void;
  removeCard: (id: ID) => void;
  reorderColumn: (columnId: ID, orderedIds: ID[]) => void;
  moveCard: (cardId: ID, toColumnId: ID) => void;
  addColumn: (name: string) => void;
  setLabels: (cardId: ID, labels: string[]) => void;
  addChecklistItem: (cardId: ID, text: string) => void;
  toggleChecklistItem: (cardId: ID, itemId: ID) => void;
  removeChecklistItem: (cardId: ID, itemId: ID) => void;
}

export const useBoards = create<BoardsState>((set, get) => {
  const refresh = () => set({ boards: boardsQ.listBoards() });
  const reopen = () => {
    const id = get().active?.id;
    if (id) set({ active: boardsQ.getBoard(id) });
  };
  return {
    boards: [],
    active: null,
    refresh,
    open: (id) => set({ active: boardsQ.getBoard(id) }),
    createBoard: (name) => {
      const b = boardsQ.createBoard(name);
      refresh();
      return b;
    },
    togglePin: (id) => {
      boardsQ.toggleBoardPin(id);
      refresh();
      reopen();
    },
    removeBoard: (id) => {
      boardsQ.deleteBoard(id);
      refresh();
    },
    addCard: (columnId, title) => {
      const board = get().active;
      if (!board) return;
      boardsQ.addCard(board.id, columnId, title);
      reopen();
    },
    updateCard: (id, patch) => {
      boardsQ.updateCard(id, patch);
      reopen();
    },
    removeCard: (id) => {
      boardsQ.deleteCard(id);
      reopen();
    },
    reorderColumn: (columnId, orderedIds) => {
      boardsQ.reorderColumn(columnId, orderedIds);
      reopen();
    },
    moveCard: (cardId, toColumnId) => {
      boardsQ.moveCard(cardId, toColumnId);
      reopen();
    },
    addColumn: (name) => {
      const board = get().active;
      if (!board) return;
      boardsQ.addColumn(board.id, name);
      reopen();
    },
    setLabels: (cardId, labels) => {
      boardsQ.setCardLabels(cardId, labels);
      reopen();
    },
    addChecklistItem: (cardId, text) => {
      boardsQ.addChecklistItem(cardId, text);
      reopen();
    },
    toggleChecklistItem: (_cardId, itemId) => {
      boardsQ.toggleChecklistItem(itemId);
      reopen();
    },
    removeChecklistItem: (_cardId, itemId) => {
      boardsQ.deleteChecklistItem(itemId);
      reopen();
    },
  };
});

export type Priority_ = Priority; // re-export convenience
