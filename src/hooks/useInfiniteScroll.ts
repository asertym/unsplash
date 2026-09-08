import { useEffect, useRef } from "react";

export function useInfiniteScroll(
  callback: () => void,
  enabled = true
) {
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.current.observe(sentinel);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [callback, enabled]);

  return sentinelRef;
}
