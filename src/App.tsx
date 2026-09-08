import { useState, useCallback, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { SearchBar } from "@/components/SearchBar";
import { MasonryGrid } from "@/components/MasonryGrid";
import { TopicBar } from "@/components/TopicBar";
import { Lightbox } from "@/components/Lightbox";
import { FavoritesPanel } from "@/components/FavoritesPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Heart, Image, Sun, Moon } from "@phosphor-icons/react";
import { useUnsplash } from "@/hooks/useUnsplash";
import { useFavorites } from "@/hooks/useFavorites";
import { useSettingsStore } from "@/store/settings";
import { openUrl } from "@tauri-apps/plugin-opener";
import { getDownloadUrl } from "@/api/unsplashClient";

function App() {
	const { paginationMode } = useSettingsStore();
	const { theme, setTheme } = useTheme();
	const { photos, loading, error, hasMore, search, loadMore } = useUnsplash();
	const { isFavorite, toggleFavorite, favorites, getFavoritePhotos } =
		useFavorites();
	const [lightboxPhoto, setLightboxPhoto] = useState<(typeof photos)[0] | null>(
		null,
	);
	const [favoritesOpen, setFavoritesOpen] = useState(false);
	const [favoritePhotos, setFavoritePhotos] = useState<typeof photos>([]);
	const [favLoading, setFavLoading] = useState(false);
	const [activeTopic, setActiveTopic] = useState<string | null>(null);
	const queryRef = useRef("");
	const [lightboxIndex, setLightboxIndex] = useState(-1);

	const handleSearch = useCallback(
		(query: string) => {
			setActiveTopic(null);
			queryRef.current = query;
			search(query, true);
		},
		[search],
	);

	const handleSelectTopic = useCallback(
		(slug: string) => {
			if (activeTopic === slug) {
				setActiveTopic(null);
				search("", true);
			} else {
				setActiveTopic(slug);
				search(slug, true);
			}
		},
		[activeTopic, search],
	);

	const handleClearTopic = useCallback(() => {
		setActiveTopic(null);
		search("", true);
	}, [search]);

	const handleLoadMore = useCallback(() => {
		loadMore();
	}, [loadMore]);

	const handleOpenLightbox = useCallback(
		(photo: (typeof photos)[0]) => {
			setLightboxPhoto(photo);
			setLightboxIndex(photos.findIndex((p) => p.id === photo.id));
		},
		[photos],
	);

	const handleLightboxPrev = useCallback(() => {
		setLightboxIndex((i) => {
			const next = i - 1;
			if (next >= 0) {
				setLightboxPhoto(photos[next]);
				return next;
			}
			return i;
		});
	}, [photos]);

	const handleLightboxNext = useCallback(() => {
		setLightboxIndex((i) => {
			const next = i + 1;
			if (next < photos.length) {
				setLightboxPhoto(photos[next]);
				return next;
			}
			return i;
		});
	}, [photos]);

	const handleCloseLightbox = useCallback(() => {
		setLightboxPhoto(null);
	}, []);

	const handleToggleFavorite = useCallback(
		(id: string) => {
			toggleFavorite(id);
			const wasFav = isFavorite(id);
			toast(wasFav ? "Removed from favorites" : "Added to favorites", {
				description: wasFav
					? "Photo removed from your collection"
					: "Photo saved to your collection",
			});
		},
		[isFavorite, toggleFavorite],
	);

	const handleOpenInBrowser = useCallback(async (url: string) => {
		await openUrl(url);
	}, []);

	const handleSave = useCallback(async () => {
		if (!lightboxPhoto?.id) return;
		try {
			const result = await getDownloadUrl(lightboxPhoto.id);
			if (result.error || !result.data?.url) {
				throw new Error("Could not get download URL");
			}
			toast("Download started", {
				description: "Opening photo in your browser for saving",
			});
			await openUrl(result.data.url);
		} catch {
			toast.error("Download failed", {
				description:
					"Could not get download URL. Try opening the photo instead.",
			});
		}
	}, [lightboxPhoto]);

	const handleOpenFavorites = useCallback(async () => {
		setFavoritesOpen(true);
		setFavLoading(true);
		try {
			const favs = await getFavoritePhotos();
			setFavoritePhotos(favs);
		} finally {
			setFavLoading(false);
		}
	}, [getFavoritePhotos]);

	const handleRemoveFavorite = useCallback(
		(id: string) => {
			toggleFavorite(id);
			setFavoritePhotos((prev) => prev.filter((p) => p.id !== id));
		},
		[toggleFavorite],
	);

	useEffect(() => {
		if (error) {
			toast.error("Error", { description: error });
		}
	}, [error]);

	// Update window title with current search query
	useEffect(() => {
		const q = queryRef.current || (activeTopic ? `#${activeTopic}` : "");
		document.title = q ? `${q} · Unsplash Wallpapers` : "Unsplash Wallpapers";
	}, [queryRef, activeTopic]);

	return (
		<div className="bg-background min-h-screen">
			<header className="top-0 z-40 sticky bg-background/80 backdrop-blur-xl border-border/60 border-b">
				<div className="flex items-center gap-4 mx-auto px-4 py-3 max-w-screen-2xl">
					<div className="flex items-center gap-2 shrink-0">
						<div className="flex justify-center items-center bg-linear-to-br from-purple-500 to-pink-500 rounded-lg size-8">
							<Image className="size-4 text-white" weight="fill" />
						</div>
						<span className="hidden sm:block font-bold text-lg">Unsplash</span>
					</div>

					<SearchBar onSearch={handleSearch} loading={loading} />

					<div className="flex items-center gap-2 ml-auto">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleOpenFavorites}
							className="relative">
							<Heart className="size-4" weight="light" />
							{favorites.length > 0 && (
								<span className="-top-0.5 -right-0.5 absolute flex justify-center items-center bg-red-500 rounded-full size-4 font-bold text-[10px] text-white">
									{favorites.length}
								</span>
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							className="size-9">
							<Sun className="hidden dark:block size-4" weight="light" />
							<Moon className="dark:hidden block size-4" weight="light" />
						</Button>
						<SettingsPanel />
					</div>
				</div>
			</header>

			<main className="mx-auto px-4 py-6 max-w-screen-2xl">
				<TopicBar
					activeTopic={activeTopic}
					onSelectTopic={handleSelectTopic}
					onClear={handleClearTopic}
				/>

				{photos.length === 0 && !loading && (
					<div className="flex flex-col justify-center items-center py-32 text-center">
						<div className="flex justify-center items-center bg-muted/50 mb-4 rounded-2xl size-20">
							<Image
								className="size-10 text-muted-foreground/60"
								weight="light"
							/>
						</div>
						<h2 className="mb-2 font-semibold text-xl">Explore Wallpapers</h2>
						<p className="mb-6 max-w-md text-muted-foreground">
							Search for your favorite wallpapers or tap a topic below to get
							started.
						</p>
						<p className="text-muted-foreground/60 text-xs">
							Topics: Nature · Technology · Architecture · Travel · Minimal ·
							Animals
						</p>
					</div>
				)}

				<MasonryGrid
					photos={photos}
					isFavorite={isFavorite}
					onToggleFavorite={handleToggleFavorite}
					onOpenLightbox={handleOpenLightbox}
					loading={loading}
					hasMore={hasMore}
					onLoadMore={handleLoadMore}
					paginationMode={paginationMode}
				/>
			</main>

			<Lightbox
				photo={lightboxPhoto}
				isFavorite={lightboxPhoto ? isFavorite(lightboxPhoto.id) : false}
				onClose={handleCloseLightbox}
				onToggleFavorite={handleToggleFavorite}
				onOpenInBrowser={handleOpenInBrowser}
				onSave={handleSave}
				onPrev={lightboxIndex > 0 ? handleLightboxPrev : undefined}
				onNext={
					lightboxIndex < photos.length - 1 ? handleLightboxNext : undefined
				}
			/>

			<FavoritesPanel
				open={favoritesOpen}
				onOpenChange={setFavoritesOpen}
				photos={favoritePhotos}
				loading={favLoading}
				onOpenLightbox={handleOpenLightbox}
				onRemove={handleRemoveFavorite}
			/>

			<Toaster />
		</div>
	);
}

export default App;
