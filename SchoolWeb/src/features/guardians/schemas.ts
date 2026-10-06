import { z } from "zod";
import { guardianDefaults, guardianSchema, toGuardianInput, type GuardianValues } from "@/features/people/schemas";
import type { GuardianInput, Relation } from "@/features/people/types";
import type { Guardian, LinkGuardianInput } from "./types";

export const editGuardianSchema = z.object({ guardian: guardianSchema });
export type EditGuardianValues = z.infer<typeof editGuardianSchema>;

// CNIC starts blank (it comes masked); blankToUndefined in toGuardianInput leaves it unchanged.
export const editGuardianDefaults = (guardian: Guardian): EditGuardianValues => ({ guardian: guardianDefaults(guardian) });

export const toGuardianUpdate = (values: EditGuardianValues): Partial<GuardianInput> => toGuardianInput(values.guardian);

export const linkChildSchema = z.object({
  studentId: z.string().min(1, "Pick a student"),
  relation: z.string().min(1, "Choose the relation"),
  isPrimary: z.boolean(),
});
export type LinkChildValues = z.infer<typeof linkChildSchema>;

export const LINK_CHILD_DEFAULTS: LinkChildValues = { studentId: "", relation: "", isPrimary: false };

const newGuardianSchema = guardianSchema.omit({ relation: true });
const blankGuardian = z.object({
  name: z.string(),
  cnic: z.string(),
  phone: z.string(),
  email: z.string(),
  occupation: z.string(),
  address: z.string(),
});

export const addGuardianSchema = z
  .object({
    mode: z.enum(["existing", "new"]),
    guardianId: z.string(),
    guardian: blankGuardian,
    relation: z.string().min(1, "Choose the relation"),
    isPrimary: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "existing") {
      if (!values.guardianId) ctx.addIssue({ code: "custom", path: ["guardianId"], message: "Pick a guardian" });
      return;
    }
    const parsed = newGuardianSchema.safeParse(values.guardian);
    parsed.error?.issues.forEach((issue) => ctx.addIssue({ ...issue, path: ["guardian", ...issue.path] }));
  });
export type AddGuardianValues = z.infer<typeof addGuardianSchema>;

const EMPTY_NEW_GUARDIAN = { name: "", cnic: "", phone: "", email: "", occupation: "", address: "" };

export const ADD_GUARDIAN_DEFAULTS: AddGuardianValues = {
  mode: "existing",
  guardianId: "",
  guardian: EMPTY_NEW_GUARDIAN,
  relation: "",
  isPrimary: false,
};

export function toLinkGuardianInput(values: AddGuardianValues): LinkGuardianInput {
  const relation = values.relation as Relation;
  const link = { relation, isPrimary: values.isPrimary };
  if (values.mode === "existing") return { ...link, guardianId: values.guardianId };
  const guardian: GuardianValues = { ...values.guardian, relation };
  return { ...link, guardian: toGuardianInput(guardian) };
}
