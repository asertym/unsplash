import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "@phosphor-icons/react";
import type { UnsplashPhoto } from "@/api/unsplashClient";

interface FavoritesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: UnsplashPhoto[];
  loading: boolean;
  onOpenLightbox: (photo: UnsplashPhoto) => void;
  onRemove: (id: string) => void;
}

export function FavoritesPanel({
  open,
  onOpenChange,
  photos,
  loading,
  onOpenLightbox,
  onRemove,
}: FavoritesPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="size-4" />
            </Button>
            <SheetTitle className="flex items-center gap-2">
              <Heart className="size-4 text-red-500" weight="fill" />
              Favorites ({photos.length})
            </SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          {loading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 animate-pulse">
                  <div className="size-12 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="size-12 text-muted-foreground/40 mb-3" weight="light" />
              <p className="text-sm text-muted-foreground">No favorites yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Heart a photo to save it here</p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => onOpenLightbox(photo)}
                >
                  <img
                    src={photo.urls.small}
                    alt={photo.alt_description || photo.slug}
                    className="size-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{photo.description || photo.alt_description || "Wallpaper"}</p>
                    <p className="text-xs text-muted-foreground">{photo.user.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(photo.id);
                    }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                  >
                    <Heart className="size-3.5" weight="fill" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
