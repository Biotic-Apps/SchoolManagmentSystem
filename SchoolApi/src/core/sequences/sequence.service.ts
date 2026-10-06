import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';

/**
 * Gap-free human numbers (admission, application, receipt...). The upsert
 * row-locks the counter, so concurrent transactions queue on the same key.
 */
@Injectable()
export class SequenceService {
  async next(tx: Prisma.TransactionClient, scopeKey: string): Promise<number> {
    const rows = await tx.$queryRaw<{ value: bigint }[]>`
      INSERT INTO "sequences" ("scope_key", "next_value", "updated_at")
      VALUES (${scopeKey}, 2, now())
      ON CONFLICT ("scope_key")
      DO UPDATE SET "next_value" = "sequences"."next_value" + 1, "updated_at" = now()
      RETURNING "next_value" - 1 AS value`;
    return Number(rows[0].value);
  }
}

/** `PREFIX-YEAR-0001`. */
export function formatNumber(
  prefix: string,
  year: number,
  seq: number,
): string {
  return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
}
