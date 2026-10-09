import { useMemo, useState } from "react";
import type { ChildSummary } from "@/features/auth/types";
import { ApiError } from "@/lib/api-error";
import { useServerForm } from "@/lib/use-server-form";
import { useBookMeeting, useMeetingTeachers, useParentRequest, useSlots } from "./api";
import { bookingWindow, groupByDate } from "./options";
import { bookingDefaults, bookingSchema, type BookingFormValues } from "./schemas";
import { teacherOptions } from "./teacher-options";
import type { MeetingMode } from "./types";

const TAKEN = "Someone just booked this slot. Pick another time.";

/**
 * Parent picks one of the child's teachers, then books an open slot — or, when
 * the teacher has none (or none suits), suggests a time the teacher confirms.
 */
export function useParentBooking(child: ChildSummary, onBooked: () => void) {
  const teachers = useMeetingTeachers(child.id);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [range] = useState(bookingWindow);
  const teacher = teachers.data?.find((t) => t.userId === teacherId) ?? null;

  const slots = useSlots({ staffUserId: teacherId, ...range }, !!teacherId);
  const open = useMemo(
    () => (slots.data ?? []).filter((slot) => slot.status === "OPEN" && slot.staffUserId === teacherId),
    [slots.data, teacherId],
  );

  const book = useBookMeeting();
  const request = useParentRequest();
  const { form, submit, submitting, formError } = useServerForm({
    schema: bookingSchema,
    defaultValues: bookingDefaults(),
    onSubmit: async (values: BookingFormValues) => {
      if (!teacherId) return null;
      if (values.kind === "request") {
        return request.mutateAsync({
          studentId: child.id,
          staffUserId: teacherId,
          date: values.date,
          startTime: values.startTime,
          mode: values.mode as MeetingMode,
          agenda: values.agenda,
        });
      }
      try {
        return await book.mutateAsync({ slotId: values.slotId, agenda: values.agenda, studentId: child.id });
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          form.setError("slotId", { type: "server", message: TAKEN });
          form.setValue("slotId", "");
          void slots.refetch();
          return null;
        }
        throw error;
      }
    },
    onSuccess: (meeting) => {
      if (!meeting) return;
      form.reset(bookingDefaults());
      setTeacherId(null);
      onBooked();
    },
  });

  const kind = form.watch("kind");
  const hasOpenTimes = !slots.isLoading && open.length > 0;
  // Without open times the only way forward is suggesting one.
  const requesting = !!teacher && (kind === "request" || (!slots.isLoading && open.length === 0));
  const setKind = (next: BookingFormValues["kind"]) => {
    form.setValue("kind", next);
    form.clearErrors(["slotId", "date", "startTime"]);
  };

  return {
    form,
    submit: (event?: Parameters<typeof submit>[0]) => {
      // Keep the hidden `kind` in step with what the screen shows before validating.
      if (requesting && kind !== "request") form.setValue("kind", "request");
      return submit(event);
    },
    submitting,
    formError,
    teachers,
    teacherOptions: teacherOptions(teachers.data ?? []),
    teacher,
    teacherId,
    setTeacherId: (id: string) => {
      setTeacherId(id);
      form.setValue("slotId", "");
      setKind("slot");
    },
    needsTeacher: !teacherId,
    requesting,
    hasOpenTimes,
    askOtherTime: () => setKind("request"),
    pickOpenTime: () => setKind("slot"),
    slots,
    days: groupByDate(open),
    selectedSlotId: form.watch("slotId"),
    selectSlot: (id: string) => form.setValue("slotId", id, { shouldValidate: true }),
  };
}

export type ParentBooking = ReturnType<typeof useParentBooking>;
