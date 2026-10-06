import { useServerForm } from "@/lib/use-server-form";
import { useUpdateStudent } from "./api";
import { editStudentDefaults, editStudentSchema, toStudentUpdate, type EditStudentValues } from "./schemas";
import type { StudentDetail } from "./types";

export function useEditStudentForm(student: StudentDetail, onDone: () => void) {
  const update = useUpdateStudent(student.id);
  return useServerForm<EditStudentValues>({
    schema: editStudentSchema,
    defaultValues: editStudentDefaults(student),
    onSubmit: (values) => update.mutateAsync(toStudentUpdate(values)),
    onSuccess: onDone,
  });
}
