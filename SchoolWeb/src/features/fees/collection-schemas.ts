import { z } from "zod";
import { moneyText, toMinor } from "@/lib/money";
import { blankToUndefined, optionalText } from "@/lib/validation";
import type { CloseDayInput } from "./collections-api";

export const closeDaySchema = z.object({
  cashCounted: moneyText("the cash counted", { allowZero: true }),
  note: optionalText(500),
});
export type CloseDayValues = z.infer<typeof closeDaySchema>;

export const closeDayDefaults: CloseDayValues = { cashCounted: "", note: "" };

export function toCloseDayInput(branchId: string, date: string, values: CloseDayValues): CloseDayInput {
  return { branchId, date, cashCountedMinor: toMinor(values.cashCounted) ?? 0, note: blankToUndefined(values.note) };
}
