import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../../core/audit/audit.service';
import type { AuthUser } from '../../../../core/common/types/auth-user';
import { QUEUES } from '../../../../core/jobs/queues';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import type { Scope } from '../../../../core/rbac/scope/scope';
import { AsyncTaskService } from '../../../tasks/async-task.service';
import type {
  StaffIdCardPrintDto,
  StaffIdCardPrintJobDto,
} from './staff-id-card-bulk.dto';
import {
  STAFF_ID_CARD_SHEET_JOB,
  MAX_STAFF_SHEET_CARDS,
  type StaffIdCardSheetInput,
} from './staff-id-card-bulk-job';

/** POST /staff/id-cards/print: ID cards of a branch on A4 sheets. */
@Injectable()
export class StaffIdCardBulkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: AsyncTaskService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    dto: StaffIdCardPrintDto,
  ): Promise<StaffIdCardPrintJobDto> {
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: dto.branchId },
      select: { id: true, schoolId: true },
    });
    scope.assertManageBranch(branch);
    const where: Record<string, unknown> = {
      branchId: dto.branchId,
      status: 'ACTIVE',
    };
    if (dto.designation) where.designation = dto.designation;
    const staffList = await this.prisma.staff.findMany({
      where,
      select: { id: true, schoolId: true },
      orderBy: { name: 'asc' },
      take: MAX_STAFF_SHEET_CARDS,
    });
    const staffIds = staffList.map((s) => s.id);
    const schoolId = staffList[0]?.schoolId ?? branch.schoolId;
    const input: StaffIdCardSheetInput = {
      schoolId,
      requestedById: user.id,
      staffIds,
      baseName: `staff-id-cards-${dto.branchId.slice(0, 8)}`,
    };
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.DOCUMENTS,
      name: STAFF_ID_CARD_SHEET_JOB,
      data: input,
      params: { ...dto, count: staffIds.length },
      schoolId,
      branchId: dto.branchId,
      format: 'PDF',
    });
    this.audit.stage({
      action: 'staff.id_card_sheet',
      entityType: 'Branch',
      entityId: dto.branchId,
      schoolId,
      branchId: dto.branchId,
      after: { ...dto, count: staffIds.length, jobId },
    });
    return { jobId, count: staffIds.length };
  }
}
