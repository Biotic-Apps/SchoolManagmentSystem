"use client";

import { Coffee } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { OrderButtons } from "@/components/shared/OrderButtons";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { BellFormValues } from "../bell-schemas";

interface BellPeriodRowProps {
  prefix: `schedules.${number}.rows.${number}`;
  /** "Period 3", or null for a break. */
  number: number | null;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}

/** "Period N" (numbered automatically) or a break with its own label, start and end times. */
export function BellPeriodRow({ prefix, number, index, count, onMove, onRemove }: BellPeriodRowProps) {
  const { control, setValue } = useFormContext<BellFormValues>();
  const isBreak = useWatch({ control, name: `${prefix}.isBreak` });
  const title = isBreak ? "Break" : `Period ${number}`;

  const toggleBreak = () => {
    setValue(`${prefix}.isBreak`, !isBreak, { shouldDirty: true });
    setValue(`${prefix}.label`, isBreak ? "" : "Break", { shouldDirty: true });
  };

  return (
    <div className={cn("grid grid-cols-2 gap-3 p-3 sm:p-4 md:grid-cols-[7rem_1fr_1fr_minmax(9rem,1fr)_auto] md:items-start", isBreak && "bg-background")}>
      <span className="col-span-2 text-label font-semibold text-fg md:col-span-1 md:pt-8">{title}</span>
      <TimeField name={`${prefix}.startTime`} label="Starts" required />
      <TimeField name={`${prefix}.endTime`} label="Ends" required />
      <div className="col-span-2 md:col-span-1">
        {isBreak ? (
          <TextField name={`${prefix}.label`} label="Break name" placeholder="Break, Assembly, Lunch" />
        ) : (
          <div className="flex h-full items-end md:pt-7">
            <Button variant="ghost" size="sm" onClick={toggleBreak}>
              <Coffee />
              Make it a break
            </Button>
          </div>
        )}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1 md:pt-7">
        {isBreak && (
          <Button variant="ghost" size="sm" onClick={toggleBreak}>
            Make it a period
          </Button>
        )}
        <OrderButtons label={title} index={index} count={count} onMove={onMove} onRemove={onRemove} />
      </div>
    </div>
  );
}
