import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { ApprovalRouting } from '../../finance-core/approval-routing';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import {
  applyConcessions,
  concessionTotal,
} from '../generation/concession-math';
import { GenerationContextService } from '../generation/generation-context.service';
import {
  FeeAccessService,
  type FeeStudent,
} from '../shared/fee-access.service';
import { ConcessionReader } from './concession-reader.service';
import type { ConcessionDto, CreateConcessionDto } from './dto/concession.dto';

/**
 * Concession requests → CONCESSION approval (amount-limited escalation on the
 * monthly estimate). Approved concessions only affect invoices generated later.
 */
@Injectable()
export class ConcessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FeeAccessService,
    private readonly context: GenerationContextService,
    private readonly routing: ApprovalRouting,
    private readonly approvals: ApprovalService,
    private readonly reader: ConcessionReader,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateConcessionDto,
  ): Promise<ConcessionDto> {
    const student = await this.access.manageStudent(scope, dto.studentId);
    if (!student.active) throw conflict('Student has no active enrollment');
    if (dto.type === 'PERCENT' && dto.value > 100)
      throw invalid('A percent concession is 1–100');
    if (dto.to && dto.to < dto.from)
      throw invalid('to must not be before from');
    const feeHeadId = dto.feeHeadId ?? null;
    if (feeHeadId) {
      const head = await this.prisma.feeHead.findFirst({
        where: { id: feeHeadId, schoolId: student.schoolId, system: false },
      });
      if (!head) throw invalid('Unknown fee head');
    }
    await this.assertNoOverlap(student.studentId, feeHeadId, dto);
    const estimate = await this.estimate(student, dto);
    const branchId = student.active.branchId;
    const steps = await this.routing.steps(
      branchId,
      'CONCESSION',
      user.activeRole,
    );
    const row = await this.prisma.$transaction(async (tx) => {
      const concession = await tx.concession.create({
        data: {
          schoolId: student.schoolId,
          branchId,
          studentId: student.studentId,
          feeHeadId,
          type: dto.type,
          value: BigInt(dto.value),
          fromPeriod: dto.from,
          toPeriod: dto.to ?? null,
          reason: dto.reason.trim(),
          estimateMinor: estimate,
          requestedById: user.id,
        },
      });
      const approval = await this.approvals.create(
        {
          type: 'CONCESSION',
          entityType: 'Concession',
          entityId: concession.id,
          schoolId: student.schoolId,
          branchId,
          requestedById: user.id,
          title: `Concession for ${student.name} (${dto.type === 'PERCENT' ? `${dto.value}%` : 'fixed'})`,
          payload: {
            concessionId: concession.id,
            studentId: student.studentId,
          },
          reason: concession.reason,
          amountMinor: estimate,
          steps,
        },
        tx,
      );
      return tx.concession.update({
        where: { id: concession.id },
        data: { approvalId: approval.id },
      });
    });
    this.audit.stage({
      action: 'concession.request',
      entityType: 'Concession',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: { ...dto, estimateMinor: estimate },
    });
    const firstRole = steps[0]?.approverRole as RoleKey | undefined;
    if (firstRole) {
      await this.notifications.notify({
        userIds:
          firstRole === RoleKey.SUPER_ADMIN
            ? await this.people.superAdmins()
            : await this.people.roleHolders(branchId, firstRole),
        category: 'APPROVAL',
        title: 'Concession request',
        body: `Concession requested for ${student.name}.`,
        data: { concessionId: row.id, approvalId: row.approvalId },
      });
    }
    return (await this.reader.toDtos([row]))[0];
  }

  /** One month of the approved plan's MONTHLY items (FIXED without a plan: its value). */
  private async estimate(
    student: FeeStudent,
    dto: CreateConcessionDto,
  ): Promise<bigint> {
    const active = student.active!;
    const plans = await this.context.plans({
      branchId: active.branchId,
      sessionId: active.sessionId,
      classIds: [active.classId],
      period: dto.from,
      actorId: null,
    });
    const plan = plans.get(active.classId);
    const rule = {
      id: 'estimate',
      feeHeadId: dto.feeHeadId ?? null,
      type: dto.type,
      value: BigInt(dto.value),
    };
    if (!plan) return dto.type === 'FIXED' ? rule.value : 0n;
    const monthly = plan.snapshot.items.filter(
      (i) => i.frequency === 'MONTHLY',
    );
    return concessionTotal(applyConcessions(monthly, [rule]));
  }

  private async assertNoOverlap(
    studentId: string,
    feeHeadId: string | null,
    dto: CreateConcessionDto,
  ): Promise<void> {
    const clash = await this.prisma.concession.findFirst({
      where: {
        studentId,
        feeHeadId,
        status: { in: ['PENDING', 'APPROVED'] },
        ...(dto.to ? { fromPeriod: { lte: dto.to } } : {}),
        OR: [{ toPeriod: null }, { toPeriod: { gte: dto.from } }],
      },
    });
    if (clash)
      throw conflict('An overlapping concession exists for this fee head', {
        concessionId: clash.id,
      });
  }
}
