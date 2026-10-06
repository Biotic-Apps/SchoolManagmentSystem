"use client";

import { focusRing } from "@/components/ui/styles";
import type { DiaryEntry } from "@/features/diary/types";
import { cn } from "@/lib/cn";

interface HomeworkEntryPickerProps {
  entries: DiaryEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** One card per subject with homework that day. */
export function HomeworkEntryPicker({ entries, selectedId, onSelect }: HomeworkEntryPickerProps) {
  return (
    <div role="radiogroup" aria-label="Homework" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => {
        const selected = entry.id === selectedId;
        return (
          <button
            key={entry.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(entry.id)}
            className={cn(
              "flex flex-col gap-1 rounded-card border p-4 text-left transition-colors",
              focusRing,
              selected ? "border-primary bg-selected" : "border-border bg-surface hover:bg-selected/60",
            )}
          >
            <span className={cn("text-label font-semibold", selected ? "text-primary" : "text-fg")}>
              {entry.subject.name}
            </span>
            <span className="whitespace-pre-wrap break-words text-caption text-fg-muted">{entry.homework}</span>
          </button>
        );
      })}
    </div>
  );
}
