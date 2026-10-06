import { useMemo, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSectionOptions } from "@/features/classes/sections-api";
import { paginationFrom } from "@/lib/pagination";
import { useListState } from "@/lib/use-list-state";
import { markSheetColumns } from "./mark-sheet-columns";
import { useMarkSheets } from "./marks-api";
import type { Exam, MarkSheet } from "./types";

type SheetFilters = { sectionId?: string; subjectId?: string };

function uniqueOptions(items: Option[]): Option[] {
  const seen = new Map<string, Option>();
  for (const item of items) if (!seen.has(item.id)) seen.set(item.id, item);
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Mark sheets of an exam (teachers only see their own); a selected sheet opens in the editor. */
export function useMarkSheetsTab(exam: Exam) {
  const list = useListState<SheetFilters>({});
  const query = useMarkSheets(exam.id, { ...list.filters, page: list.page, pageSize: 50 });
  const sections = useSectionOptions(exam.branchId, exam.sessionId);
  const [openId, setOpenId] = useState<string | null>(null);
  const rows: MarkSheet[] | undefined = query.data?.data;

  const sectionOptions = useMemo(
    () =>
      sections.sections
        .filter((section) => exam.classIds.length === 0 || exam.classIds.includes(section.classId))
        .map((section) => ({ id: section.id, name: `${section.className} ${section.name}` })),
    [sections.sections, exam.classIds],
  );

  const subjectOptions = useMemo(() => {
    const fromPapers = (exam.papers ?? []).map((paper) => ({
      id: paper.subjectId,
      name: paper.subjectName ?? paper.subjectId,
    }));
    const fromSheets = (rows ?? []).map((sheet) => sheet.paper.subject);
    return uniqueOptions(fromPapers.length ? fromPapers : fromSheets);
  }, [exam.papers, rows]);

  const columns = useMemo(() => markSheetColumns(), []);

  return {
    list,
    query,
    rows,
    columns,
    sectionOptions,
    subjectOptions,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    openId,
    open: (id: string) => setOpenId(id),
    close: () => setOpenId(null),
  };
}
