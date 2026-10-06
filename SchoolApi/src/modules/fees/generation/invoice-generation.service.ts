import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { invalid, notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { assertPeriod, periodOf } from '../../finance-core/period';
import { AsyncTaskService } from '../../tasks/async-task.service';
import type { GenerateInvoicesDto } from '../invoices/dto/invoice-input.dto';
import type { InvoiceJobDto } from '../invoices/dto/invoice.dto';
import { FeeAccessService } from '../shared/fee-access.service';
import { GENERATE_INVOICES_JOB } from './generate-invoices.processor';
import type { GenerateInvoicesInput } from './generation-context.service';

/** Validates a generation request and queues it (`GET /jobs/:id`). */
@Injectable()
export class InvoiceGenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FeeAccessService,
    private readonly tasks: AsyncTaskService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    dto: GenerateInvoicesDto,
  ): Promise<InvoiceJobDto> {
    const branch = await this.access.manageBranch(scope, dto.branchId);
    const period = assertPeriod(dto.period);
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.branchId !== branch.id)
      throw notFound('Academic session');
    if (
      period < periodOf(session.startDate) ||
      period > periodOf(session.endDate)
    )
      throw invalid('period is outside the session');
    const classIds = dto.classIds?.length ? [...new Set(dto.classIds)] : null;
    if (classIds) {
      const found = await this.prisma.schoolClass.count({
        where: { id: { in: classIds }, schoolId: branch.schoolId },
      });
      if (found !== classIds.length) throw invalid('Unknown classIds');
    }
    const data: GenerateInvoicesInput = {
      branchId: branch.id,
      sessionId: session.id,
      period,
      classIds,
      actorId: user.id,
    };
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.REPORTS,
      name: GENERATE_INVOICES_JOB,
      data,
      schoolId: branch.schoolId,
      branchId: branch.id,
    });
    this.audit.stage({
      action: 'invoice.generate_request',
      entityType: 'Branch',
      entityId: branch.id,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after: { sessionId: session.id, period, classIds, jobId },
    });
    return { jobId };
  }
}
