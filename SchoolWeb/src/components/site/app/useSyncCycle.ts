"use client";

import { useEffect, useState } from "react";

export type SyncPhase = "offline" | "syncing" | "synced";

/** How many records the teacher marked while the phone had no signal. */
export const PENDING_TOTAL = 34;

const OFFLINE_MS = 3200;
const SYNCED_MS = 2800;
const TICK_MS = 45;

/**
 * Drives the little offline story on the phones: a while with no signal and
 * 34 records waiting, then back online with the count running down to 0, then
 * a "synced" moment, and round again. It only runs while `active` (in view,
 * motion allowed); otherwise it rests on the finished, synced state.
 */
export function useSyncCycle(active: boolean) {
  const [phase, setPhase] = useState<SyncPhase>("synced");
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;
    let count = PENDING_TOTAL;

    const goOffline = () => {
      setPhase("offline");
      count = PENDING_TOTAL;
      setPending(count);
      timer = setTimeout(sync, OFFLINE_MS);
    };
    const sync = () => {
      setPhase("syncing");
      const step = () => {
        count -= 1;
        setPending(count);
        if (count > 0) timer = setTimeout(step, TICK_MS);
        else {
          setPhase("synced");
          timer = setTimeout(goOffline, SYNCED_MS);
        }
      };
      timer = setTimeout(step, TICK_MS);
    };

    timer = setTimeout(goOffline, 900);
    return () => {
      clearTimeout(timer);
      setPhase("synced");
      setPending(0);
    };
  }, [active]);

  return { phase, pending };
}
