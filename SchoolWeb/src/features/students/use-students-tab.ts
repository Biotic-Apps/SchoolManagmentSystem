import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSectionOptions } from "@/features/classes/sections-api";
import { paginationFrom } from "@/lib/pagination";
import { useListState } from "@/lib/use-list-state";
import { useStudents } from "./api";
import { studentColumns } from "./student-columns";
import type { StudentSummary } from "./types";

interface StudentsTabScope {
  branchId: string;
  sessionId: string;
  classId: string | undefined;
}

/** Students of the chosen branch session (optionally one class), filtered by section and status. */
export function useStudentsTab({ branchId, sessionId, classId }: StudentsTabScope) {
  const router = useRouter();
  const list = useListState<{ sectionId?: string; status?: string }>({ sectionId: undefined, status: "ACTIVE" });
  const sections = useSectionOptions(classId ? branchId : null, sessionId, classId);
  const query = useStudents({ ...list.params, branchId, sessionId, classId });
  const columns = useMemo(() => studentColumns(), []);

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    sectionOptions: sections.options,
    showSectionFilter: !!classId,
    openStudent: (row: StudentSummary) => router.push(`/students/${row.id}`),
  };
}
