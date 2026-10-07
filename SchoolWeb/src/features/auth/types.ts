export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  mustChangePassword: boolean;
  /** Phase 5: TOTP two-step sign-in state (absent on older APIs). */
  twoFactorEnabled?: boolean;
  twoFactorRequired?: boolean;
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

/** GET /me children (PARENT): students with a VERIFIED guardian link. */
export interface ChildSummary {
  id: string;
  name: string;
  admissionNo?: string | null;
  photoUrl?: string | null;
  className?: string | null;
  sectionName?: string | null;
  branchName?: string | null;
  sessionName?: string | null;
}

/** GET /me */
export interface Session {
  user: SessionUser;
  activeRole: string;
  roles: string[];
  permissions: string[];
  assignments: Assignment[];
  children: ChildSummary[];
  /** Phase 5 policy: web sign-out after this many idle minutes (absent on older APIs). */
  sessionTimeoutMinutes?: number;
}

/** What the BFF returns to the browser (the refresh token stays in an httpOnly cookie). */
export interface WebTokens {
  accessToken: string;
  accessExpiresIn: number;
  mustChangePassword: boolean;
}

/** Login answer when the account has two-factor sign-in on. */
export interface TwoFactorChallenge {
  twoFactorRequired: true;
  challengeId: string;
}

export type LoginResult = WebTokens | TwoFactorChallenge;

export function isTwoFactorChallenge(result: LoginResult): result is TwoFactorChallenge {
  return "twoFactorRequired" in result && result.twoFactorRequired === true;
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
