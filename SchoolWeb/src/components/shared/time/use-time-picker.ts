import { useState, type KeyboardEvent } from "react";
import { formatTime, parseTimeText, shiftTime, toTimeParts, type TimeParts } from "@/lib/time";
import type { ClockMode } from "./ClockFace";

const DEFAULT_PARTS: TimeParts = { hour: 8, minute: 0, meridiem: "AM" };

interface Options {
  value: string | null;
  onChange: (value: string | null) => void;
  clearable?: boolean;
}

/** Text + clock state for TimePicker: typed text parses live, arrows step 5 min (Shift: 1 h). */
export function useTimePicker({ value, onChange, clearable }: Options) {
  const [open, setOpenState] = useState(false);
  const [mode, setMode] = useState<ClockMode>("hour");
  const [draft, setDraft] = useState<string | null>(null);

  const display = value ? formatTime(value) : "";
  const setOpen = (next: boolean) => {
    if (next) setMode("hour");
    setOpenState(next);
  };

  const type = (text: string) => {
    setDraft(text);
    if (!text.trim() && clearable) return onChange(null);
    const parsed = parseTimeText(text);
    if (parsed) onChange(parsed);
  };

  /** Drops the typed text; the field shows the (last valid) value again. */
  const commit = () => setDraft(null);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const minutes = (event.shiftKey ? 60 : 5) * (event.key === "ArrowUp" ? 1 : -1);
      setDraft(null);
      onChange(shiftTime(value, minutes));
      return;
    }
    if (event.key === "Enter") {
      commit();
      // Enter confirms an open clock; with it closed, Enter submits the form as usual.
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
    }
  };

  return {
    open,
    setOpen,
    mode,
    setMode,
    text: draft ?? display,
    parts: toTimeParts(value) ?? DEFAULT_PARTS,
    type,
    commit,
    onKeyDown,
  };
}
