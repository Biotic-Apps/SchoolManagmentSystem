import { useEffect } from "react";
import { IDLE_TIMEOUT_MINUTES } from "@/config/env";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "mousemove"] as const;
const CHECK_EVERY_MS = 15_000;
/** Shared across tabs so activity in any tab keeps every tab of the session alive. */
const ACTIVITY_KEY = "eschool.lastActivity";
const SHARE_EVERY_MS = 5_000;

/** School policy minutes from /me when valid, else NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES. */
export function idleTimeoutMinutes(policyMinutes?: number | null): number {
  return policyMinutes && Number.isFinite(policyMinutes) && policyMinutes > 0 ? policyMinutes : IDLE_TIMEOUT_MINUTES;
}

function readSharedActivity(): number {
  try {
    const value = Number(window.localStorage.getItem(ACTIVITY_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeSharedActivity(at: number) {
  try {
    window.localStorage.setItem(ACTIVITY_KEY, String(at));
  } catch {
    // Storage blocked (private mode): fall back to this tab's own activity.
  }
}

/** Signs out after the idle timeout without user activity in any tab (security.md §7). */
export function useIdleLogout(enabled: boolean, onIdle: () => void, policyMinutes?: number | null) {
  const minutes = idleTimeoutMinutes(policyMinutes);
  useEffect(() => {
    if (!enabled) return;
    const timeoutMs = minutes * 60_000;
    let lastActivity = Date.now();
    let lastShared = 0;
    const markActive = () => {
      lastActivity = Date.now();
      if (lastActivity - lastShared >= SHARE_EVERY_MS) {
        lastShared = lastActivity;
        writeSharedActivity(lastActivity);
      }
    };
    markActive();
    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, markActive, { passive: true });
    const timer = setInterval(() => {
      const latest = Math.max(lastActivity, readSharedActivity());
      if (Date.now() - latest >= timeoutMs) onIdle();
    }, CHECK_EVERY_MS);

    return () => {
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, markActive);
      clearInterval(timer);
    };
  }, [enabled, onIdle, minutes]);
}
