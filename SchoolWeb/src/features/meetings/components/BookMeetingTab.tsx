"use client";

import { FormProvider } from "react-hook-form";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import type { ChildSummary } from "@/features/auth/types";
import { BOOKING_DAYS } from "../options";
import { useParentBooking } from "../use-parent-booking";
import { RequestTimeFields } from "./RequestTimeFields";
import { SlotPicker } from "./SlotPicker";

interface BookMeetingTabProps {
  child: ChildSummary;
  onBooked: () => void;
}

export function BookMeetingTab({ child, onBooked }: BookMeetingTabProps) {
  const booking = useParentBooking(child, onBooked);
  const { teachers } = booking;
  const noTeachers = !teachers.isLoading && !teachers.error && booking.teacherOptions.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a meeting</CardTitle>
        <CardDescription>
          Pick one of {child.name}&apos;s teachers, then one of their open times in the next {BOOKING_DAYS} days — or
          suggest a time if none suits you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {teachers.error ? (
          <ErrorState error={teachers.error} onRetry={() => teachers.refetch()} className="py-6" />
        ) : noTeachers ? (
          <InlineNotice>
            No teachers are linked to {child.name}&apos;s class yet. Please contact the school office.
          </InlineNotice>
        ) : (
          <FormProvider {...booking.form}>
            <form onSubmit={booking.submit} noValidate className="flex flex-col gap-5">
              <FormAlert message={booking.formError} />
              <div className="flex flex-col gap-1.5 md:max-w-xl">
                <Label>Teacher</Label>
                <OptionSelect
                  label={teachers.isLoading ? "Loading teachers…" : "Choose a teacher"}
                  options={booking.teacherOptions}
                  value={booking.teacherId}
                  onChange={booking.setTeacherId}
                />
              </div>
              {booking.requesting ? <RequestTimeFields booking={booking} /> : <SlotPicker booking={booking} />}
              <TextareaField
                name="agenda"
                label="What would you like to discuss?"
                required
                rows={3}
                placeholder={`e.g. ${child.name}'s progress in Maths`}
              />
              <div>
                <Button type="submit" loading={booking.submitting} disabled={booking.needsTeacher}>
                  {booking.requesting ? "Send request" : "Book meeting"}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
}
