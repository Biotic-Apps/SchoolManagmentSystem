"use client";

import { useFormContext } from "react-hook-form";
import { ErrorState } from "@/components/shared/ErrorState";
import { fieldError } from "@/components/shared/form/field-error";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/time";
import { modeLabel, weekdayLabel } from "../options";
import type { ParentBooking } from "../use-parent-booking";

/** The teacher's open slots grouped by day as selectable 12-hour time chips. */
export function SlotPicker({ booking }: { booking: ParentBooking }) {
  const { formState } = useFormContext();
  const error = fieldError(formState.errors, "slotId");
  const { slots } = booking;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1.5 text-label font-medium text-fg">
        Time<span className="ml-0.5 text-error">*</span>
      </legend>
      {booking.needsTeacher && <p className="text-label text-fg-muted">Choose a teacher to see their open times.</p>}
      {!booking.needsTeacher && slots.isLoading && <Skeleton className="h-24 w-full" />}
      {!!slots.error && <ErrorState error={slots.error} onRetry={() => slots.refetch()} className="py-6" />}
      {booking.days.map((day) => (
        <div key={day.date} className="flex flex-col gap-2">
          <span className="text-caption font-medium text-fg-muted">{weekdayLabel(day.date)}</span>
          <div className="flex flex-wrap gap-2">
            {day.items.map((slot) => {
              const selected = slot.id === booking.selectedSlotId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  aria-pressed={selected}
                  title={[modeLabel(slot.mode), slot.location, slot.staffName].filter(Boolean).join(" · ")}
                  onClick={() => booking.selectSlot(slot.id)}
                  className={cn(
                    "h-9 whitespace-nowrap rounded-input border px-3 text-label font-medium transition-colors",
                    selected ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-fg hover:bg-selected/60",
                  )}
                >
                  {formatTime(slot.startTime)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {booking.hasOpenTimes && (
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={booking.askOtherTime}>
            None of these work? Suggest another time
          </Button>
        </div>
      )}
      {error?.message && (
        <p role="alert" className="text-caption text-error">
          {error.message}
        </p>
      )}
    </fieldset>
  );
}
