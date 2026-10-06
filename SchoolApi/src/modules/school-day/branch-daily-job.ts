import { Injectable } from '@nestjs/common';
import { isPrismaKnownError } from '../../core/common/errors/prisma-error.mapper';
import { PrismaService } from '../../core/prisma/prisma.service';
import { localTime } from './clock';

/**
 * Once-a-day work per branch at a branch-configured time: the job runs every
 * few minutes and claims the (branch, job, date) mark once the time passed.
 */
@Injectable()
export class BranchDailyJob {
  constructor(private readonly prisma: PrismaService) {}

  async claim(
    branchId: string,
    job: string,
    date: Date,
    at: string,
    now = new Date(),
  ): Promise<boolean> {
    if (localTime(now) < at) return false;
    try {
      await this.prisma.branchJobMark.create({ data: { branchId, job, date } });
      return true;
    } catch (error) {
      if (isPrismaKnownError(error) && error.code === 'P2002') return false;
      throw error;
    }
  }

  activeBranches() {
    return this.prisma.branch.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, schoolId: true, principalUserId: true },
    });
  }
}
