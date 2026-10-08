"use client";

import { CalendarPlus } from "lucide-react";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { dayName } from "../options";
import type { BellEditorState } from "../use-bell-editor";

export const scheduleName = (day: number) => (day === 0 ? "All working days" : `${dayName(day)} (own times)`);

/** "All working days" / "Friday (own times)" chips, plus "Own times for a day". */
export function BellDayTabs({ editor }: { editor: BellEditorState }) {
  const options = editor.schedules.map((schedule, index) => ({ id: String(index), name: scheduleName(schedule.day) }));
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.length > 1 && (
        <SegmentedControl
          label="Which days"
          options={options}
          value={String(editor.active)}
          onChange={(value) => editor.setActive(Number(value))}
          className="max-w-full overflow-x-auto"
        />
      )}
      {editor.freeDays.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <CalendarPlus />
              Different times for a day
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>e.g. a shorter Friday</DropdownMenuLabel>
            {editor.freeDays.map((day) => (
              <DropdownMenuItem key={day} onSelect={() => editor.addVariant(day)}>
                {dayName(day)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
