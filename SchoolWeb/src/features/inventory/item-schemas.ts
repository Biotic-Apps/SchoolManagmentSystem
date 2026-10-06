import { z } from "zod";
import { moneyText, toMinor } from "@/lib/money";
import { requiredText, wholeNumberText } from "@/lib/validation";
import type { InventoryItemInput, ItemCategory } from "./types";

export const itemSchema = z
  .object({
    sku: requiredText("the SKU", 40),
    name: requiredText("the item name", 120),
    category: z.string().min(1, "Choose a category"),
    unit: requiredText("the unit", 20),
    reorderLevel: wholeNumberText("the reorder level"),
    isAsset: z.boolean(),
    saleable: z.boolean(),
    salePrice: moneyText("the sale price", { required: false }),
  })
  .refine((values) => !values.saleable || !!values.salePrice, {
    path: ["salePrice"],
    message: "Enter the sale price",
  });
export type ItemFormValues = z.infer<typeof itemSchema>;

export const itemDefaults: ItemFormValues = {
  sku: "",
  name: "",
  category: "",
  unit: "piece",
  reorderLevel: "0",
  isAsset: false,
  saleable: false,
  salePrice: "",
};

export function toItemInput(schoolId: string, values: ItemFormValues): InventoryItemInput {
  return {
    schoolId,
    sku: values.sku.trim().toUpperCase(),
    name: values.name.trim(),
    category: values.category as ItemCategory,
    unit: values.unit.trim(),
    reorderLevel: Number(values.reorderLevel),
    isAsset: values.isAsset,
    saleable: values.saleable,
    salePriceMinor: values.saleable ? (toMinor(values.salePrice) ?? undefined) : undefined,
  };
}
