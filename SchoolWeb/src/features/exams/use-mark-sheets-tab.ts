import { useMemo, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSectionOptions } from "@/features/classes/sections-api";
import { localPage } from "@/lib/pagination";
import { useListState } from "@/lib/use-list-state";
import { markSheetColumns } from "./mark-sheet-columns";
import { useMarkSheets } from "./marks-api";
import type { Exam, MarkSheet } from "./types";

const PAGE_SIZE = 50;

type SheetFilters = { sectionId?: string; subjectId?: string };

function uniqueOptions(items: Option[]): Option[] {
  const seen = new Map<string, Option>();
  for (const item of items) if (!seen.has(item.id)) seen.set(item.id, item);
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Mark sheets of an exam (teachers only see their own); a selected sheet opens in the editor.
 * The endpoint returns the full list, so it is paged here. */
export function useMarkSheetsTab(exam: Exam) {
  const list = useListState<SheetFilters>({});
  const query = useMarkSheets(exam.id, list.filters);
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
    // The API sends each paper's subject as { id, name }.
    const fromPapers = (exam.papers ?? []).flatMap((paper) => {
      const id = paper.subject?.id ?? paper.subjectId;
      return id ? [{ id, name: paper.subject?.name ?? paper.subjectName ?? id }] : [];
    });
    const fromSheets = (rows ?? []).map((sheet) => sheet.paper.subject);
    return uniqueOptions(fromPapers.length ? fromPapers : fromSheets);
  }, [exam.papers, rows]);

  const columns = useMemo(() => markSheetColumns(), []);
  const visible = localPage(rows, list.page, PAGE_SIZE, list.setPage);

  return {
    list,
    query,
    rows: visible.rows,
    columns,
    sectionOptions,
    subjectOptions,
    pagination: visible.pagination,
    openId,
    open: (id: string) => setOpenId(id),
    close: () => setOpenId(null),
  };
}
