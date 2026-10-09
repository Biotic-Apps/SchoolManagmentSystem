import type { Prisma } from '../../generated/prisma/client';
import type { Scope } from '../../core/rbac/scope/scope';

/**
 * Notices a user may list: published ones addressed to them, their own, and
 * (management) every notice of the schools/branches they manage, whatever the
 * audience, author or status. Global scope (super admin) sees all; it returns
 * no filter because Prisma treats `{}` inside OR as "match nothing".
 */
export function noticeReach(
  userId: string,
  scope: Scope,
): Prisma.NoticeWhereInput {
  if (scope.global) return {};
  const reach: Prisma.NoticeWhereInput[] = [
    { status: 'PUBLISHED', recipients: { some: { userId } } },
    { authorId: userId },
  ];
  if (!scope.guardian && (scope.schoolIds.size || scope.branchIds.size))
    reach.push(scope.managedBranchFilter());
  return { OR: reach };
}

export interface NoticeListFilter {
  /** Branch view: the branch's notices plus school-level ones of its school. */
  branchId?: string;
  /** School of `branchId`. */
  schoolId?: string;
  status?: Prisma.NoticeWhereInput['status'];
}

/** List filter: reach AND the branch view AND the status. */
export function noticeListWhere(
  userId: string,
  scope: Scope,
  filter: NoticeListFilter,
): Prisma.NoticeWhereInput {
  const and: Prisma.NoticeWhereInput[] = [];
  const reach = noticeReach(userId, scope);
  if (reach.OR) and.push(reach);
  if (filter.branchId) {
    const branch: Prisma.NoticeWhereInput[] = [{ branchId: filter.branchId }];
    if (filter.schoolId)
      branch.push({ branchId: null, schoolId: filter.schoolId });
    and.push({ OR: branch });
  }
  return { ...(and.length ? { AND: and } : {}), status: filter.status };
}
