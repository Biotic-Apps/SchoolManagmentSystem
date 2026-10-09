"use client";

import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { Button } from "@/components/ui/Button";
import { todayIso } from "@/lib/dates";
import { MODE_OPTIONS } from "../options";
import type { ParentBooking } from "../use-parent-booking";

/** Parent suggests a time; the teacher confirms it or offers another. */
export function RequestTimeFields({ booking }: { booking: ParentBooking }) {
  const name = booking.teacher?.name ?? "The teacher";

  return (
    <div className="flex flex-col gap-4">
      <InlineNotice>
        {booking.hasOpenTimes
          ? `Suggest a time that suits you. ${name} will confirm it or offer another.`
          : `${name} hasn't shared open times yet (teachers add them under Meetings → My slots). Suggest a time and they'll confirm it or offer another.`}
      </InlineNotice>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField name="date" label="Preferred date" type="date" min={todayIso()} required />
        <TimeField name="startTime" label="Preferred time" required />
        <SelectField name="mode" label="Mode" options={MODE_OPTIONS} required />
      </div>
      {booking.hasOpenTimes && (
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={booking.pickOpenTime}>
            Pick one of {name}&apos;s open times instead
          </Button>
        </div>
      )}
    </div>
  );
}
