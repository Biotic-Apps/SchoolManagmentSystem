"use client";

import { FormPanel } from "@/components/shared/FormPanel";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TimeField } from "@/components/shared/form/TimeField";
import { WeekdaysField } from "@/components/shared/form/WeekdaysField";

export function BranchStep() {
  return (
    <div className="flex flex-col gap-6">
      <FormPanel title="Branch" description="Most schools start with one branch. You can add more later.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="branch.name" label="Branch name" required autoComplete="off" />
          <TextField
            name="branch.code"
            label="Branch code"
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={12}
            inputClassName="uppercase"
          />
          <TextField name="branch.phone" label="Phone" type="tel" autoComplete="off" hint="Optional" />
          <TextField name="branch.email" label="Email" type="email" autoComplete="off" hint="Optional" />
          <TextareaField name="branch.address" label="Address" rows={2} className="sm:col-span-2" />
        </div>
      </FormPanel>
      <FormPanel title="Timings & working days" description="Used for attendance, the timetable and the diary.">
        <div className="grid gap-4 sm:grid-cols-3">
          <TimeField name="branch.opensAt" label="School opens" required hint="Students arrive" />
          <TimeField name="branch.closesAt" label="School closes" required hint="Students leave" />
          <TimeField name="branch.attendanceLockAt" label="Attendance locks at" required hint="Teachers mark attendance before this" />
          <TimeField name="branch.staffArrivesAt" label="Teachers arrive" required hint="At or before school opens" />
          <TimeField name="branch.staffLeavesAt" label="Teachers leave" required hint="At or after school closes" />
        </div>
        <WeekdaysField name="branch.workingDays" label="Working days" required />
      </FormPanel>
    </div>
  );
}
