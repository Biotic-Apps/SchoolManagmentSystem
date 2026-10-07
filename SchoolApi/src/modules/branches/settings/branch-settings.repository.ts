import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { toJson } from '../../../core/common/prisma-json';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class BranchSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async load(branchId: string): Promise<Record<string, unknown>> {
    const rows = await this.prisma.branchSetting.findMany({
      where: { branchId },
    });
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }

  /** Upserts every value; pass `tx` to join a caller's transaction. */
  async save(
    branchId: string,
    values: Record<string, unknown>,
    actorId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const upsert = (
      db: Prisma.TransactionClient,
      key: string,
      value: unknown,
    ) =>
      db.branchSetting.upsert({
        where: { branchId_key: { branchId, key } },
        create: { branchId, key, value: toJson(value), updatedById: actorId },
        update: { value: toJson(value), updatedById: actorId },
      });
    const entries = Object.entries(values);
    if (tx) {
      for (const [key, value] of entries) await upsert(tx, key, value);
      return;
    }
    await this.prisma.$transaction(
      entries.map(([key, value]) => upsert(this.prisma, key, value)),
    );
  }
}
