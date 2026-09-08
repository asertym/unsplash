import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Heart, Download, Link } from "@phosphor-icons/react";
import type { UnsplashPhoto } from "@/api/unsplashClient";

interface LightboxProps {
  photo: UnsplashPhoto | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenInBrowser: (url: string) => void;
  onSave: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function Lightbox({ photo, isFavorite, onClose, onToggleFavorite, onOpenInBrowser, onSave, onPrev, onNext }: LightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && onPrev) onPrev();
      else if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  const downloadUrl = `https://unsplash.com/photos/${photo.slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col lg:flex-row max-w-6xl w-full mx-4 max-h-[90vh] bg-card rounded-2xl overflow-hidden shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 size-8 bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
        >
          <X className="size-4" />
        </Button>

        <div className="flex-1 min-w-0 flex items-center justify-center bg-black/90 p-4 relative">
          {onPrev && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-8 bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
            >
              <svg className="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </Button>
          )}
          <img
            src={photo.urls.raw}
            alt={photo.alt_description || photo.slug}
            className="max-w-full max-h-[60vh] lg:max-h-[90vh] object-contain rounded-lg"
          />
          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-8 bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
            >
              <svg className="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </Button>
          )}
        </div>

        <div className="w-full lg:w-80 flex flex-col border-l border-border">
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                {photo.user.name[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{photo.user.name}</p>
                <a
                  href={photo.user.links.html}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  @{photo.user.username}
                </a>
              </div>
            </div>

            {photo.description && (
              <p className="text-sm text-foreground mb-4">{photo.description}</p>
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Dimensions</span>
                <span className="text-foreground">{photo.width} × {photo.height}</span>
              </div>
              <div className="flex justify-between">
                <span>Likes</span>
                <span className="text-foreground">{photo.likes.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-border space-y-2">
            <Button
              className="w-full"
              onClick={() => onToggleFavorite(photo.id)}
              variant={isFavorite ? "secondary" : "outline"}
            >
              <Heart className="size-4 mr-2" weight={isFavorite ? "fill" : "light"} />
              {isFavorite ? "Favorited" : "Favorite"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenInBrowser(downloadUrl)}
              >
                <Link className="size-3.5 mr-1.5" weight="light" />
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
              >
                <Download className="size-3.5 mr-1.5" weight="light" />
                Save
              </Button>
            </div>
            <a
              href={`https://unsplash.com/${photo.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-muted-foreground hover:underline py-1"
            >
              View on Unsplash
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
