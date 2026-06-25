import { create } from 'zustand';

/** Transient UI state: the global Quick-Add sheet visibility. */
interface UIState {
  quickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
}

export const useUI = create<UIState>((set) => ({
  quickAddOpen: false,
  openQuickAdd: () => set({ quickAddOpen: true }),
  closeQuickAdd: () => set({ quickAddOpen: false }),
}));
