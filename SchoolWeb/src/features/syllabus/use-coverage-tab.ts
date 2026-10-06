import { useMemo } from "react";
import { useSectionOptions } from "@/features/classes/sections-api";
import { useSubjects } from "@/features/classes/subjects-api";
import { useCoverage } from "./api";
import { coverageColumns } from "./coverage-columns";
import type { SyllabusScope } from "./use-book-lists-tab";

/**
 * The contract only promises { total, completed, delayed, percent } per section/subject;
 * names come from the row when the API sends them, else from the section and subject lists.
 */
export function useCoverageTab({ branchId, sessionId, classId, schoolId }: SyllabusScope & { schoolId: string | null }) {
  const query = useCoverage({ branchId, sessionId, classId }, !!sessionId);
  const sections = useSectionOptions(branchId, sessionId, classId);
  const subjects = useSubjects({ schoolId, page: 1, pageSize: 100 }, !!schoolId);
  const subjectList = subjects.data?.data;

  const columns = useMemo(
    () =>
      coverageColumns({
        section: (row) => {
          if (row.className || row.sectionName) return [row.className, row.sectionName].filter(Boolean).join(" ");
          const section = sections.sections.find((item) => item.id === row.sectionId);
          return section && `${section.className} ${section.name}`;
        },
        subject: (row) => row.subjectName ?? subjectList?.find((item) => item.id === row.subjectId)?.name,
      }),
    [sections.sections, subjectList],
  );

  return {
    query,
    rows: query.data,
    columns,
    loading: !!sessionId && query.isLoading,
    hasSession: !!sessionId,
  };
}
