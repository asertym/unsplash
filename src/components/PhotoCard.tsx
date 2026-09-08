import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Link } from "@phosphor-icons/react";
import { decode } from "blurhash";
import type { UnsplashPhoto } from "@/api/unsplashClient";

interface PhotoCardProps {
  photo: UnsplashPhoto;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenLightbox: (photo: UnsplashPhoto) => void;
}

function getBlurHashDataUrl(hash: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 20;
  canvas.height = 20;
  const ctx = canvas.getContext("2d")!;
  const pixels = decode(hash, 4, 3);
  const imageData = ctx.createImageData(20, 20);
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const srcIdx = Math.floor((y / 20) * 3) * 4 + Math.floor((x / 20) * 4);
      const dstIdx = y * 20 * 4 + x * 4;
      imageData.data[dstIdx] = pixels[srcIdx];
      imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
      imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
      imageData.data[dstIdx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

export function PhotoCard({ photo, isFavorite, onToggleFavorite, onOpenLightbox }: PhotoCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (photo.blur_hash) {
      try {
        const url = getBlurHashDataUrl(photo.blur_hash);
        setBlurDataUrl(url);
      } catch {
        // ignore decode errors
      }
    }
  }, [photo.blur_hash]);

  return (
    <div className="break-inside-avoid mb-4">
      <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-card">
        <div className="relative overflow-hidden rounded-xl cursor-pointer" onClick={() => onOpenLightbox(photo)}>
          {!loaded && !errored && (
            blurDataUrl ? (
              <img
                src={blurDataUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40 blur-sm transition-opacity duration-300"
              />
            ) : (
              <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />
            )
          )}
          <img
            src={photo.urls.regular}
            alt={photo.alt_description || photo.slug}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`w-full object-cover rounded-xl transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ aspectRatio: `${photo.width}/${photo.height}`, objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2">
              <img
                src={`https://randomuser.me/api/portraits/thumb/manny.jpg`}
                alt={photo.user.name}
                className="size-6 rounded-full border border-white/30"
              />
              <span className="text-white text-xs font-medium truncate max-w-[120px]">
                {photo.user.name}
              </span>
            </div>
            <a
              href={photo.user.links.html}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Link className="size-4" weight="light" />
            </a>
          </div>
        </div>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate" title={photo.description || ""}>
              {photo.description || photo.alt_description || "Wallpaper"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              {photo.width} × {photo.height}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(photo.id);
            }}
            className={`shrink-0 ${isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Heart className="size-4" weight={isFavorite ? "fill" : "light"} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
