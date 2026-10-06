import { useMemo, useState } from "react";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { addDays, todayIso } from "@/lib/dates";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useIncidents } from "./api";
import { incidentColumns } from "./incident-columns";
import type { IncidentDetail } from "./types";

const DEFAULT_RANGE_DAYS = 30;

export function useIncidentsTab() {
  const picker = useBranchPicker();
  const today = todayIso();
  const [from, setFromState] = useState(() => addDays(today, -DEFAULT_RANGE_DAYS));
  const [to, setToState] = useState(today);
  const [page, setPage] = useState(1);
  const [reporting, setReporting] = useState(false);
  const detail = useDialogState<IncidentDetail>();

  const query = useIncidents({ branchId: picker.branchId, from, to, page }, !!picker.branchId);
  const columns = useMemo(() => incidentColumns(), []);
  const rows = query.data?.data;
  // Keep the drawer in sync after a close action refetches the list.
  const selected = detail.item ? (rows?.find((row) => row.id === detail.item?.id) ?? detail.item) : null;

  const resetPage = <T,>(set: (value: T) => void) => (value: T) => {
    set(value);
    setPage(1);
  };

  return {
    picker: { ...picker, setBranchId: resetPage(picker.setBranchId) },
    from,
    to,
    setFrom: resetPage(setFromState),
    setTo: resetPage(setToState),
    today,
    query,
    rows,
    columns,
    pagination: paginationFrom(query.data?.meta, setPage),
    detail,
    selected,
    reporting,
    setReporting,
  };
}
