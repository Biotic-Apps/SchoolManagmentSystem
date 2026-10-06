import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { moneyText, toMinor, toMoneyText } from "@/lib/money";
import { blankToUndefined, isoDate, optionalIsoDate, wholeNumberText } from "@/lib/validation";
import { outstandingOf } from "./purchase-amounts";
import type { PurchaseOrder, PurchaseOrderInput, PurchaseRequest, ReceiveInput } from "./types";

export const orderSchema = z.object({
  vendorId: z.string().min(1, "Choose a vendor"),
  expectedOn: optionalIsoDate,
  lines: z.array(
    z.object({
      itemId: z.string(),
      quantity: wholeNumberText("the quantity", { min: 1 }),
      unitPrice: moneyText("the unit price"),
    }),
  ),
});
export type OrderValues = z.infer<typeof orderSchema>;

/** Starts from the approved request: same items, quantities and estimated prices. */
export function orderDefaults(request: PurchaseRequest): OrderValues {
  return {
    vendorId: "",
    expectedOn: "",
    lines: request.lines.map((line) => ({
      itemId: line.itemId,
      quantity: String(line.quantity),
      unitPrice: toMoneyText(Number(line.estimatedUnitMinor)),
    })),
  };
}

export function toOrderInput(values: OrderValues): PurchaseOrderInput {
  return {
    vendorId: values.vendorId,
    expectedOn: blankToUndefined(values.expectedOn),
    lines: values.lines.map((line) => ({
      itemId: line.itemId,
      quantity: Number(line.quantity),
      unitPriceMinor: toMinor(line.unitPrice) ?? 0,
    })),
  };
}

const receiveLine = z
  .object({ itemId: z.string(), outstanding: z.number(), quantity: wholeNumberText("the quantity") })
  .refine((line) => Number(line.quantity) <= line.outstanding, {
    path: ["quantity"],
    message: "Can't receive more than is outstanding",
  });

export const receiveSchema = z.object({
  receivedOn: isoDate,
  lines: z.array(receiveLine).refine((lines) => lines.some((line) => Number(line.quantity) > 0), {
    message: "Enter a received quantity for at least one item",
  }),
});
export type ReceiveValues = z.infer<typeof receiveSchema>;

export function receiveDefaults(order: PurchaseOrder): ReceiveValues {
  return {
    receivedOn: todayIso(),
    lines: order.lines
      .filter((line) => outstandingOf(line) > 0)
      .map((line) => ({ itemId: line.itemId, outstanding: outstandingOf(line), quantity: String(outstandingOf(line)) })),
  };
}

export function toReceiveInput(values: ReceiveValues): ReceiveInput {
  return {
    receivedOn: values.receivedOn,
    lines: values.lines
      .filter((line) => Number(line.quantity) > 0)
      .map((line) => ({ itemId: line.itemId, quantity: Number(line.quantity) })),
  };
}
