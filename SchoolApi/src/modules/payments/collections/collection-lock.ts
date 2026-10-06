import type { Prisma } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';

/**
 * Serialises cash payments of a branch day with its closing, so a closing
 * never misses a cash payment that was committing at the same moment.
 */
export async function lockCollectionDay(
  tx: Prisma.TransactionClient,
  branchId: string,
  date: Date,
): Promise<void> {
  const key = `collection:${branchId}:${formatDate(date)}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
}
