import { useState, type KeyboardEvent } from "react";
import { addDays, formatDayMonthYear, parseDateText, todayIso } from "@/lib/dates";

interface Options {
  value: string | null;
  onChange: (value: string | null) => void;
  clearable?: boolean;
}

/** Text + calendar state for DatePicker: typed dates parse live, the arrow keys move a day. */
export function useDatePicker({ value, onChange, clearable }: Options) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  const type = (text: string) => {
    setDraft(text);
    if (!text.trim() && clearable) return onChange(null);
    const parsed = parseDateText(text);
    if (parsed) onChange(parsed);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      setDraft(null);
      onChange(addDays(value ?? todayIso(), event.key === "ArrowUp" ? 1 : -1));
    } else if (event.key === "Enter") {
      setDraft(null);
      // Enter confirms an open calendar; with it closed, Enter submits the form as usual.
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
    }
  };

  return {
    open,
    setOpen,
    text: draft ?? formatDayMonthYear(value),
    type,
    commit: () => setDraft(null),
    onKeyDown,
  };
}
