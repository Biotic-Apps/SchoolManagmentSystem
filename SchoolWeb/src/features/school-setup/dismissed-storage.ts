const PREFIX = "eschool.setupChecklist.dismissed.";

/** Branch keys whose checklist this user hid. Storage may be blocked, so every access is guarded. */
export function readDismissed(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(PREFIX + userId);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function writeDismissed(userId: string, keys: string[]): void {
  try {
    window.localStorage.setItem(PREFIX + userId, JSON.stringify(keys));
  } catch {
    // Not persisted; the card stays hidden for this visit only.
  }
}
