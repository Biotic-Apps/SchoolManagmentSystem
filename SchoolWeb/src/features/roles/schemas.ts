import { z } from "zod";
import { requiredText } from "@/lib/validation";
import type { Role, RoleInput } from "./types";

export const roleSchema = z.object({
  name: requiredText("the role name", 80),
  schoolId: z.string(),
  permissions: z.array(z.string()).min(1, "Pick at least one permission"),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

/** What the current user may change on this role (system roles are restricted). */
export interface RoleEditRights {
  name: boolean;
  permissions: boolean;
}

export function roleFormDefaults(role: Role | null): RoleFormValues {
  return {
    name: role?.name ?? "",
    schoolId: role?.schoolId ?? "",
    permissions: role?.permissions ?? [],
  };
}

export function toRoleInput(values: RoleFormValues, role: Role | null, rights: RoleEditRights): RoleInput {
  if (!role) {
    return {
      name: values.name.trim(),
      ...(values.schoolId ? { schoolId: values.schoolId } : {}),
      permissions: values.permissions,
    };
  }
  return {
    ...(rights.name ? { name: values.name.trim() } : {}),
    ...(rights.permissions ? { permissions: values.permissions } : {}),
  };
}

/** Preview of the server-generated key: CUSTOM_<slug>. */
export function customRoleKeyPreview(name: string): string {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `CUSTOM_${slug || "…"}`;
}
