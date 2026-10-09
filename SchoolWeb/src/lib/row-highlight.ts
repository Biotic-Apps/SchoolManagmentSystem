import { useSyncExternalStore } from "react";

/*
 * Briefly highlights a table row after it was created or saved.
 * A mutation calls flashRow(id) once the server confirms; any DataTable showing a row whose
 * getRowId matches plays the `animate-row-flash` tint once, then clears it.
 * The id is held for a few seconds so a list that refetches (or is navigated back to) after the
 * save still catches it.
 * Mutations wrapped with withRowFlash flash only after their invalidations finish (the query
 * client's MutationCache calls commitRowFlash on settle), so the refetched row is on screen.
 */

const HOLD_MS = 4000;

let flashedId: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Highlight the row with this id in whichever DataTable renders it. */
export function flashRow(id: string | null | undefined): void {
  if (!id) return;
  flashedId = id;
  clearTimeout(timer);
  timer = setTimeout(() => clearFlashedRow(id), HOLD_MS);
  emit();
}

/** Drops the highlight (DataTable calls this when the flash animation ends). */
export function clearFlashedRow(id?: string): void {
  if (flashedId === null || (id && flashedId !== id)) return;
  flashedId = null;
  clearTimeout(timer);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The id of the row currently being highlighted, if any. */
export function useFlashedRow(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => flashedId,
    () => null,
  );
}

const pending = new WeakMap<object, string>();

/**
 * Wraps a mutationFn so the saved row flashes once the server confirms and the lists refetched.
 * `getId` picks the row id from the response and/or the variables.
 */
export function withRowFlash<TFn extends (vars: never) => Promise<unknown>>(
  mutationFn: TFn,
  getId: (data: Awaited<ReturnType<TFn>>, vars: Parameters<TFn>[0]) => string | null | undefined,
): TFn {
  const wrapped = async (vars: Parameters<TFn>[0]) => {
    const data = (await mutationFn(vars)) as Awaited<ReturnType<TFn>>;
    const id = getId(data, vars);
    if (id && typeof data === "object" && data !== null) pending.set(data, id);
    else flashRow(id);
    return data;
  };
  return wrapped as TFn;
}

/** Called by the MutationCache after a successful mutation settles (see query-client.ts). */
export function commitRowFlash(data: unknown): void {
  if (typeof data !== "object" || data === null) return;
  const id = pending.get(data);
  if (!id) return;
  pending.delete(data);
  flashRow(id);
}
