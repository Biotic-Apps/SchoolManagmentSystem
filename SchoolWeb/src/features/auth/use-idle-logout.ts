import { useEffect } from "react";
import { IDLE_TIMEOUT_MINUTES } from "@/config/env";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "mousemove"] as const;
const CHECK_EVERY_MS = 15_000;

/** Signs out after IDLE_TIMEOUT_MINUTES without user activity (security.md §7). */
export function useIdleLogout(enabled: boolean, onIdle: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const timeoutMs = IDLE_TIMEOUT_MINUTES * 60_000;
    let lastActivity = Date.now();
    const markActive = () => {
      lastActivity = Date.now();
    };
    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, markActive, { passive: true });
    const timer = setInterval(() => {
      if (Date.now() - lastActivity >= timeoutMs) onIdle();
    }, CHECK_EVERY_MS);

    return () => {
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, markActive);
      clearInterval(timer);
    };
  }, [enabled, onIdle]);
}
