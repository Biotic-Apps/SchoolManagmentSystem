import { z } from "zod";
import { wholeNumberText } from "@/lib/validation";
import type { SaleInput } from "./types";

const saleLine = z.object({
  itemId: z.string().min(1, "Choose an item"),
  quantity: wholeNumberText("the quantity", { min: 1 }),
});

export const saleSchema = z.object({
  studentId: z.string().min(1, "Choose a student"),
  lines: z
    .array(saleLine)
    .min(1, "Add at least one item")
    .refine((lines) => new Set(lines.map((line) => line.itemId)).size === lines.length, {
      message: "Each item can appear only once",
    }),
});
export type SaleValues = z.infer<typeof saleSchema>;

export const blankSaleLine = { itemId: "", quantity: "1" };

export const saleDefaults: SaleValues = { studentId: "", lines: [blankSaleLine] };

export function toSaleInput(values: SaleValues): SaleInput {
  return {
    studentId: values.studentId,
    lines: values.lines.map((line) => ({ itemId: line.itemId, quantity: Number(line.quantity) })),
  };
}
