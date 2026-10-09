import { Injectable } from '@nestjs/common';
import { invalid, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AsyncTaskService } from '../../tasks/async-task.service';
import { FeeAccessService } from '../shared/fee-access.service';
import {
  batchWhere,
  PRINT_CHALLANS_JOB,
  type PrintChallansInput,
} from './challan-batch';
import type {
  PrintChallansDto,
  PrintChallansJobDto,
} from './dto/print-challans.dto';

/** `POST /invoices/challans/print`: validates the filter and queues one PDF. */
@Injectable()
export class ChallanBatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FeeAccessService,
    private readonly tasks: AsyncTaskService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    dto: PrintChallansDto,
  ): Promise<PrintChallansJobDto> {
    const branch = await this.access.readBranch(scope, dto.branchId);
    const classId = dto.classId ?? null;
    const sectionId = dto.sectionId ?? null;
    if (sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: sectionId },
        select: { branchId: true, classId: true },
      });
      if (!section || section.branchId !== branch.id) throw notFound('Section');
      if (classId && section.classId !== classId)
        throw invalid('sectionId is not a section of classId');
    }
    const input: PrintChallansInput = {
      schoolId: branch.schoolId,
      branchId: branch.id,
      period: dto.period,
      classId,
      sectionId,
      requestedById: user.id,
    };
    const count = await this.prisma.invoice.count({ where: batchWhere(input) });
    if (count === 0)
      throw invalid('No unpaid issued invoices match this month and class');
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.DOCUMENTS,
      name: PRINT_CHALLANS_JOB,
      data: input,
      schoolId: branch.schoolId,
      branchId: branch.id,
    });
    return { jobId, count };
  }
}
