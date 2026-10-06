import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { movementColumns } from "./movement-columns";
import { useMovements } from "./stock-api";
import { useItemLookups } from "./use-item-lookups";

export function useMovementsTab(branchId: string) {
  const can = useCan();
  const lookups = useItemLookups(branchId);
  const movements = useMovements(branchId);
  const columns = useMemo(() => movementColumns(lookups), [lookups]);

  return {
    lookups,
    movements,
    columns,
    /** null when the server has no movements list. */
    showHistory: movements.data !== null,
    composer: useDialogState<true>(),
    canRecord: can("inventory.edit"),
  };
}
