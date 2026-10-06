import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { useSectionOptions } from "@/features/classes/sections-api";
import { ApiError, hasErrorCode } from "@/lib/api-error";
import { useServerForm } from "@/lib/use-server-form";
import { assignmentDefaults, assignmentSchema, toAssignmentInput, type AssignmentFormValues } from "./action-schemas";
import { useAddStaffAssignment, useStaffOptions } from "./api";
import { SECTION_KINDS } from "./options";
import type { AssignmentKind } from "./types";
import { useClassSubjectOptions } from "@/features/classes/api";

const CONFLICT_TEXT: Partial<Record<AssignmentKind, string>> = {
  CLASS_TEACHER: "This section already has a class teacher in this session. End that assignment first.",
  SUBJECT_TEACHER:
    "This subject already has a teacher in this section. End that assignment first, or add this one as a substitute.",
};

async function withConflictText<T>(kind: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const text = CONFLICT_TEXT[kind as AssignmentKind];
    if (text && hasErrorCode(error, "CONFLICT")) throw new ApiError(409, { code: "CONFLICT", message: text });
    throw error;
  }
}

interface AssignmentFormContext {
  staffId: string;
  branchId: string;
  sessionId: string | null;
}

/** Which fields apply depends on the kind: section, subject, responsible teacher, substitute end date. */
export function useAssignmentForm({ staffId, branchId, sessionId }: AssignmentFormContext, onDone: () => void) {
  const add = useAddStaffAssignment(staffId);
  const server = useServerForm<AssignmentFormValues>({
    schema: assignmentSchema,
    defaultValues: assignmentDefaults(sessionId),
    onSubmit: (values) =>
      withConflictText(values.kind, () => add.mutateAsync(toAssignmentInput(values, branchId))),
    onSuccess: onDone,
  });
  const { control } = server.form;
  const [kind, chosenSession, sectionId, isSubstitute] = useWatch({
    control,
    name: ["kind", "sessionId", "sectionId", "isSubstitute"],
  });

  // A subject picked for another section's class no longer applies.
  const { setValue } = server.form;
  useEffect(() => setValue("subjectId", ""), [sectionId, setValue]);
  useEffect(() => setValue("sectionId", ""), [chosenSession, setValue]);

  const sections = useSectionOptions(branchId, chosenSession || null);
  const classId = sections.sections.find((section) => section.id === sectionId)?.classId ?? null;
  const isSubjectTeacher = kind === "SUBJECT_TEACHER";
  const subjects = useClassSubjectOptions(isSubjectTeacher ? classId : null);
  const teachers = useStaffOptions(kind === "HELPER" ? branchId : null, "TEACHER");
  const sectionRequired = SECTION_KINDS.includes(kind as AssignmentKind);

  return {
    ...server,
    sectionOptions: sections.options,
    sectionsLoading: sections.isLoading,
    subjectOptions: subjects.options,
    subjectsLoading: subjects.isLoading,
    teacherOptions: teachers.options.filter((option) => option.id !== staffId),
    showSection: !!kind,
    sectionRequired,
    showSubject: isSubjectTeacher,
    subjectDisabled: !classId,
    showResponsible: kind === "HELPER",
    showValidUntil: isSubstitute,
  };
}
