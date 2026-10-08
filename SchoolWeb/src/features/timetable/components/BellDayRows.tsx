"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { nextRow, type BellFormValues } from "../bell-schemas";
import { BellPeriodRow } from "./BellPeriodRow";

/** Rows of one schedule (default or a weekday); teaching rows are numbered Period 1, 2 … automatically. */
export function BellDayRows({ index }: { index: number }) {
  const { control, getValues, formState } = useFormContext<BellFormValues>();
  const rows = useFieldArray({ control, name: `schedules.${index}.rows` });
  const values = useWatch({ control, name: `schedules.${index}.rows` }) ?? [];
  const listError = formState.errors.schedules?.[index]?.rows?.message ?? formState.errors.schedules?.[index]?.rows?.root?.message;

  let teaching = 0;
  const numbers = values.map((row) => (row?.isBreak ? null : ++teaching));

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-col divide-y divide-border overflow-hidden">
        {rows.fields.map((field, row) => (
          <BellPeriodRow
            key={field.id}
            prefix={`schedules.${index}.rows.${row}`}
            number={numbers[row] ?? null}
            index={row}
            count={rows.fields.length}
            onMove={(from, to) => to >= 0 && to < rows.fields.length && rows.move(from, to)}
            onRemove={() => rows.remove(row)}
          />
        ))}
        {rows.fields.length === 0 && <p className="px-4 py-6 text-center text-label text-fg-muted">No periods yet. Add the first one.</p>}
      </Card>
      {listError && (
        <p role="alert" className="text-caption text-error">
          {listError}
        </p>
      )}
      <Button variant="secondary" className="self-start" onClick={() => rows.append(nextRow(getValues(`schedules.${index}.rows`).at(-1)))}>
        <Plus />
        Add period
      </Button>
    </div>
  );
}
