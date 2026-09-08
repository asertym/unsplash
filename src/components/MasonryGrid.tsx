import { useCallback, useEffect, useState } from "react";
import { PhotoCard } from "./PhotoCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { UnsplashPhoto } from "@/api/unsplashClient";
import { type PaginationMode } from "@/store/settings";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface MasonryGridProps {
  photos: UnsplashPhoto[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onOpenLightbox: (photo: UnsplashPhoto) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  paginationMode: PaginationMode;
}

export function MasonryGrid({
  photos,
  isFavorite,
  onToggleFavorite,
  onOpenLightbox,
  loading,
  hasMore,
  onLoadMore,
  paginationMode,
}: MasonryGridProps) {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w < 640) setColumns(1);
      else if (w < 1024) setColumns(2);
      else if (w < 1280) setColumns(3);
      else setColumns(4);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);
  void columns; // column count drives responsive CSS classes

  // Auto-load more in infinite mode via IntersectionObserver
  const sentinelRef = useInfiniteScroll(
    useCallback(() => {
      if (paginationMode === "infinite" && hasMore && !loading) {
        onLoadMore();
      }
    }, [paginationMode, hasMore, loading, onLoadMore]),
    paginationMode === "infinite"
  );

  if (photos.length === 0 && loading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="break-inside-avoid mb-4">
            <Skeleton className="w-full rounded-xl" style={{ height: `${200 + Math.random() * 150}px` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isFavorite={isFavorite(photo.id)}
          onToggleFavorite={onToggleFavorite}
          onOpenLightbox={onOpenLightbox}
        />
      ))}
      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div key={`load-${i}`} className="break-inside-avoid mb-4">
            <Skeleton className="w-full rounded-xl" style={{ height: `${200 + Math.random() * 150}px` }} />
          </div>
        ))}
      <div ref={sentinelRef} className="h-px" />
    </div>
  );
}
