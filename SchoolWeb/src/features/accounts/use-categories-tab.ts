import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useIncomeCategories } from "./categories-api";
import type { IncomeCategory } from "./types";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { textOrDash } from "@/lib/format";

function incomeCategoryColumns(): DataTableColumn<IncomeCategory>[] {
  return [
    { id: "name", header: "Category", className: "min-w-40", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "code", header: "Code", className: "whitespace-nowrap", cell: (row) => textOrDash(row.code) },
  ];
}

export function useIncomeCategoriesTab(schoolId: string | null) {
  const can = useCan();
  const query = useIncomeCategories(schoolId);
  const columns = useMemo(() => incomeCategoryColumns(), []);

  return {
    query,
    rows: query.data,
    columns,
    composer: useDialogState<true>(),
    canAdd: can("expenses.add") && !!schoolId,
  };
}
