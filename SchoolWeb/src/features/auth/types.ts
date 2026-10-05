export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  mustChangePassword: boolean;
}

export type ScopeType = "GLOBAL" | "SCHOOL" | "BRANCH" | "SECTION" | "SUBJECT_SECTION" | "SELF" | "GUARDIAN";

export interface Assignment {
  id: string;
  role: string;
  roleName: string;
  scopeType: ScopeType;
  schoolId: string | null;
  schoolName: string | null;
  branchId: string | null;
  branchName: string | null;
  validUntil: string | null;
}

export interface ChildSummary {
  id: string;
  name: string;
  className?: string | null;
  sectionName?: string | null;
  branchName?: string | null;
}

/** GET /me */
export interface Session {
  user: SessionUser;
  activeRole: string;
  roles: string[];
  permissions: string[];
  assignments: Assignment[];
  children: ChildSummary[];
}

/** What the BFF returns to the browser (the refresh token stays in an httpOnly cookie). */
export interface WebTokens {
  accessToken: string;
  accessExpiresIn: number;
  mustChangePassword: boolean;
}

export type AuthStatus = "loading" | "anonymous" | "password-change" | "authenticated";

export type SignOutReason = "signed-out" | "expired" | "idle";

export interface DeviceSession {
  id: string;
  deviceName: string | null;
  platform: "WEB" | "ANDROID";
  ip: string | null;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
}
