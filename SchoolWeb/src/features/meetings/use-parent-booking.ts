import { useMemo, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import type { ChildSummary } from "@/features/auth/types";
import { staffTargetOptions } from "@/features/messages/staff-targets";
import { useSectionStaff } from "@/features/staff/api";
import { useStudent } from "@/features/students/api";
import { ApiError } from "@/lib/api-error";
import { useServerForm } from "@/lib/use-server-form";
import { useBookMeeting, useSlots } from "./api";
import { bookingWindow, groupByDate } from "./options";
import { bookingSchema } from "./schemas";
import type { MeetingSlot } from "./types";

const TAKEN = "Someone just booked this slot. Pick another time.";

/** Teachers come from the child's section; without user ids on that list, from the open slots. */
function teacherOptionsFromSlots(slots: MeetingSlot[]): Option[] {
  const byUser = new Map<string, string>();
  for (const slot of slots) if (!byUser.has(slot.staffUserId)) byUser.set(slot.staffUserId, slot.staffName ?? "Teacher");
  return [...byUser].map(([id, name]) => ({ id, name }));
}

export function useParentBooking(child: ChildSummary, onBooked: () => void) {
  const student = useStudent(child.id);
  const sectionStaff = useSectionStaff(student.data?.enrollment?.sectionId ?? null);
  const sectionTeachers = staffTargetOptions(sectionStaff.data);
  const filterOnServer = sectionTeachers.length > 0;
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [range] = useState(bookingWindow);

  const slots = useSlots(
    { staffUserId: filterOnServer ? teacherId : undefined, ...range },
    filterOnServer ? !!teacherId : !sectionStaff.isLoading,
  );
  const open = useMemo(
    () => (slots.data ?? []).filter((slot) => slot.status === "OPEN" && (!teacherId || slot.staffUserId === teacherId)),
    [slots.data, teacherId],
  );

  const book = useBookMeeting();
  const { form, submit, submitting, formError } = useServerForm({
    schema: bookingSchema,
    defaultValues: { slotId: "", agenda: "" },
    onSubmit: async (values) => {
      try {
        return await book.mutateAsync({ ...values, studentId: child.id });
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
      form.reset({ slotId: "", agenda: "" });
      onBooked();
    },
  });

  const teacherOptions = filterOnServer ? sectionTeachers : teacherOptionsFromSlots(slots.data ?? []);

  return {
    form,
    submit,
    submitting,
    formError,
    teacherOptions,
    teachersLoading: student.isLoading || sectionStaff.isLoading,
    teacherId,
    setTeacherId: (id: string) => {
      setTeacherId(id);
      form.setValue("slotId", "");
    },
    needsTeacher: filterOnServer && !teacherId,
    slots,
    days: groupByDate(open),
    selectedSlotId: form.watch("slotId"),
    selectSlot: (id: string) => form.setValue("slotId", id, { shouldValidate: true }),
  };
}

export type ParentBooking = ReturnType<typeof useParentBooking>;
