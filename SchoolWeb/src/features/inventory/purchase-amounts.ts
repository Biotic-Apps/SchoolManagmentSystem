import { minor } from "@/features/expenses/amounts";
import type { PurchaseOrder, PurchaseOrderLine, PurchaseRequest } from "./types";

export function requestTotal(request: PurchaseRequest): number {
  const total = minor(request.estimatedTotalMinor);
  if (total !== null) return total;
  return request.lines.reduce((sum, line) => sum + Number(line.quantity) * (minor(line.estimatedUnitMinor) ?? 0), 0);
}

export function receivedOf(line: PurchaseOrderLine): number {
  return Number(line.receivedQty ?? 0);
}

export function outstandingOf(line: PurchaseOrderLine): number {
  return Math.max(0, Number(line.orderedQty ?? 0) - receivedOf(line));
}

export function lineTotal(line: PurchaseOrderLine): number {
  return minor(line.totalMinor) ?? Number(line.orderedQty ?? 0) * (minor(line.unitPriceMinor) ?? 0);
}

export function orderTotal(order: PurchaseOrder): number {
  const total = minor(order.totalMinor);
  if (total !== null) return total;
  return order.lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

/** What a vendor bill claims: received goods only. */
export function receivedTotal(order: PurchaseOrder): number {
  const total = minor(order.receivedTotalMinor);
  if (total !== null) return total;
  return order.lines.reduce((sum, line) => sum + receivedOf(line) * (minor(line.unitPriceMinor) ?? 0), 0);
}
