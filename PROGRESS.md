# Progress — Unsplash Wallpaper Browser

## Project Status

**Stack**: Tauri v2 (Rust) + React 19 + TypeScript + Vite + shadcn/ui + Tailwind CSS v4
**State**: Core app scaffolded and integrated. Several bugs and missing features need fixing.

---

## Completed

- [x] Tauri v2 project scaffolded (React + TypeScript + Vite)
- [x] shadcn/ui initialized with core components (Button, Input, Card, Dialog, Sheet, Switch, Skeleton, Badge, Tooltip, ScrollArea, Sonner)
- [x] Tauri backend: Unsplash API proxy (`search_photos`, `get_topic_photos`, `get_photo_detail`, `get_download_url`)
- [x] Frontend API client (`src/api/client.ts`) with TypeScript types
- [x] `useUnsplash` hook — search with debounced input, pagination state
- [x] `useFavorites` hook — localStorage persistence, toggle, get details
- [x] `useInfiniteScroll` hook — IntersectionObserver-based
- [x] `useSettingsStore` — zustand store for pagination mode
- [x] `SearchBar` — debounced search input (300ms), clear button, Enter key support
- [x] `MasonryGrid` — CSS columns responsive grid (1-4 cols), skeleton loading
- [x] `PhotoCard` — image with lazy load, hover overlay, attribution, favorite button
- [x] `Lightbox` — fullscreen overlay, photo info, favorite/open/save actions, Escape key
- [x] `FavoritesPanel` — slide-out sheet, grid of favorited photos, remove action
- [x] `SettingsPanel` — dialog with pagination mode toggle (load-more vs infinite)
- [x] `App.tsx` — integrates all components, header with search + favs + settings
- [x] Dark mode CSS variables via Tailwind v4
- [x] Tailwind CSS v4 + `@tailwindcss/vite` plugin configured
- [x] `@` path alias configured in vite.config.ts and tsconfig

---

## In Progress

_None yet._

---

## TODO / Known Issues

### P0 — Bugs ✅ FIXED

- [x] **Bug: `useUnsplash.loadMore` stale closure** — Fixed by adding `searchRef` to always point to latest search impl; `loadMore` now uses ref instead of captured closure.
- [x] **Bug: `SettingsPanel` imports `Label` from wrong path** — Changed from `@/components/ui/input` to `@/components/ui/label`.
- [x] **Bug: `MasonryGrid` ignores pagination mode** — Added `paginationMode` prop; auto-load only triggers in `infinite` mode.
- [x] **Bug: `handleSave` in App.tsx** — Now uses unsplash-js `getDownloadUrl` instead of Tauri invoke, parses the returned URL, and opens it via `openUrl`.
- [x] **Bug: `label.tsx` had wrong path `src/lib/utils`** — Fixed to `@/lib/utils`.
- [x] **Bug: `@phosphor-icons/react` missing `ExternalLink` and `Search`** — Replaced with `Link` icon and inline SVG for search.
- [x] **Bug: `@tauri-apps/plugin-opener` exports `openUrl` not `open`** — Updated imports and calls.
- [x] **Bug: `useTopicPhotos` parsed response incorrectly** — Fixed to parse `{ results, total, total_pages }` shape.
- [x] **Bug: tsconfig missing `baseUrl`** — Added `baseUrl: "."` so `@/` path alias resolves with `tsc`.
- [x] **Cleanup: removed unused `Badge` import (PhotoCard), unused `PaginationMode` import (SettingsPanel)**.
- [x] **Bug: Rust `#[tauri::command]` functions not `pub`** — Made all command fns `pub` so `generate_handler!` can access them across module boundary.

### P1 — Missing Features

- [x] **Dark mode toggle** — Added sun/moon toggle button in header using `next-themes` `ThemeProvider` + `useTheme`. Toggles between light/dark via `setTheme`. System preference respected as default.
- [x] **Topic browsing** — Added `TopicBar` component with 7 topic badges (Wallpapers, Nature, Technology, Architecture, Travel, Minimal, Animals). Clicking a topic searches for that topic; clicking again or "All" clears the filter.
- [x] **`useInfiniteScroll` integrated** — `MasonryGrid` now uses the `useInfiniteScroll` hook with an IntersectionObserver sentinel element. Auto-loads only in `infinite` mode.
- [x] **Favorites persistence migrated to Tauri fs** — Added `get_favorites` and `save_favorites` Tauri commands. Favorites now stored in `<dataLocal>/com.alex.unsplash-wallpapers/favorites.json`. Hook loads on mount and persists on every change.
- [x] **Real Unsplash API key** — Added to `.env`.

### P2 — Polish

- [x] **Empty-state topic suggestion** — Empty state now suggests topics to browse.
- [x] **Keyboard navigation in lightbox** — Arrow left/right navigates prev/next photo. Navigation arrows appear on hover.
- [x] Add image blurhash placeholder while loading — uses `blurhash` npm package to decode hash to canvas data URL, shown as low-opacity blurred placeholder beneath the image.
- [x] **Window title updates** — Title reflects current search query or active topic (e.g. "nature · Unsplash Wallpapers").

---

## Notes

- `UNSPLASH_ACCESS_KEY` is now read from `VITE_UNSPLASH_ACCESS_KEY` env var by the frontend `unsplash-js` client.
- `unsplash-js` is used in the frontend for all Unsplash API calls; Rust backend keeps only favorites persistence
- TypeScript compiles clean (`pnpm tsc --noEmit` passes). Rust compiles clean (`cargo check` passes).
- Favorites now persist to `<dataLocal>/com.alex.unsplash-wallpapers/favorites.json` via Tauri commands.
