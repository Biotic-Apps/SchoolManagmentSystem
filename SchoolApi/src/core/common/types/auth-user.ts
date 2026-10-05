import type { ActiveAssignment } from '../../rbac/access/active-assignment';

export interface AuthUser {
  id: string;
  sessionId: string;
  tokenVersion: number;
  activeRole: string;
  roles: string[];
  permissions: ReadonlySet<string>;
  /** Assignments of the active role only, valid right now. */
  assignments: ActiveAssignment[];
}

export interface AuthenticatedRequest {
  user?: AuthUser;
  headers: Record<string, string | string[] | undefined>;
}
