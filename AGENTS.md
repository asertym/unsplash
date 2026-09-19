# Unsplash Wallpaper Browser — Agent Guide

Tauri v2 desktop app (Rust backend + React/TypeScript frontend via Vite). Browse Unsplash wallpapers in a CSS-columns masonry grid with search, topics, favorites, lightbox, and download. Uses shadcn/ui and zustand.

## Dev environment

- **pnpm** (required — lockfile present, npm/yarn will fail)
- **Rust** (latest stable): `cargo --version`
- **Node.js** 18+: `node --version`
- **Windows**: Visual Studio Build Tools with C++ workload

Install deps: `pnpm install`

## Build & test

| Command | What |
|---|---|
| `pnpm tauri dev` | Full app with hot reload (Vite on :1420, Rust recompiles on change) |
| `pnpm tauri build` | Production build → `src-tauri/target/release/bundle/` |
| `pnpm build` | Frontend only (Vite + tsc) → `dist/` |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Rust tests |

No frontend test suite exists yet. Manual testing via `pnpm tauri dev`.

## Architecture

```
src/                          React frontend
├── components/
│   ├── ui/                   shadcn/ui (auto-generated)
│   ├── SearchBar.tsx
│   ├── MasonryGrid.tsx       CSS columns masonry, responsive 1-4 cols
│   ├── PhotoCard.tsx
│   ├── Lightbox.tsx
│   ├── FavoritesPanel.tsx
│   ├── SettingsPanel.tsx
│   └── TopicBar.tsx
├── hooks/
│   ├── useUnsplash.ts        unsplash-js calls (direct, no Tauri proxy); PER_PAGE = 20
│   ├── useFavorites.ts       Persists to <appDir>/favorites.json via Tauri invoke
│   └── useInfiniteScroll.ts  IntersectionObserver for pagination
├── store/
│   └── settings.ts           zustand: paginationMode ('load-more' | 'infinite')
├── api/
│   ├── client.ts             Tauri invoke wrappers (getFavorites, saveFavorites)
│   └── unsplashClient.ts     unsplash-js API calls (searchPhotos, getTopicPhotos, getPhotoDetail, getDownloadUrl)
└── App.tsx

src-tauri/
├── src/
│   ├── main.rs               Tauri entry (just calls lib.rs::run())
│   ├── lib.rs                Builder: registers get_favorites, save_favorites commands
│   └── unsplash.rs           Rust fns: get_favorites, save_favorites (file I/O)
├── tauri.conf.json           App config, window 1400×900, VITE_UNSPLASH_ACCESS_KEY in env
└── capabilities/default.json Frontend permissions
```

**Note**: This app calls the Unsplash API **directly from the frontend** via `unsplash-js` using `VITE_UNSPLASH_ACCESS_KEY` (set in `tauri.conf.json` → `env`). The Rust backend only handles favorites file persistence, not API proxying.

## Unsplash API

- **Auth**: Public (`Client-ID` header via unsplash-js `accessKey` option)
- **Rate limits**: 50 req/hr (demo key) / 1000 req/hr (production)
- **Endpoints used**:
  - `GET /search/photos` — params: `query`, `page`, `per_page` (max 30), `order_by`
  - `GET /topics/{slug}/photos` — params: `page`, `per_page` (max 30)
  - `GET /photos/{id}` — photo detail
  - `GET /photos/{id}/download` — download URL trigger
- **Attribution**: Every image must show photographer name + link to their Unsplash profile (in `PhotoCard` footer and `Lightbox`)

## shadcn/ui Components Used

`Button`, `Input`, `Card`, `CardContent`, `Dialog`, `Sheet`, `Switch`, `Skeleton`, `Badge`, `Tooltip`, `ScrollArea`, `Toast` (Sonner). Add new ones with: `pnpm dlx shadcn@latest add <component>`.

## Data Storage

| Data | Location | Format |
|---|---|---|
| Favorites | `<appDir>/favorites.json` | JSON array of photo IDs |
| Settings | `<appDir>/settings.json` | JSON (pagination mode) |

`appDir` = `dirs::data_local_dir()` (Linux: `~/.local/share/com.alex.unsplash-wallpapers/`).

## Conventions

- **Path aliases**: `@/*` → `./src/*` (tsconfig `paths`)
- **Tauri commands**: Add fn in `src-tauri/src/unsplash.rs` with `#[tauri::command]`, register in `src-tauri/src/lib.rs` `generate_handler![]`, add wrapper in `src/api/client.ts`
- **shadcn components**: `pnpm dlx shadcn@latest add <name>` → import from `@/components/ui/<name>`
- **Icons**: `@phosphor-icons/react` (weight prop for stroke/fill variants)
- **Strict TypeScript**: `noUnusedLocals`, `noUnusedParameters`, `strict` enabled — unused imports/vars are errors
- **Image URLs**: `regular` (1080px) for grid, `raw` for lightbox, `small` for favs panel, `blur_hash` for placeholders
- **Pagination**: `per_page: 20` (hardcoded in `useUnsplash.ts`); max is 30
- **Window behavior**: Edit `src-tauri/tauri.conf.json` → `app.windows[*].width/height/resizable/center`

## Performance

- Images: `loading="lazy"` on `<img>`; CSS columns masonry handles natural height
- BlurHash: decoded client-side via `blurhash` npm package for shimmer placeholder while image loads
- Search debounce: 300ms on search input before invoking API

## Pitfalls

- **Must use pnpm** — `pnpm-lock.yaml` is committed; `npm install` or `yarn` will fail
- **VITE_UNSPLASH_ACCESS_KEY** is in `tauri.conf.json` → `tauri.bundle.windows.env` (not `.env`) — the build embeds it at compile time
- **No API proxy** — the access key is exposed in the frontend bundle; acceptable for a desktop app
- **Rust entry**: `main.rs` is 6 lines; the real builder is in `lib.rs` — editing `main.rs` alone won't register new commands
- **Favorites persistence**: uses `dirs::data_local_dir()`, not Tauri's path plugin
- **Tauri dev port**: Vite runs on `:1420`, not the usual `:5173` (configured in `tauri.conf.json` → `build.devUrl`)

## Documentation

**context7 is installed and enabled** (`@upstash/context7-pi`). Use it to fetch current, version-specific docs:

| Library | context7 Query |
|---|---|
| Unsplash API | `unsplash api documentation` |
| unsplash-js | `unsplash-js npm documentation` |
| Tauri v2 | `tauri v2 documentation` |
| shadcn/ui | `shadcn/ui react documentation` |
| Tailwind CSS v4 | `tailwindcss vite documentation` |

Trigger: just ask a docs question — context7 auto-invokes. Or explicitly: `/context7 <query>`. Always verify API surface, breaking changes, and parameter names via context7 before coding.
