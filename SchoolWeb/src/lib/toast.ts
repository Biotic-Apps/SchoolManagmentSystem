export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

const DURATION_MS = 4500;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function dismissToast(id: number) {
  items = items.filter((item) => item.id !== id);
  emit();
}

function push(tone: ToastTone, message: string) {
  const id = nextId++;
  items = [...items.slice(-3), { id, tone, message }];
  emit();
  setTimeout(() => dismissToast(id), DURATION_MS);
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
