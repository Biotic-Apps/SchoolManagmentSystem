import { useMemo, useState } from "react";
import { useNotificationPreferences, useSaveNotificationPreferences } from "./api";
import { LOCKED_CATEGORIES, NOTIFICATION_CATEGORIES } from "./notification-categories";
import type { NotificationCategory, NotificationPreference } from "./types";

/** Push on/off per category; unsaved toggles are kept as a draft over the server values. */
export function useNotificationPreferencesCard() {
  const query = useNotificationPreferences();
  const save = useSaveNotificationPreferences();
  const [draft, setDraft] = useState<Partial<Record<NotificationCategory, boolean>>>({});

  const saved = useMemo(() => {
    const map = new Map<NotificationCategory, boolean>();
    for (const item of query.data ?? []) map.set(item.category, item.push);
    return map;
  }, [query.data]);

  const pushOf = (category: NotificationCategory): boolean =>
    LOCKED_CATEGORIES.has(category) || (draft[category] ?? saved.get(category) ?? true);

  const rows = NOTIFICATION_CATEGORIES.map((category) => ({
    ...category,
    push: pushOf(category.id),
    locked: LOCKED_CATEGORIES.has(category.id),
  }));
  const dirty = rows.some((row) => !row.locked && row.push !== (saved.get(row.id) ?? true));

  return {
    query,
    rows,
    dirty,
    saving: save.isPending,
    toggle: (category: NotificationCategory, push: boolean) => setDraft((current) => ({ ...current, [category]: push })),
    reset: () => setDraft({}),
    save: () => {
      const preferences: NotificationPreference[] = rows.map((row) => ({ category: row.id, inApp: true, push: row.push }));
      save.mutate(preferences, { onSuccess: () => setDraft({}) });
    },
  };
}
