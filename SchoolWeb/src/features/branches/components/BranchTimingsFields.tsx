import { TimeField } from "@/components/shared/form/TimeField";
import { WeekdaysField } from "@/components/shared/form/WeekdaysField";

/** Student + teacher timings and working days; used inside a FormDialog's form. */
export function BranchTimingsFields() {
  return (
    <>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-label font-medium text-fg">Student timings</legend>
        <TimeField name="opensAt" label="School opens" required />
        <TimeField name="closesAt" label="School closes" required />
        <TimeField name="attendanceLockAt" label="Attendance locks at" required />
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-label font-medium text-fg">Teacher timings</legend>
        <TimeField name="staffArrivesAt" label="Teachers arrive" required hint="At or before school opens" />
        <TimeField name="staffLeavesAt" label="Teachers leave" required hint="At or after school closes" />
      </fieldset>
      <WeekdaysField name="workingDays" label="Working days" required />
    </>
  );
}
