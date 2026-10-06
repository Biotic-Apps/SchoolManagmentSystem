"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TimeField } from "@/components/shared/form/TimeField";
import { Skeleton } from "@/components/ui/Skeleton";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { useDepartureForm } from "../use-departure-form";
import { PickerChoiceField } from "./PickerChoiceField";
import { PickupBlockedAlert } from "./PickupBlockedAlert";

interface RecordDepartureDialogProps {
  branchId: string;
  date: string;
  onClose: () => void;
}

export function RecordDepartureDialog({ branchId, date, onClose }: RecordDepartureDialogProps) {
  const departure = useDepartureForm(branchId, date, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Record departure"
      description="Guardians are notified as soon as the departure is saved."
      submitLabel="Record departure"
      submitting={departure.submitting}
      onSubmit={departure.submit}
      form={departure.form}
      error={departure.formError}
      size="lg"
    >
      {departure.blocked && <PickupBlockedAlert />}
      <StudentSearchField name="studentId" required branchId={branchId} />
      {departure.studentId && departure.choicesLoading && <Skeleton className="h-32 w-full" />}
      {departure.studentId && !!departure.choicesError && <ErrorState error={departure.choicesError} />}
      {departure.studentId && !departure.choicesLoading && !departure.choicesError && (
        <>
          {departure.choices.length > 0 ? (
            <PickerChoiceField name="picker" choices={departure.choices} />
          ) : (
            <InlineNotice tone="warning">
              No guardian or authorized person is on record for this student. Do not release them; contact the office.
            </InlineNotice>
          )}
          {departure.earlyLeaveOptions.length > 0 && (
            <SelectField
              name="earlyLeaveId"
              label="Approved early leave"
              options={departure.earlyLeaveOptions}
              emptyLabel="Not an early leave"
              placeholder="Not an early leave"
            />
          )}
        </>
      )}
      <CheckboxField name="customTime" label="Record a different time" hint="Otherwise the current time is used." />
      {departure.customTime && <TimeField name="time" label="Departure time" required />}
    </FormDialog>
  );
}
