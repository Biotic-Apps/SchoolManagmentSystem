import { z } from "zod";

export const siblingDiscountSchema = z.object({
  childIndex: z.coerce.number().int().min(2, "Must be 2 or higher").max(20),
  percentOff: z.coerce.number().int().min(1, "At least 1%").max(100, "At most 100%"),
});

export type SiblingDiscountFormValues = z.infer<typeof siblingDiscountSchema>;

export const SIBLING_DISCOUNT_DEFAULTS: SiblingDiscountFormValues = {
  childIndex: 2,
  percentOff: 10,
};
