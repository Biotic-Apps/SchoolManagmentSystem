import type { ComplaintCategory } from '../../generated/prisma/client';
import { RoleKey } from '../../core/rbac/role-key.enum';

/** People a complaint may be routed to, resolved from the complaint's branch. */
export interface RoutingCandidates {
  classTeacherUserId: string | null;
  coordinatorUserIds: string[];
  principalUserId: string | null;
  superAdminUserIds: string[];
}

export interface RoutingInput {
  complainantId: string;
  complainantRole: string;
  category: ComplaintCategory;
  againstUserId: string | null;
  candidates: RoutingCandidates;
}

const STAFF_ROLES: string[] = [
  RoleKey.TEACHER,
  RoleKey.HELPER,
  RoleKey.ACCOUNTANT,
];
const LEADER_ROLES: string[] = [RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER];

/** Ordered candidate list for a new complaint (first eligible wins). */
export function routingChain(input: RoutingInput): (string | null)[] {
  const c = input.candidates;
  const top = [c.principalUserId, ...c.superAdminUserIds];
  const role = input.complainantRole;
  if (role === String(RoleKey.PARENT)) {
    return input.category === 'ACADEMIC'
      ? [c.classTeacherUserId, ...c.coordinatorUserIds, ...top]
      : top;
  }
  if (STAFF_ROLES.includes(role)) return [...c.coordinatorUserIds, ...top];
  if (LEADER_ROLES.includes(role)) return top;
  return c.superAdminUserIds;
}

/** Escalation level 1 goes to the principal, level 2+ to a super admin. */
export function escalationChain(
  level: number,
  candidates: RoutingCandidates,
): (string | null)[] {
  return level <= 1
    ? [candidates.principalUserId, ...candidates.superAdminUserIds]
    : candidates.superAdminUserIds;
}

/** First candidate that is neither the complainant nor the person complained about. */
export function pickAssignee(
  chain: (string | null)[],
  exclude: { complainantId: string; againstUserId: string | null },
): string | null {
  for (const userId of chain) {
    if (!userId) continue;
    if (userId === exclude.complainantId) continue;
    if (userId === exclude.againstUserId) continue;
    return userId;
  }
  return null;
}

export function routeComplaint(input: RoutingInput): string | null {
  return pickAssignee(routingChain(input), input);
}
