import { useEffect, useState } from "react";

/** Seconds left before another code may be requested (server cooldown, 60 s). */
export function useResendCountdown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until <= now) return;
    const timer = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(timer);
  }, [until, now]);

  const start = (seconds: number) => {
    const at = Date.now();
    setNow(at);
    setUntil(at + seconds * 1000);
  };

  return { secondsLeft: Math.max(0, Math.ceil((until - now) / 1000)), start };
}
