import { useCan } from "@/features/auth/use-can";
import type { GuardianLink } from "@/features/guardians/types";
import { useUnlink } from "@/features/guardians/use-unlink";
import { useDialogState } from "@/lib/use-dialog-state";
import type { StudentDetail } from "./types";

/** Guardian links of a student; revoked links are hidden, primary first. */
export function useStudentGuardians(student: StudentDetail, readOnly: boolean) {
  const can = useCan();
  const add = useDialogState<true>();
  const unlink = useUnlink();
  const links = student.guardians
    .filter((link) => link.status !== "REVOKED")
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  const remove = (link: GuardianLink) =>
    unlink.show({
      studentId: student.id,
      studentName: student.name,
      guardianId: link.guardian.id,
      guardianName: link.guardian.name,
      linkId: link.id,
    });

  return {
    links,
    readOnly,
    canAdd: !readOnly && can("students.edit"),
    onRemove: !readOnly && can("guardians.edit") ? remove : undefined,
    add,
    unlink,
  };
}
