"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { WeekNavState } from "../use-week";

export function WeekNav({ week }: { week: WeekNavState }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Week">
      <Button variant="secondary" size="sm" onClick={week.prev} aria-label="Previous week">
        <ChevronLeft />
      </Button>
      <Button variant="secondary" size="sm" onClick={week.thisWeek} disabled={week.isThisWeek}>
        This week
      </Button>
      <Button variant="secondary" size="sm" onClick={week.next} aria-label="Next week">
        <ChevronRight />
      </Button>
      <span className="text-label font-medium text-fg" aria-live="polite">
        {week.label}
      </span>
    </div>
  );
}
