import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStudents } from "@/features/students/api";
import { studentColumns } from "@/features/students/student-columns";
import type { StudentSummary } from "@/features/students/types";
import { useSectionScope } from "./use-section-scope";

/** Teacher / helper view: own sections and the roster of the chosen one. */
export function useMyClassesPage() {
  const router = useRouter();
  const sectionScope = useSectionScope();
  const sectionId = sectionScope.sectionId;
  const query = useStudents({ sectionId: sectionId ?? "", status: "ACTIVE", pageSize: 100 }, !!sectionId);
  const columns = useMemo(() => studentColumns(), []);

  return {
    sectionScope,
    query,
    rows: query.data?.data,
    columns,
    total: query.data?.meta?.total ?? query.data?.data.length ?? 0,
    openStudent: (row: StudentSummary) => router.push(`/students/${row.id}`),
  };
}
