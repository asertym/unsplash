import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type PaginationMode = "load-more" | "infinite";
export type Orientation = "portrait" | "landscape";

interface SettingsState {
  paginationMode: PaginationMode;
  setPaginationMode: (mode: PaginationMode) => void;
  orientation: Orientation | null;
  setOrientation: (orientation: Orientation | null) => void;
  saveFolder: string | null;
  setSaveFolder: (folder: string | null) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  paginationMode: "load-more",
  setPaginationMode: (mode) => set({ paginationMode: mode }),
  orientation: null,
  setOrientation: (orientation) => set({ orientation }),
  saveFolder: null,
  setSaveFolder: async (folder) => {
    set({ saveFolder: folder });
    try {
      await invoke("save_settings", { settings: { saveFolder: folder } });
    } catch (e) {
      console.error("[settings] failed to persist saveFolder:", e);
    }
  },
}));

export async function loadSettings() {
  try {
    const s = await invoke<Record<string, unknown>>("get_settings");
    if (typeof s?.saveFolder === "string") {
      useSettingsStore.setState({ saveFolder: s.saveFolder });
    }
  } catch (e) {
    console.error("[settings] failed to load:", e);
  }
}
