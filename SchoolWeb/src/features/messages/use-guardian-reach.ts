import { useStudent } from "@/features/students/api";
import { guardianReach, guardianReachMessage } from "./guardian-reach";

/** Staff composing to a student's guardians: can anyone receive it? Checked as soon as the student is picked. */
export function useGuardianReach(studentId: string | null) {
  const student = useStudent(studentId);
  const data = studentId ? student.data : undefined;
  const reach = data ? guardianReach(data) : null;
  return {
    checking: !!studentId && student.isLoading,
    blocked: !!reach && reach !== "ok",
    message: data && reach && reach !== "ok" ? guardianReachMessage(reach, data) : null,
    studentId: data?.id ?? null,
  };
}
