import type { Assignment, ScopeType } from "@/features/auth/types";

export type UserStatus = "ACTIVE" | "DISABLED";

export interface UserSummary {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  roles: string[];
  branchNames: string[];
  lastLoginAt: string | null;
  /** Phase 5: set while the account is locked after failed sign-ins (absent on older APIs). */
  lockedUntil?: string | null;
}

export interface UserDetail extends UserSummary {
  assignments: Assignment[];
  mustChangePassword: boolean;
  createdAt: string;
}

export interface AssignmentInput {
  roleKey: string;
  scopeType: ScopeType;
  schoolId?: string;
  branchId?: string;
  sectionId?: string;
  subjectId?: string;
  validUntil?: string;
}

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  assignments: AssignmentInput[];
}

export interface UpdateUserInput {
  name: string;
  email: string | null;
  phone: string | null;
}

/** POST /users returns the temporary password once when no password was given. */
export type CreatedUser = UserDetail & { temporaryPassword?: string };
