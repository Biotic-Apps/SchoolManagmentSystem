"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { TIMETABLE_STATE_COPY } from "@/features/classes/timetable-state";
import { cn } from "@/lib/cn";
import type { SectionChoice } from "../section-choices";

interface SectionPickerProps {
  choices: SectionChoice[];
  value: string | null;
  onChange: (sectionId: string) => void;
  className?: string;
}

/** Sections grouped by class ("Class 9 › A (Science)") with a dot for the timetable state. */
export function SectionPicker({ choices, value, onChange, className }: SectionPickerProps) {
  const selected = choices.find((choice) => choice.id === value);
  const classes = [...new Map(choices.map((choice) => [choice.classId, choice.className])).entries()];
  return (
    <Select value={value ?? ""} onValueChange={onChange} disabled={choices.length === 0}>
      <SelectTrigger aria-label="Section" className={cn("md:w-80", className)}>
        <SelectValue placeholder="Choose a section">{selected ? `${selected.className} › ${selected.label}` : undefined}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-96 overflow-y-auto">
        {classes.map(([classId, className]) => (
          <SelectGroup key={classId}>
            <SelectLabel>{className}</SelectLabel>
            {choices
              .filter((choice) => choice.classId === classId)
              .map((choice) => {
                const copy = choice.state ? TIMETABLE_STATE_COPY[choice.state] : null;
                return (
                  <SelectItem key={choice.id} value={choice.id} hint={copy?.label}>
                    <span className="inline-flex items-center gap-2">
                      {copy && <span aria-hidden className={cn("size-2 rounded-full", copy.dot)} />}
                      {choice.label}
                    </span>
                  </SelectItem>
                );
              })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
