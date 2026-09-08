# Unsplash Wallpaper Browser — Project Guide

## Project Overview

Desktop app: **Tauri v2** (Rust backend) + **React + TypeScript** (Vite frontend). Browse Unsplash wallpapers in masonry grid. Features: search, favorites, lightbox, download (open + save), configurable pagination. Uses **shadcn/ui**.

**Key tech**: Tauri v2, React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS, unsplash-js (via Tauri proxy), CSS columns masonry.

---

## Quick Start

### Prerequisites

- **Rust** (latest stable): `cargo --version`
- **Node.js** 18+ : `node --version`
- **pnpm**: `pnpm --version`
- **Windows**: Visual Studio Build Tools (C++ workload)

### Scaffold Project

```bash
# Step 1: Create Tauri + React + TypeScript project
pnpm create tauri-app@latest ./ --template react-ts

# Step 2: Install shadcn/ui (must run from project root after Vite is scaffolded)
pnpm dlx shadcn@latest init -t vite

# Step 3: Install unsplash-js
pnpm add unsplash-js

# Step 4: Install additional deps
pnpm add zustand          # state management
pnpm add -D @types/node   # tsconfig @ alias support
```

### Run Development

```bash
pnpm tauri dev
```

### Build for Production

```bash
pnpm tauri build
```

Output: `src-tauri/target/release/bundle/`

---

## Architecture

```

src/                          # React frontend
├── components/
│   ├── ui/                   # shadcn/ui components (auto-generated)
│   ├── SearchBar.tsx
│   ├── MasonryGrid.tsx
│   ├── PhotoCard.tsx
│   ├── Lightbox.tsx
│   ├── FavoritesPanel.tsx
│   └── SettingsPanel.tsx
├── hooks/
│   ├── useUnsplash.ts        # API calls via Tauri invoke
│   ├── useFavorites.ts       # favorites persistence
│   └── useInfiniteScroll.ts  # scroll-based pagination
├── store/
│   └── settings.ts           # zustand store (pagination mode)
├── api/
│   └── client.ts             # Tauri invoke wrappers
└── App.tsx
src-tauri/                    # Rust backend
├── src/
│   ├── main.rs               # Tauri entry point
│   └── unsplash.rs           # HTTP proxy to Unsplash API
├── tauri.conf.json           # app config + access key
├── capabilities/
│   └── default.json          # frontend permissions
├── Cargo.toml
└── build.rs
package.json
pnpm-lock.yaml
```

### Data Flow

```
Frontend (React)
  └── invoke("search_photos", { query, page, perPage })
        ↓
Tauri Backend (Rust)
  └── http::get("https://api.unsplash.com/search/photos", headers={Authorization: Client-ID $KEY})
        ↓
Unsplash API
        ↓
Result → Frontend → MasonryGrid → PhotoCard
```

**Why proxy?** Unsplash API requires access key in `Authorization: Client-ID <key>` header. Shipping key in frontend would expose it. Tauri backend holds key securely and proxies all requests.

---

## Key Files & Responsibilities

| File                                | Role                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------- | ----------- |
| `src-tauri/tauri.conf.json`         | App name, bundle ID, window config, **access key**, capabilities                      |
| `src-tauri/src/unsplash.rs`         | Rust fns: `search_photos`, `get_topic_photos`, `get_photo_detail`, `get_download_url` |
| `src-tauri/src/main.rs`             | Tauri builder, registers Rust commands                                                |
| `src/api/client.ts`                 | `invoke()` wrappers: `searchPhotos()`, `getTopicPhotos()`, etc.                       |
| `src/hooks/useUnsplash.ts`          | React query / manual fetch hook with loading/error states                             |
| `src/hooks/useFavorites.ts`         | Read/write `appDir/favorites.json`, add/remove/toggle photo                           |
| `src/hooks/useInfiniteScroll.ts`    | IntersectionObserver hook for auto-load-more                                          |
| `src/store/settings.ts`             | zustand store: `paginationMode: 'load-more'                                           | 'infinite'` |
| `src/components/MasonryGrid.tsx`    | CSS columns grid, handles responsive column count                                     |
| `src/components/PhotoCard.tsx`      | Image + blurhash placeholder + heart + attribution                                    |
| `src/components/Lightbox.tsx`       | Fullscreen overlay, photo info, open/save buttons                                     |
| `src/components/SearchBar.tsx`      | Debounced search input (shadcn Input)                                                 |
| `src/components/FavoritesPanel.tsx` | Slide-out panel of favorited photos                                                   |
| `src/components/SettingsPanel.tsx`  | Dialog with pagination mode toggle                                                    |

---

## Unsplash API Integration

### Authentication

- **Type**: Public authentication (`Client-ID` header)
- **Key storage**: `src-tauri/tauri.conf.json` → `tauri > bundle > windows > env` or separate config file read by Rust at runtime
- **Rate limit**: 50 req/hr (demo) / 1000 req/hr (production)

### Endpoints Used

| Endpoint                        | Purpose          | Params                                  |
| ------------------------------- | ---------------- | --------------------------------------- |
| `GET /topics/wallpapers/photos` | Topic browsing   | `page`, `per_page` (max 30)             |
| `GET /search/photos`            | Search           | `query`, `page`, `per_page`, `order_by` |
| `GET /photos/{id}`              | Photo detail     | path param `id`                         |
| `GET /photos/{id}/download`     | Download trigger | path param `id`                         |

### Image URL Strategy

| Use Case               | URL                   | Why                                    |
| ---------------------- | --------------------- | -------------------------------------- |
| Masonry grid thumbnail | `regular` (1080px)    | Good balance quality/perf              |
| Lightbox display       | `raw` + `w=1920&q=80` | High-res, browser-resized              |
| BlurHash placeholder   | `blur_hash` field     | Shimmer/blur placeholder while loading |
| Small card thumb       | `small` (400px)       | Optional for favs panel                |

### Attribution Requirement

Every image **must** show photographer name + link to their Unsplash profile. Display in `PhotoCard` footer and `Lightbox`.

---

## shadcn/ui Components Used

| Component    | Purpose                                |
| ------------ | -------------------------------------- |
| `Button`     | Primary actions, search submit         |
| `Input`      | Search bar                             |
| `Card`       | Photo card wrapper                     |
| `Dialog`     | Settings panel, lightbox (alternative) |
| `Sheet`      | Favorites slide-out panel              |
| `Switch`     | Pagination mode toggle                 |
| `Skeleton`   | Loading placeholders                   |
| `Badge`      | "New", "Featured" tags                 |
| `Tooltip`    | Heart icon tooltip                     |
| `ScrollArea` | Favorites panel scroll                 |
| `Toast`      | Success/error feedback                 |

Add components as needed: `pnpm dlx shadcn@latest add <component>`

---

## Data Storage / Persistence

| Data       | Location                    | Format                           |
| ---------- | --------------------------- | -------------------------------- |
| Favorites  | `<appDir>/favorites.json`   | JSON array of photo IDs          |
| Settings   | `<appDir>/settings.json`    | JSON (pagination mode)           |
| Access key | `tauri.conf.json` (bundled) | String (not exposed to frontend) |

`appDir` resolved at runtime via Tauri's `@tauri-apps/plugin-path` or `invoke` from Rust.

---

## Environment Configuration

| Variable              | Required | Purpose                                                 |
| --------------------- | -------- | ------------------------------------------------------- |
| `UNSPLASH_ACCESS_KEY` | Yes      | Unsplash API key (in `tauri.conf.json`)                 |
| `UNSPLASH_BASE_URL`   | No       | Override API base (default: `https://api.unsplash.com`) |

No `.env` file needed — key baked into Tauri config at build time.

---

## Development Tasks

### Add a New Tauri Command

1. Add fn in `src-tauri/src/unsplash.rs`
2. Export with `#[tauri::command]`
3. Register in `src-tauri/src/main.rs`: `commands: [search_photos, ...]`
4. Add wrapper in `src/api/client.ts`
5. Call from React hook

### Add a New shadcn Component

```bash
pnpm dlx shadcn@latest add <component-name>
```

Then import from `@/components/ui/<component>`.

### Change App Window Behavior

Edit `src-tauri/tauri.conf.json`:

- `window > width/height` — initial size
- `window > resizable` — true/false
- `window > center` — center on screen

---

## Testing

No formal test suite yet. Manual testing via `pnpm tauri dev`.

To add tests later:

- **Rust**: `cargo test --manifest-path src-tauri/Cargo.toml`
- **Frontend**: `pnpm add -D vitest @vitejs/plugin-react`

---

## Performance Notes

- **Lazy load images**: Use `loading="lazy"` on `<img>`; CSS columns masonry handles natural height
- **BlurHash**: Decode with `blurhash` crate (Rust) or `blurhash` npm package for placeholder while image loads
- **Debounce search**: 300ms debounce on search input before invoking API
- **Image sizing**: Use `regular` (1080px) for grid, not `full` (raw dimensions)
- **Pagination**: `per_page: 20` is a good balance; max is 30

---

## Documentation Sources (context7)

**context7 is installed and enabled** (`@upstash/context7-pi`). Use it to fetch current, version-specific docs before making assumptions:

| Library         | context7 Query                   |
| --------------- | -------------------------------- |
| Unsplash API    | `unsplash api documentation`     |
| unsplash-js     | `unsplash-js npm documentation`  |
| Tauri v2        | `tauri v2 documentation`         |
| shadcn/ui       | `shadcn/ui react documentation`  |
| Tailwind CSS v4 | `tailwindcss vite documentation` |

Trigger: just ask a docs question — context7 auto-invokes. Or explicitly: `/context7 <query>`.

**Always verify** API surface, breaking changes, and parameter names via context7 before coding.