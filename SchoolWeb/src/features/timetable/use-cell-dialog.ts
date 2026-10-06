import { useWatch } from "react-hook-form";
import { useClassSubjects } from "@/features/classes/api";
import { useRoomOptions } from "@/features/classes/rooms-api";
import type { Section } from "@/features/classes/types";
import { useSectionStaff, useStaffOptions } from "@/features/staff/api";
import { useServerForm } from "@/lib/use-server-form";
import { plainName, teacherOptions, withCurrent } from "./cell-options";
import type { CellValue } from "./grid";
import { cellSchema, type CellFormValues } from "./schemas";

/** Picks subject / teacher / room for one grid cell; applying only changes the local draft. */
export function useCellDialog(section: Section, value: CellValue | undefined, onApply: (value: CellValue | null) => void) {
  const subjects = useClassSubjects(section.classId);
  const staff = useSectionStaff(section.id);
  const teachers = useStaffOptions(section.branchId, "TEACHER");
  const rooms = useRoomOptions(section.branchId);

  const subjectOptions = withCurrent(
    (subjects.data ?? []).map((subject) => ({ id: subject.id, name: subject.name })),
    value?.subject,
  );
  const roomOptions = withCurrent(rooms.options, value?.room);
  const staffFor = (subjectId: string) => teacherOptions(staff.data, subjectId, teachers.options, value?.staff);

  const { form, submit, formError } = useServerForm<CellFormValues>({
    schema: cellSchema,
    defaultValues: { subjectId: value?.subject.id ?? "", staffId: value?.staff.id ?? "", roomId: value?.room?.id ?? "" },
    onSubmit: async (values) =>
      onApply({
        subject: { id: values.subjectId, name: plainName(subjectOptions, values.subjectId) },
        staff: { id: values.staffId, name: plainName(staffFor(values.subjectId), values.staffId) },
        room: values.roomId ? { id: values.roomId, name: plainName(roomOptions, values.roomId) } : null,
      }),
  });
  const subjectId = useWatch({ control: form.control, name: "subjectId" });

  return {
    form,
    submit,
    formError,
    subjectOptions,
    staffOptions: staffFor(subjectId),
    roomOptions,
    loading: subjects.isLoading || staff.isLoading || teachers.isLoading,
    canClear: !!value,
    clear: () => onApply(null),
  };
}
