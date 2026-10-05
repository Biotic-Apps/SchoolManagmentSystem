export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const idleMinutes = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES ?? 30);

export const IDLE_TIMEOUT_MINUTES = Number.isFinite(idleMinutes) && idleMinutes > 0 ? idleMinutes : 30;
