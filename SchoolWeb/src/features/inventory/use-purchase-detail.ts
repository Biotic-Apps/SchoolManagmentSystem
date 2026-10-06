import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { outstandingOf } from "./purchase-amounts";
import { useBillOrder } from "./purchasing-api";
import type { PurchaseRequest } from "./types";

export type PurchaseDialog = "order" | "receive";

export function usePurchaseDetail(request: PurchaseRequest | null) {
  const can = useCan();
  const order = request?.purchaseOrder ?? null;
  const bill = useBillOrder(order?.id ?? "");
  const [dialog, setDialog] = useState<PurchaseDialog | null>(null);
  const hasOutstanding = !!order && order.lines.some((line) => outstandingOf(line) > 0);

  return {
    order,
    rights: {
      order: request?.status === "APPROVED" && !order && can("inventory.edit"),
      receive: !!order && order.status !== "BILLED" && hasOutstanding && can("inventory.edit"),
      bill: !!order && order.status !== "BILLED" && !order.expenseId && can("expenses.add"),
    },
    dialog,
    openDialog: setDialog,
    closeDialog: () => setDialog(null),
    billing: bill.isPending,
    createBill: () => bill.mutate(),
  };
}

export type PurchaseDetail = ReturnType<typeof usePurchaseDetail>;
