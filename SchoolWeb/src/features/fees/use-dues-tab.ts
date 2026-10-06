import { useCallback, useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useActiveBranches } from "@/features/branches/api";
import { useClassOptions } from "@/features/classes/api";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { dueColumns } from "./due-columns";
import { useDues, useSendDueReminders } from "./dues-api";
import type { DueRow } from "./types";

type DueFilters = { classId?: string; minDays?: string };

/** Aging list with multi-select for reminders. */
export function useDuesTab(branchId: string | null) {
  const can = useCan();
  const list = useListState<DueFilters>({});
  const query = useDues({ ...list.params, branchId }, !!branchId);
  const { branches } = useActiveBranches();
  const schoolId = branches.find((branch) => branch.id === branchId)?.schoolId ?? null;
  const classes = useClassOptions(schoolId);
  const remind = useSendDueReminders();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reminderJobId, setReminderJobId] = useState<string | null>(null);
  const ledger = useDialogState<DueRow>();
  const payment = useDialogState<DueRow>();

  const canRemind = can("fees.edit");
  const canPay = can("fees.add");
  const rows = query.data?.data;

  const toggle = useCallback((studentId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }, []);

  const pageIds = (rows ?? []).map((row) => row.student.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      pageIds.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)));
      return next;
    });

  const columns = useMemo(
    () =>
      dueColumns({
        selectable: canRemind,
        isSelected: (id) => selected.has(id),
        onToggle: toggle,
        onLedger: ledger.show,
        onPayment: canPay ? payment.show : undefined,
      }),
    [canRemind, canPay, selected, toggle, ledger.show, payment.show],
  );

  const sendReminders = () =>
    remind.mutate([...selected], {
      onSuccess: (result) => {
        setSelected(new Set());
        setReminderJobId(result.data?.jobId ?? null);
      },
    });

  return {
    list,
    query,
    rows,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    classOptions: classes.options,
    selection: { count: selected.size, allOnPage, toggleAll, clear: () => setSelected(new Set()) },
    canRemind,
    sendReminders,
    sending: remind.isPending,
    reminderJobId,
    ledger,
    payment,
  };
}
