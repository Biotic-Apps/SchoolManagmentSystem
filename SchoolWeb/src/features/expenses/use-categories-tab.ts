import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { categoryColumns } from "./catalog-columns";
import { useExpenseCategories } from "./categories-api";

/** Categories are shared by every branch of a school. */
export function useCategoriesTab(schoolId: string | null) {
  const can = useCan();
  const query = useExpenseCategories(schoolId);
  const columns = useMemo(() => categoryColumns(), []);

  return {
    query,
    rows: query.data,
    columns,
    composer: useDialogState<true>(),
    canAdd: can("expenses.add") && !!schoolId,
  };
}
