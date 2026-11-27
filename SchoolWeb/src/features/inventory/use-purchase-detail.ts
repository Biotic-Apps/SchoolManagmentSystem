import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { outstandingOf } from "./purchase-amounts";
import { useBillOrder } from "./purchasing-api";
import type { PurchaseRequest } from "./types";

export type PurchaseDialog = "order" | "receive" | "bill";

export function usePurchaseDetail(request: PurchaseRequest | null) {
  const can = useCan();
  const order = request?.purchaseOrder ?? null;
  const bill = useBillOrder(order?.id ?? "");
  const [dialog, setDialog] = useState<PurchaseDialog | null>(null);
  const hasOutstanding = !!order && order.lines.some((line) => outstandingOf(line) > 0);
  // ORDERED → (PARTIALLY_)RECEIVED → BILLED: only goods already received can be billed.
  const receivable = order?.status === "ORDERED" || order?.status === "PARTIALLY_RECEIVED";
  const billable = order?.status === "PARTIALLY_RECEIVED" || order?.status === "RECEIVED";

  return {
    order,
    rights: {
      order: request?.status === "APPROVED" && !order && can("inventory.edit"),
      receive: receivable && hasOutstanding && can("inventory.edit"),
      bill: billable && can("expenses.add"),
    },
    /** Items still outstanding are not billed and cannot be received after billing. */
    partialBill: order?.status === "PARTIALLY_RECEIVED",
    dialog,
    openDialog: setDialog,
    closeDialog: () => setDialog(null),
    billing: bill.isPending,
    billError: bill.error,
    createBill: () => bill.mutate(undefined, { onSuccess: () => setDialog(null) }),
  };
}

export type PurchaseDetail = ReturnType<typeof usePurchaseDetail>;
