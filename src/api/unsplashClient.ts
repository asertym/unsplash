import { createApi } from "unsplash-js";

export const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
});

export interface UnsplashPhoto {
  id: string;
  slug: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    regular: string;
    raw: string;
    small: string;
    full: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  blur_hash: string | null;
  width: number;
  height: number;
  likes: number;
}

export interface UnsplashSearchResult {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

export async function searchPhotos(
  query: string,
  page: number,
  perPage: number
): Promise<{ data: UnsplashSearchResult | null; error: unknown }> {
  const result = await unsplash.GET("/search/photos", {
    params: {
      query: { query, page, per_page: perPage },
    },
  });
  if (result.error) return { data: null, error: result.error };
  return { data: result.data as unknown as UnsplashSearchResult, error: null };
}

export async function getTopicPhotos(
  topicSlug: string,
  page: number,
  perPage: number
): Promise<{ data: UnsplashSearchResult | null; error: unknown }> {
  const result = await unsplash.GET("/topics/{topicSlug}/photos", {
    params: {
      path: { topicSlug },
      query: { page, per_page: perPage },
    },
  });
  if (result.error) return { data: null, error: result.error };
  return { data: result.data as unknown as UnsplashSearchResult, error: null };
}

export async function getPhotoDetail(
  photoId: string
): Promise<{ data: UnsplashPhoto | null; error: unknown }> {
  const result = await unsplash.GET("/photos/{assetSlug}", {
    params: { path: { assetSlug: photoId } },
  });
  if (result.error) return { data: null, error: result.error };
  return { data: result.data as unknown as UnsplashPhoto, error: null };
}

export async function getDownloadUrl(
  photoId: string
): Promise<{ data: { url: string } | null; error: unknown }> {
  const result = await unsplash.GET("/photos/{id}/download", {
    params: { path: { id: photoId } },
  });
  if (result.error) return { data: null, error: result.error };
  return { data: result.data as unknown as { url: string }, error: null };
}
