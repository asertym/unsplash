import { useState, useCallback, useRef } from "react";
import { searchPhotos, type UnsplashPhoto } from "@/api/unsplashClient";

const PER_PAGE = 20;

export function useUnsplash() {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const queryRef = useRef("");
  const loadedPagesRef = useRef(new Set<number>());
  const searchRef = useRef<((query: string, reset?: boolean, pageOverride?: number) => Promise<void>) | null>(null);

  const search = useCallback(async (query: string, reset = false, pageOverride?: number) => {
    if (reset) {
      setPhotos([]);
      setPage(1);
      setHasMore(true);
      setTotal(0);
      loadedPagesRef.current.clear();
    }
    queryRef.current = query;

    setLoading(true);
    setError(null);

    try {
      const currentPage = pageOverride ?? (reset ? 1 : page);
      const result = await searchPhotos(query, currentPage, PER_PAGE);

      if (result.error) {
        const msg = typeof result.error === "string" ? result.error : JSON.stringify(result.error);
        throw new Error(msg);
      }

      const data = result.data!;

      if (reset) {
        setPhotos(data.results);
      } else {
        setPhotos((prev) => [...prev, ...data.results]);
      }
      setTotal(data.total);
      setHasMore(currentPage < data.total_pages);
      loadedPagesRef.current.add(currentPage);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[useUnsplash] search error:", msg);
      setError(msg || "Failed to search photos");
    } finally {
      setLoading(false);
    }
  }, []);

  searchRef.current = search;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !searchRef.current) return;
    setPage((p) => p + 1);
    await searchRef.current(queryRef.current, false, page + 1);
  }, [loading, hasMore, page]);

  const resetSearch = useCallback(() => {
    if (!searchRef.current) return;
    setPage(1);
    loadedPagesRef.current.clear();
    searchRef.current("", true);
  }, []);

  return { photos, loading, error, total, hasMore, search, loadMore, resetSearch };
}

export function useTopicPhotos(topicSlug: string) {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    setPage((p) => p + 1);

    try {
      const result = await searchPhotos(topicSlug, page + 1, PER_PAGE);

      if (result.error) {
        const msg = typeof result.error === "string" ? result.error : JSON.stringify(result.error);
        throw new Error(msg);
      }

      const data = result.data!;
      setPhotos((prev) => [...prev, ...data.results]);
      setHasMore(data.results.length === PER_PAGE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load topic photos");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, topicSlug]);

  return { photos, loading, error, hasMore, loadMore };
}
