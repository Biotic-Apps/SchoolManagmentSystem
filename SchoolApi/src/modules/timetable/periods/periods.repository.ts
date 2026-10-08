import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { BellRow, BellRowInput } from './bell-schedule';

const ROW_SELECT = {
  day: true,
  index: true,
  startTime: true,
  endTime: true,
  isBreak: true,
  label: true,
} satisfies Prisma.BranchPeriodSelect;

/** branch_periods reads/writes (one row per day × index). */
@Injectable()
export class PeriodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  rows(branchId: string): Promise<BellRow[]> {
    return this.prisma.branchPeriod.findMany({
      where: { branchId },
      select: ROW_SELECT,
      orderBy: [{ day: 'asc' }, { index: 'asc' }],
    });
  }

  rowsOfBranches(branchIds: string[]) {
    return this.prisma.branchPeriod.findMany({
      where: { branchId: { in: branchIds } },
      select: { ...ROW_SELECT, branchId: true },
    });
  }

  /** Replaces the rows of the given days (all other days are kept unless `onlyDays` is false). */
  async write(
    tx: Prisma.TransactionClient,
    branch: { id: string; schoolId: string },
    days: Map<number, BellRowInput[]>,
    replaceAll: boolean,
  ): Promise<void> {
    await tx.branchPeriod.deleteMany({
      where: {
        branchId: branch.id,
        ...(replaceAll ? {} : { day: { in: [...days.keys()] } }),
      },
    });
    await tx.branchPeriod.createMany({
      data: [...days.entries()].flatMap(([day, rows]) =>
        rows.map((p) => ({
          schoolId: branch.schoolId,
          branchId: branch.id,
          day,
          index: p.index,
          startTime: p.startTime,
          endTime: p.endTime,
          isBreak: p.isBreak,
          label: p.isBreak ? p.label?.trim() || 'Break' : null,
        })),
      ),
    });
  }
}
