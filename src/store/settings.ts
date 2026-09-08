import { create } from "zustand";

export type PaginationMode = "load-more" | "infinite";

interface SettingsState {
  paginationMode: PaginationMode;
  setPaginationMode: (mode: PaginationMode) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  paginationMode: "load-more",
  setPaginationMode: (mode) => set({ paginationMode: mode }),
}));
