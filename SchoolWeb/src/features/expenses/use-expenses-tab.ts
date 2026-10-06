import { useMemo, useState } from "react";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { expenseColumns } from "./expense-columns";
import { useExpenses } from "./expenses-api";
import type { Expense } from "./types";
import { useExpenseLookups } from "./use-expense-lookups";

type ExpenseFilters = { categoryId?: string; status?: string; from?: string; to?: string };

export function useExpensesTab(branchId: string | null, schoolId: string | null) {
  const list = useListState<ExpenseFilters>({});
  const query = useExpenses({ ...list.params, branchId }, !!branchId);
  const lookups = useExpenseLookups(schoolId);
  const columns = useMemo(() => expenseColumns(lookups), [lookups]);
  const composer = useDialogState<true>();
  const [opened, setOpened] = useState<Expense | null>(null);

  const rows = query.data?.data;
  // Keep the drawer in sync with the refreshed list after a payment or submit.
  const selected = opened ? (rows?.find((row) => row.id === opened.id) ?? opened) : null;

  return {
    list,
    query,
    rows,
    columns,
    lookups,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    composer,
    selected,
    open: setOpened,
    close: () => setOpened(null),
  };
}

export type ExpensesTabState = ReturnType<typeof useExpensesTab>;
