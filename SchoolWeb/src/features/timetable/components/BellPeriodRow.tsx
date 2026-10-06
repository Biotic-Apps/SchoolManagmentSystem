"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { Button } from "@/components/ui/Button";

interface BellPeriodRowProps {
  index: number;
  count: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function BellPeriodRow({ index, count, onRemove, onMoveUp, onMoveDown }: BellPeriodRowProps) {
  const prefix = `periods.${index}`;
  const number = index + 1;
  return (
    <div className="grid gap-3 p-4 md:grid-cols-[3rem_1fr_1fr_1fr_auto] md:items-start">
      <span className="text-card-title font-semibold text-fg md:pt-7" aria-label={`Period ${number}`}>
        P{number}
      </span>
      <TimeField name={`${prefix}.startTime`} label="Starts" required />
      <TimeField name={`${prefix}.endTime`} label="Ends" required />
      <div className="flex flex-col gap-3">
        <TextField name={`${prefix}.label`} label="Label" placeholder="e.g. Lunch" />
        <CheckboxField name={`${prefix}.isBreak`} label="Break (no lessons)" />
      </div>
      <div className="flex gap-1 md:pt-6">
        <Button variant="ghost" size="sm" onClick={onMoveUp} disabled={index === 0} aria-label={`Move period ${number} up`}>
          <ArrowUp />
        </Button>
        <Button variant="ghost" size="sm" onClick={onMoveDown} disabled={index === count - 1} aria-label={`Move period ${number} down`}>
          <ArrowDown />
        </Button>
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove period ${number}`}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
