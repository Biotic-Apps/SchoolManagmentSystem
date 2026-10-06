import { useSyncExternalStore } from "react";
import type { RecentExport } from "./types";

const MAX = 20;
const EMPTY: RecentExport[] = [];

// In-memory only: kept while the tab is open, gone after a reload.
let exports: RecentExport[] = EMPTY;
const listeners = new Set<() => void>();

export function addRecentExport(item: RecentExport) {
  exports = [item, ...exports].slice(0, MAX);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRecentExports(): RecentExport[] {
  return useSyncExternalStore(
    subscribe,
    () => exports,
    () => EMPTY,
  );
}
