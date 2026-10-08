import { z } from "zod";
import { blankToUndefined, optionalEmail, optionalPhone, passwordRule } from "@/lib/validation";
import { STAFF_ROLE_KEYS } from "./options";
import type { StaffAccountInput, StaffDetail, StaffRoleKey } from "./types";

export const staffAccountSchema = z
  .object({
    email: optionalEmail,
    phone: optionalPhone,
    roleKey: z.string().min(1, "Choose the account role"),
    setPassword: z.boolean(),
    password: z.string(),
  })
  .refine((v) => !!v.email.trim() || !!v.phone.trim(), {
    path: ["email"],
    message: "Enter an email or a phone number to sign in with",
  })
  .superRefine((v, ctx) => {
    if (!v.setPassword) return;
    const result = passwordRule.safeParse(v.password);
    if (!result.success) ctx.addIssue({ code: "custom", path: ["password"], message: result.error.issues[0].message });
  });

export type StaffAccountValues = z.infer<typeof staffAccountSchema>;

/** Same default as the API: the designation's role, else Teacher. */
export function defaultRoleFor(designation: string): StaffRoleKey {
  return STAFF_ROLE_KEYS.find((key) => key === designation) ?? "TEACHER";
}

export function staffAccountDefaults(staff: StaffDetail): StaffAccountValues {
  return {
    email: staff.email ?? "",
    phone: staff.phone ?? "",
    roleKey: defaultRoleFor(staff.designation),
    setPassword: false,
    password: "",
  };
}

export function toStaffAccountInput(values: StaffAccountValues): StaffAccountInput {
  return {
    email: blankToUndefined(values.email),
    phone: blankToUndefined(values.phone),
    roleKey: values.roleKey as StaffRoleKey,
    ...(values.setPassword ? { password: values.password } : {}),
  };
}
