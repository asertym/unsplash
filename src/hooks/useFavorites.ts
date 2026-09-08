import { useState, useCallback, useEffect, useRef } from "react";
import { getPhotoDetail, type UnsplashPhoto } from "@/api/unsplashClient";
import { getFavorites, saveFavorites } from "@/api/client";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    getFavorites().then((data) => {
      try {
        setFavorites(JSON.parse(data) as string[]);
      } catch {
        setFavorites([]);
      }
    }).catch(() => setFavorites([]));
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    saveFavorites(favorites).catch(() => {});
  }, [favorites]);

  const isFavorite = useCallback(
    (photoId: string) => favorites.includes(photoId),
    [favorites]
  );

  const toggleFavorite = useCallback((photoId: string) => {
    setFavorites((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  }, []);

  const getFavoritePhotos = useCallback(async (): Promise<UnsplashPhoto[]> => {
    const results = await Promise.all(
      favorites.map((id) => getPhotoDetail(id))
    );
    return results
      .filter((r): r is { data: UnsplashPhoto; error: null } => r.data !== null && r.error === null)
      .map((r) => r.data);
  }, [favorites]);

  return { favorites, isFavorite, toggleFavorite, getFavoritePhotos };
}
