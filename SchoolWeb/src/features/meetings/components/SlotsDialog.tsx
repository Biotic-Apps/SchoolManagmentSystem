"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { Button } from "@/components/ui/Button";
import { todayIso } from "@/lib/dates";
import { MODE_OPTIONS } from "../options";
import { useSlotsForm } from "../use-slots-form";

export function SlotsDialog({ startDate, onClose }: { startDate: string; onClose: () => void }) {
  const today = todayIso();
  const slots = useSlotsForm(startDate < today ? today : startDate, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add meeting slots"
      description="Parents of your students can book these times. Add a row for each slot."
      submitLabel={slots.rows.length > 1 ? `Add ${slots.rows.length} slots` : "Add slot"}
      submitting={slots.submitting}
      onSubmit={slots.submit}
      form={slots.form}
      error={slots.formError}
      size="xl"
    >
      <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
        {slots.rows.map((row, index) => (
          <div key={row.id} className="grid gap-3 rounded-input border border-border p-3 md:grid-cols-2 xl:grid-cols-[10rem_1fr_1fr]">
            <TextField name={`slots.${index}.date`} label="Date" type="date" min={today} required />
            <TimeField name={`slots.${index}.startTime`} label="Start" required />
            <TimeField name={`slots.${index}.endTime`} label="End" required />
            <SelectField name={`slots.${index}.mode`} label="Mode" options={MODE_OPTIONS} required />
            <div className="flex items-end gap-2 xl:col-span-2">
              <TextField name={`slots.${index}.location`} label="Location" placeholder="e.g. Staff room" className="flex-1" />
              {slots.rows.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label="Remove row"
                  onClick={() => slots.removeRow(index)}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div>
        <Button variant="secondary" size="sm" onClick={slots.addRow}>
          <Plus />
          Add another slot
        </Button>
      </div>
    </FormDialog>
  );
}
