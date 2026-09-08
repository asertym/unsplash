import { invoke } from "@tauri-apps/api/core";

export const getFavorites = (): Promise<string> =>
  invoke("get_favorites");

export const saveFavorites = (ids: string[]): Promise<void> =>
  invoke("save_favorites", { ids });
