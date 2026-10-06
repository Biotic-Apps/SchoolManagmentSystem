import { z } from "zod";
import { blankToUndefined, optionalText } from "@/lib/validation";
import type { MovementInput, MovementType } from "./types";

const WHOLE = /^\d+$/;
const SIGNED = /^-?\d+$/;

export const movementSchema = z
  .object({
    itemId: z.string().min(1, "Choose an item"),
    type: z.string().min(1, "Choose a movement type"),
    quantity: z.string().trim(),
    toBranchId: z.string(),
    issuedTo: optionalText(120),
    reason: optionalText(500),
  })
  .superRefine((values, ctx) => {
    const adjust = values.type === "ADJUST";
    const valid = adjust ? SIGNED.test(values.quantity) : WHOLE.test(values.quantity);
    if (!valid || Number(values.quantity) === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: adjust ? "Enter a whole number other than 0, e.g. 5 or -3" : "Enter a whole number of at least 1",
      });
    }
    if (values.type === "TRANSFER_OUT" && !values.toBranchId) {
      ctx.addIssue({ code: "custom", path: ["toBranchId"], message: "Choose the receiving branch" });
    }
    if (adjust && !values.reason) {
      ctx.addIssue({ code: "custom", path: ["reason"], message: "Give a reason for the adjustment" });
    }
  });
export type MovementFormValues = z.infer<typeof movementSchema>;

export const movementDefaults: MovementFormValues = {
  itemId: "",
  type: "IN",
  quantity: "",
  toBranchId: "",
  issuedTo: "",
  reason: "",
};

export function toMovementInput(branchId: string, values: MovementFormValues): MovementInput {
  const type = values.type as MovementType;
  return {
    branchId,
    itemId: values.itemId,
    type,
    quantity: Number(values.quantity),
    toBranchId: type === "TRANSFER_OUT" ? values.toBranchId : undefined,
    issuedTo: type === "ISSUE" ? blankToUndefined(values.issuedTo) : undefined,
    reason: blankToUndefined(values.reason),
  };
}
