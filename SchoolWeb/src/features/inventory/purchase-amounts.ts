import { minor } from "@/features/expenses/amounts";
import type { PurchaseOrder, PurchaseOrderLine, PurchaseRequest } from "./types";

export function requestTotal(request: PurchaseRequest): number {
  const total = minor(request.estimatedTotalMinor);
  if (total !== null) return total;
  return request.lines.reduce((sum, line) => sum + Number(line.quantity) * (minor(line.estimatedUnitMinor) ?? 0), 0);
}

export function receivedOf(line: PurchaseOrderLine): number {
  return Number(line.receivedQuantity ?? line.receivedQty ?? 0);
}

export function outstandingOf(line: PurchaseOrderLine): number {
  return Math.max(0, Number(line.quantity) - receivedOf(line));
}

export function orderTotal(order: PurchaseOrder): number {
  const total = minor(order.totalMinor);
  if (total !== null) return total;
  return order.lines.reduce((sum, line) => sum + Number(line.quantity) * (minor(line.unitPriceMinor) ?? 0), 0);
}
