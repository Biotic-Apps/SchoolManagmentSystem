"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import type { NotificationCategory } from "../types";

interface PreferenceRow {
  id: NotificationCategory;
  label: string;
  hint: string;
  push: boolean;
  locked: boolean;
}

interface NotificationPreferenceRowProps {
  row: PreferenceRow;
  onToggle: (category: NotificationCategory, push: boolean) => void;
}

export function NotificationPreferenceRow({ row, onToggle }: NotificationPreferenceRowProps) {
  const pushId = `push-${row.id}`;
  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 px-4 py-3">
      <label htmlFor={pushId} className="flex min-w-0 flex-col">
        <span className="text-label font-medium text-fg">{row.label}</span>
        <span className="truncate text-caption text-fg-muted">{row.locked ? "Always on — safety alerts" : row.hint}</span>
      </label>
      <span className="flex w-14 justify-center">
        <Checkbox checked disabled aria-label={`${row.label} in-app notifications (always on)`} />
      </span>
      <span className="flex w-14 justify-center">
        <Checkbox
          id={pushId}
          checked={row.push}
          disabled={row.locked}
          onCheckedChange={(checked) => onToggle(row.id, checked === true)}
          aria-label={`${row.label} push notifications`}
        />
      </span>
    </li>
  );
}
