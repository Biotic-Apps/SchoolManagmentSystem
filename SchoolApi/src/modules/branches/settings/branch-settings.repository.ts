import { Injectable } from '@nestjs/common';
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

  async save(
    branchId: string,
    values: Record<string, unknown>,
    actorId: string,
  ): Promise<void> {
    await this.prisma.$transaction(
      Object.entries(values).map(([key, value]) =>
        this.prisma.branchSetting.upsert({
          where: { branchId_key: { branchId, key } },
          create: { branchId, key, value: toJson(value), updatedById: actorId },
          update: { value: toJson(value), updatedById: actorId },
        }),
      ),
    );
  }
}
