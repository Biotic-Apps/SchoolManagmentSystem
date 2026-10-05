import { z } from "zod";
import {
  blankToNull,
  blankToUndefined,
  optionalEmail,
  optionalIsoDate,
  optionalPhone,
  passwordRule,
  requiredText,
} from "@/lib/validation";
import type { AssignmentInput, CreateUserInput, UpdateUserInput, UserDetail } from "./types";

export const assignmentSchema = z
  .object({
    roleKey: z.string().min(1, "Pick a role"),
    scopeType: z.enum(["GLOBAL", "SCHOOL", "BRANCH"]),
    schoolId: z.string(),
    branchId: z.string(),
    validUntil: optionalIsoDate,
  })
  .refine((row) => row.scopeType !== "SCHOOL" || !!row.schoolId, { path: ["schoolId"], message: "Pick a school" })
  .refine((row) => row.scopeType !== "BRANCH" || !!row.branchId, { path: ["branchId"], message: "Pick a branch" });

export type AssignmentRow = z.infer<typeof assignmentSchema>;

export const EMPTY_ASSIGNMENT: AssignmentRow = { roleKey: "", scopeType: "BRANCH", schoolId: "", branchId: "", validUntil: "" };

const contactFields = {
  name: requiredText("the full name"),
  email: optionalEmail,
  phone: optionalPhone,
};

const hasContact = (values: { email: string; phone: string }) => !!values.email.trim() || !!values.phone.trim();
const CONTACT_RULE = { path: ["email"], message: "Enter an email or a phone number" };

export const createUserSchema = z
  .object({
    ...contactFields,
    password: z.string().refine((value) => !value || passwordRule.safeParse(value).success, {
      message: "At least 8 characters with a letter and a digit",
    }),
    assignments: z.array(assignmentSchema).min(1, "Add at least one role"),
  })
  .refine(hasContact, CONTACT_RULE);

export type CreateUserValues = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object(contactFields).refine(hasContact, CONTACT_RULE);

export type EditUserValues = z.infer<typeof editUserSchema>;

export const addAssignmentSchema = z.object({ assignment: assignmentSchema });

export type AddAssignmentValues = z.infer<typeof addAssignmentSchema>;

export function toAssignmentInput(row: AssignmentRow): AssignmentInput {
  return {
    roleKey: row.roleKey,
    scopeType: row.scopeType,
    ...(row.scopeType === "SCHOOL" ? { schoolId: row.schoolId } : {}),
    ...(row.scopeType === "BRANCH" ? { branchId: row.branchId } : {}),
    ...(row.validUntil ? { validUntil: row.validUntil } : {}),
  };
}

export function toCreateUserInput(values: CreateUserValues): CreateUserInput {
  return {
    name: values.name.trim(),
    email: blankToUndefined(values.email),
    phone: blankToUndefined(values.phone),
    password: values.password || undefined,
    assignments: values.assignments.map(toAssignmentInput),
  };
}

export function editUserDefaults(user: UserDetail | { name: string; email: string | null; phone: string | null }): EditUserValues {
  return { name: user.name, email: user.email ?? "", phone: user.phone ?? "" };
}

export function toUpdateUserInput(values: EditUserValues): UpdateUserInput {
  return { name: values.name.trim(), email: blankToNull(values.email), phone: blankToNull(values.phone) };
}
