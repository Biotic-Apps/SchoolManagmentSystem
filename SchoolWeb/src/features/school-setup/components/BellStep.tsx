"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormPanel } from "@/components/shared/FormPanel";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { NumberField } from "@/components/shared/form/NumberField";
import { TimeField } from "@/components/shared/form/TimeField";
import { generateBell } from "@/features/timetable/bell-generator";
import type { SetupFormValues } from "../schemas";
import { BellPreview } from "./BellPreview";

/** Period times for every day, with an optional shorter Friday; previewed live. */
export function BellStep() {
  const { control } = useFormContext<SetupFormValues>();
  const bell = useWatch({ control, name: "bell" });
  const workingDays = useWatch({ control, name: "branch.workingDays" });
  const fridayWorks = workingDays.includes(5);

  return (
    <div className="flex flex-col gap-6">
      <FormPanel title="Every working day">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <TimeField name="bell.startTime" label="First period starts" required className="col-span-2 sm:col-span-1" />
          <NumberField name="bell.periodMinutes" label="Period length (min)" min={10} max={120} />
          <NumberField name="bell.periodsPerDay" label="Periods per day" min={1} max={12} />
          <NumberField name="bell.breakAfter" label="Break after period" min={0} max={11} hint="0 = no break" />
          <NumberField name="bell.breakMinutes" label="Break length (min)" min={0} max={90} />
        </div>
        <BellPreview title="Preview" rows={generateBell(bell)} />
      </FormPanel>
      {fridayWorks && (
        <FormPanel title="Friday">
          <CheckboxField name="bell.shortFriday" label="Friday is shorter" hint="Same start time and break position, fewer or shorter periods." />
          {bell.shortFriday && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <NumberField name="bell.friday.periodMinutes" label="Period length (min)" min={10} max={120} />
                <NumberField name="bell.friday.periodsPerDay" label="Periods" min={1} max={12} />
                <NumberField name="bell.friday.breakMinutes" label="Break length (min)" min={0} max={90} />
              </div>
              <BellPreview title="Friday preview" rows={generateBell({ ...bell, ...bell.friday })} />
            </>
          )}
        </FormPanel>
      )}
    </div>
  );
}
