"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import type { ChildSummary } from "@/features/auth/types";
import { BOOKING_DAYS } from "../options";
import { useParentBooking } from "../use-parent-booking";
import { SlotPicker } from "./SlotPicker";

interface BookMeetingTabProps {
  child: ChildSummary;
  onBooked: () => void;
}

export function BookMeetingTab({ child, onBooked }: BookMeetingTabProps) {
  const booking = useParentBooking(child, onBooked);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a meeting</CardTitle>
        <CardDescription>
          Pick a teacher and one of their open times in the next {BOOKING_DAYS} days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...booking.form}>
          <form onSubmit={booking.submit} noValidate className="flex flex-col gap-5">
            <FormAlert message={booking.formError} />
            <div className="flex flex-col gap-1.5 md:max-w-sm">
              <Label>Teacher</Label>
              <OptionSelect
                label={booking.teachersLoading ? "Loading teachers…" : "Choose a teacher"}
                options={booking.teacherOptions}
                value={booking.teacherId}
                onChange={booking.setTeacherId}
              />
            </div>
            <SlotPicker booking={booking} />
            <TextareaField
              name="agenda"
              label="What would you like to discuss?"
              required
              rows={3}
              placeholder={`e.g. ${child.name}'s progress in Maths`}
            />
            <div>
              <Button type="submit" loading={booking.submitting}>
                Book meeting
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
