import { useRef, useState } from "react";

/**
 * Shows the new value at once while it saves; falls back to the server value once the latest
 * save settles (by then the query has refetched) or fails. Quick repeated changes are merged:
 * only the last one is sent after `delayMs`.
 */
export function useOptimisticSave<T>(serverValue: T, save: (value: T) => Promise<unknown>, delayMs = 0) {
  const [pending, setPending] = useState<{ value: T } | null>(null);
  const latest = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = async (value: T, call: number) => {
    try {
      await save(value);
    } catch {
      // the mutation reports the error; the server value shows again
    } finally {
      if (latest.current === call) setPending(null);
    }
  };

  const set = (value: T) => {
    const call = ++latest.current;
    setPending({ value });
    if (timer.current) clearTimeout(timer.current);
    if (delayMs <= 0) return run(value, call);
    timer.current = setTimeout(() => void run(value, call), delayMs);
    return Promise.resolve();
  };

  return { value: pending ? pending.value : serverValue, set, saving: pending !== null };
}
