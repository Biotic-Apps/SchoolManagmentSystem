export interface RetainedBackup {
  id: string;
  startedAt: Date;
}

export interface RetentionRules {
  /** Newest backup of each of the N most recent days that have one. */
  daily: number;
  /** Newest backup of each of the last M calendar months (incl. this one). */
  monthly: number;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const monthKey = (d: Date) => d.toISOString().slice(0, 7);

function monthsBack(now: Date, count: number): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < count; i++) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    keys.add(monthKey(d));
  }
  return keys;
}

/** Newest backup per key, keys in order of first appearance (newest first). */
function newestPer(
  sorted: RetainedBackup[],
  key: (d: Date) => string,
): Map<string, string> {
  const newest = new Map<string, string>();
  for (const b of sorted) {
    const k = key(b.startedAt);
    if (!newest.has(k)) newest.set(k, b.id);
  }
  return newest;
}

/**
 * Ids of completed, unpruned backups that retention removes (UTC days and
 * months). The newest backup overall is always kept.
 */
export function selectPrunable(
  backups: RetainedBackup[],
  rules: RetentionRules,
  now: Date,
): string[] {
  const sorted = [...backups].sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
  );
  const keep = new Set<string>();
  if (sorted[0]) keep.add(sorted[0].id);
  [...newestPer(sorted, dayKey).values()]
    .slice(0, rules.daily)
    .forEach((id) => keep.add(id));
  const months = monthsBack(now, rules.monthly);
  for (const [month, id] of newestPer(sorted, monthKey)) {
    if (months.has(month)) keep.add(id);
  }
  return sorted.filter((b) => !keep.has(b.id)).map((b) => b.id);
}
