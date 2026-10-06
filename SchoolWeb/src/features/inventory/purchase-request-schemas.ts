import { z } from "zod";
import { moneyText, toMinor } from "@/lib/money";
import { requiredText, wholeNumberText } from "@/lib/validation";
import type { PurchaseRequestInput } from "./types";

const requestLine = z.object({
  itemId: z.string().min(1, "Choose an item"),
  quantity: wholeNumberText("the quantity", { min: 1 }),
  estimatedUnit: moneyText("the unit price"),
});

export const purchaseRequestSchema = z.object({
  lines: z
    .array(requestLine)
    .min(1, "Add at least one item")
    .refine((lines) => new Set(lines.map((line) => line.itemId)).size === lines.length, {
      message: "Each item can appear only once",
    }),
  reason: requiredText("the reason", 500),
});
export type PurchaseRequestValues = z.infer<typeof purchaseRequestSchema>;
export type RequestLineValues = z.infer<typeof requestLine>;

export const blankRequestLine: RequestLineValues = { itemId: "", quantity: "1", estimatedUnit: "" };

export const purchaseRequestDefaults: PurchaseRequestValues = { lines: [blankRequestLine], reason: "" };

export function lineTotalMinor(line: Partial<RequestLineValues> | undefined): number {
  const quantity = Number(line?.quantity);
  const unit = toMinor(line?.estimatedUnit);
  return Number.isFinite(quantity) && unit !== null ? quantity * unit : 0;
}

export function toPurchaseRequestInput(branchId: string, values: PurchaseRequestValues): PurchaseRequestInput {
  return {
    branchId,
    reason: values.reason.trim(),
    lines: values.lines.map((line) => ({
      itemId: line.itemId,
      quantity: Number(line.quantity),
      estimatedUnitMinor: toMinor(line.estimatedUnit) ?? 0,
    })),
  };
}
