import { z } from "zod";
import { blankToNull, optionalEmail, optionalPhone, optionalText, requiredText } from "@/lib/validation";
import { checkBranchTimings } from "./timing-rules";
import { branchTimingDefaults, branchTimingFields, toTimingsInput } from "./timings-schema";
import type { Branch, BranchInput } from "./types";

export const branchSchema = z
  .object({
    schoolId: z.string().min(1, "Pick a school"),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2,12}$/, "Use 2–12 uppercase letters or digits"),
    name: requiredText("the branch name"),
    address: optionalText(),
    phone: optionalPhone,
    email: optionalEmail,
    ...branchTimingFields,
  })
  .superRefine(checkBranchTimings);

export type BranchFormValues = z.infer<typeof branchSchema>;

export function branchFormDefaults(branch: Branch | null, schoolId: string | null): BranchFormValues {
  return {
    schoolId: branch?.schoolId ?? schoolId ?? "",
    code: branch?.code ?? "",
    name: branch?.name ?? "",
    address: branch?.address ?? "",
    phone: branch?.phone ?? "",
    email: branch?.email ?? "",
    ...branchTimingDefaults(branch),
  };
}

export function toBranchInput(values: BranchFormValues, isEdit: boolean): BranchInput {
  return {
    ...(isEdit ? {} : { schoolId: values.schoolId, code: values.code }),
    name: values.name.trim(),
    address: blankToNull(values.address),
    phone: blankToNull(values.phone),
    email: blankToNull(values.email),
    ...toTimingsInput(values),
  };
}
