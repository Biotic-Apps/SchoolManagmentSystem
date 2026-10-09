import type { Option } from "@/components/shared/OptionSelect";
import { useClassOptions } from "@/features/classes/api";
import { useTerms } from "@/features/sessions/api";
import { useServerForm } from "@/lib/use-server-form";
import { useSaveExam } from "./exams-api";
import { examDefaults, examSchema, toExamInput, type ExamFormValues } from "./exam-schemas";
import { useGradingSchemes } from "./grading-api";
import type { Exam } from "./types";

interface ExamFormScope {
  schoolId: string | null;
  branchId: string;
  sessionId: string;
}

/** Create an exam, or edit one while it is DRAFT or SCHEDULED. */
export function useExamForm(exam: Exam | null, scope: ExamFormScope, onDone: (saved: Exam) => void) {
  const save = useSaveExam();
  const schemes = useGradingSchemes({ schoolId: scope.schoolId, sessionId: scope.sessionId }, !!scope.schoolId);
  const terms = useTerms(scope.sessionId);
  const classes = useClassOptions(scope.schoolId);

  const server = useServerForm<ExamFormValues, Exam>({
    schema: examSchema,
    defaultValues: examDefaults(exam),
    onSubmit: (values) =>
      save.mutateAsync({ id: exam?.id, input: toExamInput(values, { branchId: scope.branchId, sessionId: scope.sessionId }) }),
    onSuccess: onDone,
  });

  const schemeOptions: Option[] = (schemes.data ?? []).map((scheme) => ({
    id: scheme.id,
    name: scheme.status === "APPROVED" ? scheme.name : `${scheme.name} (not approved)`,
  }));
  const noSchemes = schemes.isSuccess && schemeOptions.length === 0;
  const termOptions: Option[] = (terms.data ?? []).map((term) => ({ id: term.id, name: term.name }));

  return { ...server, schemeOptions, noSchemes, termOptions, classOptions: classes.options, classesLoading: classes.isLoading };
}
