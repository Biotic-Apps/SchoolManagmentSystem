import { useMemo, useState } from "react";
import { useSectionOptions } from "@/features/classes/sections-api";
import { useStaffOptions } from "@/features/staff/api";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDeleteOverride, useOverrides, usePeriods } from "./api";
import { periodOptionLabel } from "./grid";
import { overrideColumns, type OverrideLookups } from "./override-columns";
import type { TimetableOverride } from "./types";
import { todayIso } from "./week-dates";

export function useSubstitutionsTab(branchId: string, sessionId: string | null, canEdit: boolean) {
  const [date, setDate] = useState(todayIso);
  const query = useOverrides(branchId, date);
  const periods = usePeriods(branchId);
  const sections = useSectionOptions(branchId, sessionId);
  const teachers = useStaffOptions(branchId, "TEACHER");
  const form = useDialogState<true>();
  const deleteTarget = useDialogState<TimetableOverride>();
  const remove = useDeleteOverride();

  const lookups: OverrideLookups = useMemo(
    () => ({
      sectionName: (row) => {
        if (row.className && row.sectionName) return `${row.className} ${row.sectionName}`;
        const section = sections.sections.find((item) => item.id === row.sectionId);
        return section ? `${section.className} ${section.name}` : (row.sectionName ?? "—");
      },
      periodLabel: (index) => {
        const period = periods.data?.find((item) => item.index === index);
        return period ? periodOptionLabel(period) : `P${index}`;
      },
      staffName: (id) => teachers.options.find((option) => option.id === id)?.name ?? null,
    }),
    [sections.sections, periods.data, teachers.options],
  );
  const columns = useMemo(
    () => overrideColumns(lookups, canEdit ? deleteTarget.show : undefined),
    [lookups, canEdit, deleteTarget.show],
  );

  const confirmDelete = async () => {
    if (!deleteTarget.item) return;
    try {
      await remove.mutateAsync(deleteTarget.item.id);
    } finally {
      deleteTarget.close();
    }
  };

  return {
    date,
    setDate: (value: string) => value && setDate(value),
    query,
    rows: query.data,
    columns,
    form,
    deleteTarget,
    deleting: remove.isPending,
    confirmDelete: () => void confirmDelete().catch(() => undefined),
  };
}
