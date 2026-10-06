import { useEffect, useRef } from "react";

/** Keeps a scroll container pinned to the newest item when one arrives. */
export function useScrollToLatest(latestKey: string | undefined) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (element && latestKey) element.scrollTop = element.scrollHeight;
  }, [latestKey]);
  return ref;
}
