import { useServerForm } from "@/lib/use-server-form";
import { useRequestLeave } from "./leave-api";
import {
  staffLeaveDefaults,
  staffLeaveSchema,
  studentLeaveDefaults,
  studentLeaveSchema,
  toStaffLeaveInput,
  toStudentLeaveInput,
  type StaffLeaveValues,
  type StudentLeaveValues,
} from "./schemas";

/** Parent asks for leave for their child; the class teacher or principal decides. */
export function useStudentLeaveForm(studentId: string, onDone: () => void) {
  const request = useRequestLeave();
  return useServerForm<StudentLeaveValues>({
    schema: studentLeaveSchema,
    defaultValues: studentLeaveDefaults(),
    onSubmit: (values) => request.mutateAsync(toStudentLeaveInput(studentId, values)),
    onSuccess: onDone,
  });
}

/** Staff ask for their own leave; the principal decides (principal's own → super admin). */
export function useStaffLeaveForm(onDone: () => void) {
  const request = useRequestLeave();
  return useServerForm<StaffLeaveValues>({
    schema: staffLeaveSchema,
    defaultValues: staffLeaveDefaults(),
    onSubmit: (values) => request.mutateAsync(toStaffLeaveInput(values)),
    onSuccess: onDone,
  });
}
