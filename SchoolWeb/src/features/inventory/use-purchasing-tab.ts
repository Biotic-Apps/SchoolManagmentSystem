import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { purchaseRequestColumns } from "./purchase-columns";
import { usePurchaseRequests } from "./purchasing-api";
import type { PurchaseRequest } from "./types";
import { useItemLookups } from "./use-item-lookups";

export function usePurchasingTab(branchId: string) {
  const can = useCan();
  const list = useListState<{ status?: string }>({});
  const query = usePurchaseRequests({ ...list.params, branchId });
  const lookups = useItemLookups(branchId);
  const columns = useMemo(() => purchaseRequestColumns(), []);
  const [opened, setOpened] = useState<PurchaseRequest | null>(null);

  const rows = query.data?.data;
  const selected = opened ? (rows?.find((row) => row.id === opened.id) ?? opened) : null;

  return {
    list,
    query,
    rows,
    columns,
    lookups,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    composer: useDialogState<true>(),
    canRequest: can("inventory.add"),
    selected,
    open: setOpened,
    close: () => setOpened(null),
  };
}
