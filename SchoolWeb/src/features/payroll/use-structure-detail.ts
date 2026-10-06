import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useSalaryStructure } from "./structure-api";

export function useStructureDetail(staffId: string | null) {
  const can = useCan();
  const query = useSalaryStructure(staffId);
  const edit = useDialogState<true>();
  return {
    query,
    current: query.data?.current ?? null,
    history: query.data?.history ?? [],
    canEdit: can("payroll.edit"),
    edit,
  };
}
