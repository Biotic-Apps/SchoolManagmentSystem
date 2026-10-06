import { NOTIFICATION_CATEGORIES } from "@/features/profile/notification-categories";
import { humanize } from "@/lib/format";

const KNOWN = new Map<string, { label: string; hint: string }>(
  NOTIFICATION_CATEGORIES.map((item) => [item.id, { label: item.label, hint: item.hint }]),
);

export function categoryLabel(category: string): { label: string; hint: string | null } {
  const known = KNOWN.get(category);
  return known ?? { label: humanize(category), hint: null };
}
