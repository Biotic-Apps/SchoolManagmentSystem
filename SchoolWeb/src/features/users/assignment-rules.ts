import type { Option } from "@/components/shared/OptionSelect";
import { ROLE_KEYS, roleLabel } from "@/config/roles";
import type { ScopeType } from "@/features/auth/types";

/** Scope types the admin assignment builder offers (section/subject scopes arrive with staff in Phase 2). */
export type BuilderScope = Extract<ScopeType, "GLOBAL" | "SCHOOL" | "BRANCH">;

const SCOPE_LABELS: Record<BuilderScope, string> = {
  GLOBAL: "Whole system",
  SCHOOL: "One school (all branches)",
  BRANCH: "One branch",
};

// Only SUPER_ADMIN grants SUPER_ADMIN/PRINCIPAL (contract §6); parents are linked through admissions.
const RESTRICTED_ROLES = new Set(["SUPER_ADMIN", "PRINCIPAL"]);
const NOT_ASSIGNABLE = new Set(["PARENT"]);

export function assignableRoleOptions(activeRole: string, customRoles: Option[]): Option[] {
  const system = ROLE_KEYS.filter((key) => !NOT_ASSIGNABLE.has(key))
    .filter((key) => activeRole === "SUPER_ADMIN" || !RESTRICTED_ROLES.has(key))
    .map((key) => ({ id: key, name: roleLabel(key) }));
  return [...system, ...customRoles];
}

export function scopesForRole(roleKey: string, activeRole: string): BuilderScope[] {
  if (roleKey === "SUPER_ADMIN") return ["GLOBAL"];
  return activeRole === "SUPER_ADMIN" ? ["BRANCH", "SCHOOL"] : ["BRANCH"];
}

export function scopeOptions(scopes: BuilderScope[]): Option[] {
  return scopes.map((scope) => ({ id: scope, name: SCOPE_LABELS[scope] }));
}

export function scopeLabel(scopeType: string, schoolName: string | null, branchName: string | null): string {
  if (scopeType === "GLOBAL") return SCOPE_LABELS.GLOBAL;
  if (scopeType === "SCHOOL") return schoolName ?? "School";
  if (scopeType === "BRANCH") return [schoolName, branchName].filter(Boolean).join(" › ") || "Branch";
  return [scopeType.toLowerCase().replace(/_/g, " "), branchName].filter(Boolean).join(" · ");
}
