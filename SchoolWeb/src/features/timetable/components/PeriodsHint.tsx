"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";

const KEY = "eschool.timetable.periodsHint.dismissed";

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** One-time hint after periods stopped being named after subjects. */
export function PeriodsHint() {
  const [hidden, setHidden] = useState(readDismissed);
  if (hidden) return null;
  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // hidden for this visit only
    }
  };
  return (
    <InlineNotice>
      <div className="flex items-start justify-between gap-2">
        <span>Periods are time slots (Period 1, Period 2 …). Choose the subject for each lesson in the grid.</span>
        <Button variant="ghost" size="sm" className="-my-1 h-7 px-1.5" onClick={dismiss} aria-label="Hide this hint">
          <X />
        </Button>
      </div>
    </InlineNotice>
  );
}
