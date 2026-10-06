import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate } from '../../../core/common/dates';
import { conflict, notFound } from '../../../core/common/errors/errors';
import { isPrismaKnownError } from '../../../core/common/errors/prisma-error.mapper';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { CorrectionInputDto } from '../dto/register-input.dto';
import type { CorrectionDto } from '../dto/register.dto';
import { RegisterAccessService } from '../register-access.service';

/** Changes to a submitted/locked register go through principal approval. */
@Injectable()
export class CorrectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: RegisterAccessService,
    private readonly approvals: ApprovalService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    dto: CorrectionInputDto,
  ): Promise<CorrectionDto> {
    const entry = await this.prisma.attendanceEntry.findUnique({
      where: { id: dto.entryId },
      include: {
        register: true,
        student: { select: { firstName: true, lastName: true } },
      },
    });
    if (!entry) throw notFound('Attendance entry');
    const { section } = await this.access.writer(
      user,
      scope,
      entry.register.sectionId,
    );
    if (!['SUBMITTED', 'LOCKED'].includes(entry.register.status))
      throw conflict('Only submitted or locked registers need a correction');
    if (entry.status === dto.newStatus)
      throw conflict('The entry already has this status');

    const name = `${entry.student.firstName} ${entry.student.lastName}`;
    const row = await this.prisma
      .$transaction(async (tx) => {
        const correction = await tx.attendanceCorrection.create({
          data: {
            entryId: entry.id,
            oldStatus: entry.status,
            newStatus: dto.newStatus,
            reason: dto.reason,
            requestedById: user.id,
          },
        });
        const approval = await this.approvals.create(
          {
            type: 'ATTENDANCE_CORRECTION',
            entityType: 'AttendanceCorrection',
            entityId: correction.id,
            schoolId: section.schoolId,
            branchId: section.branchId,
            requestedById: user.id,
            title: `Attendance correction: ${name} ${formatDate(entry.register.date)} ${entry.status} -> ${dto.newStatus}`,
            payload: { correctionId: correction.id, entryId: entry.id },
            reason: dto.reason,
            steps: [{ approverRole: RoleKey.PRINCIPAL }],
          },
          tx,
        );
        return tx.attendanceCorrection.update({
          where: { id: correction.id },
          data: { approvalId: approval.id },
        });
      })
      .catch((error: unknown) => {
        if (isPrismaKnownError(error) && error.code === 'P2002')
          throw conflict('A correction for this entry is already pending');
        throw error;
      });
    this.audit.stage({
      action: 'attendance.correction_request',
      entityType: 'AttendanceEntry',
      entityId: entry.id,
      schoolId: section.schoolId,
      branchId: section.branchId,
      before: { status: entry.status },
      after: { newStatus: dto.newStatus, reason: dto.reason },
    });
    return {
      id: row.id,
      entryId: row.entryId,
      oldStatus: row.oldStatus,
      newStatus: row.newStatus,
      reason: row.reason,
      status: row.status,
      approvalId: row.approvalId,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
