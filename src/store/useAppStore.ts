import { create } from "zustand";
import type { ViewSelection } from "../db/types";

interface AppState {
  view: ViewSelection;
  setView: (view: ViewSelection) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  quickEntryOpen: boolean;
  openQuickEntry: () => void;
  closeQuickEntry: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  collapsedAreas: Record<string, boolean>;
  toggleAreaCollapsed: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: { kind: "smart", id: "today" },
  setView: (view) => set({ view, selectedTaskId: null }),
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  quickEntryOpen: false,
  openQuickEntry: () => set({ quickEntryOpen: true }),
  closeQuickEntry: () => set({ quickEntryOpen: false }),
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  collapsedAreas: {},
  toggleAreaCollapsed: (id) =>
    set((s) => ({ collapsedAreas: { ...s.collapsedAreas, [id]: !s.collapsedAreas[id] } })),
}));
