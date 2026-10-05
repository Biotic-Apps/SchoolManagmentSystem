import type { Prisma } from '../../generated/prisma/client';

/** Assignment rows that are in force right now. */
export function activeAssignmentWhere(
  now = new Date(),
): Prisma.RoleAssignmentWhereInput {
  return {
    revokedAt: null,
    validFrom: { lte: now },
    OR: [{ validUntil: null }, { validUntil: { gt: now } }],
  };
}
