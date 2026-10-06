import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Option } from "@/components/shared/OptionSelect";
import { useCan } from "@/features/auth/use-can";
import { useAcademicScope } from "@/features/classes/use-academic-scope";
import { useTerms } from "@/features/sessions/api";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useExams } from "./exams-api";
import type { Exam } from "./types";

const PAGE_SIZE = 20;

/** Exams of a branch session, filtered by term and status. */
export function useExamsTab() {
  const can = useCan();
  const router = useRouter();
  const scope = useAcademicScope();
  const terms = useTerms(scope.sessionId);
  const [termId, setTermId] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const editor = useDialogState<Exam>();
  const ready = !!scope.branchId && !!scope.sessionId;

  const query = useExams(
    { branchId: scope.branchId, sessionId: scope.sessionId, termId, status, page, pageSize: PAGE_SIZE },
    ready,
  );
  const termOptions: Option[] = (terms.data ?? []).map((term) => ({ id: term.id, name: term.name }));

  const resetPage = <T>(set: (value: T) => void) => (value: T) => {
    set(value);
    setPage(1);
  };
  const setSessionId: typeof scope.setSessionId = (id) => {
    scope.setSessionId(id);
    setTermId(undefined);
    setPage(1);
  };

  return {
    scope: { ...scope, setSessionId },
    query,
    rows: query.data?.data ?? [],
    pagination: paginationFrom(query.data?.meta, setPage),
    termOptions,
    termId,
    setTermId: resetPage(setTermId),
    status,
    setStatus: resetPage(setStatus),
    editor,
    canAdd: can("exams.add") && ready,
    canEdit: can("exams.edit"),
    open: (exam: Exam) => router.push(`/exams/${exam.id}`),
  };
}
