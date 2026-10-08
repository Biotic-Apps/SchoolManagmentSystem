import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Option } from "@/components/shared/OptionSelect";
import { useTeachingStaff } from "@/features/classes/teaching-staff-api";
import { useSaveRoom } from "@/features/classes/rooms-api";
import type { TimetableBuilder } from "./builder-types";
import type { CellValue } from "./grid";
import { lessonTeachers, staffOptions, subjectOptions } from "./lesson-options";
import { lessonSchema, type LessonFormValues } from "./lesson-schema";

export interface LessonTarget {
  day: number;
  periodIndex: number;
}

/**
 * Lesson dialog: the section's subjects with what is left, the teacher pre-filled from the
 * allocation, rooms with "+ New room", and instant busy warnings from the builder's `busy` list.
 */
export function useLessonDialog(builder: TimetableBuilder, target: LessonTarget, value: CellValue | undefined) {
  const staff = useTeachingStaff(builder.section.branchId, builder.timetable.sessionId);
  const saveRoom = useSaveRoom();
  const [extraRooms, setExtraRooms] = useState<Option[]>([]);
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      subjectId: value?.subject.id ?? "",
      staffId: value?.staff.id ?? "",
      roomId: value?.room?.id ?? "",
      allocate: true,
    },
  });
  const [subjectId, staffId, roomId] = useWatch({ control: form.control, name: ["subjectId", "staffId", "roomId"] });
  const lesson = builder.lessons.find((item) => item.subject.id === subjectId);

  // Picking a subject fills in its teacher, unless the user already chose someone else.
  const prefilled = useRef(value?.staff.id ?? "");
  useEffect(() => {
    const teacher = lesson?.teacher?.id ?? "";
    const staffNow = form.getValues("staffId");
    if (teacher && (!staffNow || staffNow === prefilled.current)) {
      form.setValue("staffId", teacher, { shouldValidate: form.formState.isSubmitted });
      prefilled.current = teacher;
    }
  }, [lesson, form]);

  // Teachers building their own section may not see the branch staff list: fall back to the allocated teachers.
  const staffList = staff.data ?? (staff.isError ? lessonTeachers(builder) : []);
  const busyNow = builder.busy.filter((entry) => entry.day === target.day && entry.periodIndex === target.periodIndex);
  const teacherBusy = busyNow.find((entry) => entry.staffId && entry.staffId === staffId);
  const roomBusy = busyNow.find((entry) => entry.roomId && entry.roomId === roomId);
  const teacher = staffList.find((member) => member.id === staffId);
  const rooms = [...builder.rooms, ...extraRooms.filter((room) => !builder.rooms.some((item) => item.id === room.id))];

  return {
    form,
    lesson,
    subjectOptions: subjectOptions(builder.lessons),
    staffOptions: staffOptions(staffList, lesson, busyNow, value?.staff),
    roomOptions: value?.room && !rooms.some((room) => room.id === value.room?.id) ? [...rooms, value.room] : rooms,
    staffLoading: staff.isLoading,
    teacherName: teacher?.name ?? value?.staff.name ?? "",
    /** Offer "Make X the English teacher of …" only when nobody teaches the subject here yet. */
    canAllocate: !!lesson && !lesson.teacher && !!staffId,
    otherTeacher: lesson?.teacher && staffId && lesson.teacher.id !== staffId ? lesson.teacher : null,
    teacherBusy,
    roomBusy,
    createRoom: async (name: string): Promise<Option> => {
      const created = (await saveRoom.mutateAsync({ input: { branchId: builder.section.branchId, name, capacity: null } })).data;
      const option = { id: created.id, name: created.name };
      setExtraRooms((list) => [...list, option]);
      return option;
    },
    nameOf: (list: Option[], id: string) => list.find((item) => item.id === id)?.name ?? "",
  };
}

export type LessonDialogState = ReturnType<typeof useLessonDialog>;
