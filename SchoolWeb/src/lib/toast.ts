export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
  /** Set while the exit fade runs; the item is removed right after. */
  leaving?: boolean;
}

const DURATION_MS = 4500;
/** Matches --animate-fade-out (120ms) with a little slack. */
const EXIT_MS = 140;
const MAX_VISIBLE = 4;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

function schedule(id: number) {
  clearTimeout(timers.get(id));
  timers.set(id, setTimeout(() => dismissToast(id), DURATION_MS));
}

function remove(id: number) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  items = items.filter((item) => item.id !== id);
  emit();
}

/** Fades the toast out, then removes it. */
export function dismissToast(id: number) {
  const item = items.find((entry) => entry.id === id);
  if (!item || item.leaving) return;
  clearTimeout(timers.get(id));
  items = items.map((entry) => (entry.id === id ? { ...entry, leaving: true } : entry));
  emit();
  timers.set(id, setTimeout(() => remove(id), EXIT_MS));
}

function push(tone: ToastTone, message: string) {
  // The same message is already showing: keep that one and restart its timer instead of stacking a copy.
  const same = items.find((item) => !item.leaving && item.tone === tone && item.message === message);
  if (same) {
    schedule(same.id);
    return;
  }
  const id = nextId++;
  const overflow = items.filter((item) => !item.leaving).slice(0, -(MAX_VISIBLE - 1) || undefined);
  for (const old of overflow) remove(old.id);
  items = [...items, { id, tone, message }];
  emit();
  schedule(id);
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
};

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const EMPTY: ToastItem[] = [];

export function getToasts(): ToastItem[] {
  return items;
}

export function getServerToasts(): ToastItem[] {
  return EMPTY;
}
