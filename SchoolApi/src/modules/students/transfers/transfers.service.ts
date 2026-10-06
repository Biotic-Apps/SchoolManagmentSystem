import { Injectable } from '@nestjs/common';
import type { TransferStatus } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { EnrollmentWriter } from '../enrollment/enrollment-writer';
import { StudentAccessService } from '../student-access.service';
import type {
  RequestTransferDto,
  TransferQueryDto,
} from './dto/transfer-input.dto';
import type { TransferDto } from './dto/transfer.dto';
import { toTransferDto } from './transfer.mapper';
import { TransfersRepository, type TransferRow } from './transfers.repository';

/** backendFlows.md §3.2: source requests, destination places, dates recorded. */
@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: TransfersRepository,
    private readonly access: StudentAccessService,
    private readonly writer: EnrollmentWriter,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: TransferQueryDto,
  ): Promise<PageResult<TransferDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toTransferDto), total, query);
  }

  async request(
    user: AuthUser,
    scope: Scope,
    studentId: string,
    dto: RequestTransferDto,
  ): Promise<TransferDto> {
    const student = await this.access.manage(scope, studentId);
    const current = student.enrollments.find((e) => e.status === 'ACTIVE');
    if (!current) throw conflict('Student has no active enrollment');
    const target = await this.repository.findBranch(dto.toBranchId);
    if (
      !target ||
      target.status !== 'ACTIVE' ||
      target.schoolId !== student.schoolId
    )
      throw invalid('Destination must be an active branch of the same school');
    if (target.id === current.branchId)
      throw invalid('Use change-section within the same branch');

    const created = await this.prisma.transfer
      .create({
        data: {
          schoolId: student.schoolId,
          studentId,
          fromBranchId: current.branchId,
          toBranchId: target.id,
          fromEnrollmentId: current.id,
          effectiveDate: parseDate(dto.effectiveDate),
          reason: dto.reason,
          requestedById: user.id,
        },
      })
      .catch((error: { code?: string }) => {
        if (error.code === 'P2002')
          throw conflict('A transfer is already open');
        throw error;
      });
    const row = await this.load(created.id);
    await this.notifyPrincipal(
      row.toBranch.principalUserId,
      'Transfer request',
      row,
    );
    return this.audited('transfer.request', row, undefined);
  }

  async accept(
    user: AuthUser,
    scope: Scope,
    id: string,
    sectionId: string,
  ): Promise<TransferDto> {
    const transfer = await this.load(id);
    scope.assertManageBranch(transfer.toBranch);
    this.assertOpen(transfer);
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });
    if (!section || section.branchId !== transfer.toBranchId)
      throw invalid('Section must belong to the destination branch');

    await this.prisma.$transaction(async (tx) => {
      await this.claim(tx, id, 'ACCEPTED', user.id);
      const ended = await tx.enrollment.updateMany({
        where: { id: transfer.fromEnrollmentId, status: 'ACTIVE' },
        data: {
          status: 'TRANSFERRED_OUT',
          endDate: transfer.effectiveDate,
          reason: transfer.reason,
          updatedById: user.id,
        },
      });
      if (ended.count === 0)
        throw conflict('Source enrollment is no longer active');
      const enrollment = await this.writer.enroll(tx, {
        studentId: transfer.studentId,
        sectionId,
        startDate: transfer.effectiveDate,
        actorId: user.id,
        reason: 'Transfer in',
      });
      await tx.transfer.update({
        where: { id },
        data: { toEnrollmentId: enrollment.id },
      });
    });
    const row = await this.load(id);
    await this.notifyPrincipal(
      row.fromBranch.principalUserId,
      'Transfer accepted',
      row,
    );
    return this.audited('transfer.accept', row, transfer);
  }

  async reject(user: AuthUser, scope: Scope, id: string, reason: string) {
    const transfer = await this.load(id);
    scope.assertManageBranch(transfer.toBranch);
    return this.close(user, transfer, 'REJECTED', reason);
  }

  async cancel(user: AuthUser, scope: Scope, id: string, reason: string) {
    const transfer = await this.load(id);
    scope.assertManageBranch(transfer.fromBranch);
    return this.close(user, transfer, 'CANCELLED', reason);
  }

  private async close(
    user: AuthUser,
    transfer: TransferRow,
    status: TransferStatus,
    reason: string,
  ): Promise<TransferDto> {
    this.assertOpen(transfer);
    await this.prisma.$transaction((tx) =>
      this.claim(tx, transfer.id, status, user.id, reason),
    );
    const row = await this.load(transfer.id);
    const notifyId =
      status === 'REJECTED'
        ? row.fromBranch.principalUserId
        : row.toBranch.principalUserId;
    await this.notifyPrincipal(
      notifyId,
      `Transfer ${status.toLowerCase()}`,
      row,
    );
    return this.audited(`transfer.${status.toLowerCase()}`, row, transfer);
  }

  private async claim(
    tx: Pick<PrismaService, 'transfer'>,
    id: string,
    status: TransferStatus,
    userId: string,
    decisionReason?: string,
  ): Promise<void> {
    const claimed = await tx.transfer.updateMany({
      where: { id, status: 'REQUESTED' },
      data: {
        status,
        decisionReason,
        decidedById: userId,
        decidedAt: new Date(),
      },
    });
    if (claimed.count === 0) throw conflict('Transfer is no longer open');
  }

  private assertOpen(transfer: TransferRow): void {
    if (transfer.status !== 'REQUESTED')
      throw conflict(`Transfer is already ${transfer.status.toLowerCase()}`);
  }

  private async load(id: string): Promise<TransferRow> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('Transfer');
    return row;
  }

  private async notifyPrincipal(
    userId: string | null,
    title: string,
    row: TransferRow,
  ): Promise<void> {
    if (!userId) return;
    const dto = toTransferDto(row);
    await this.notifications.notify({
      userIds: [userId],
      category: 'STUDENTS',
      title,
      body: `${dto.student.name} (${dto.student.admissionNo}): ${dto.fromBranch.name} to ${dto.toBranch.name} from ${dto.effectiveDate}`,
      data: { transferId: row.id },
    });
  }

  private audited(
    action: string,
    after: TransferRow,
    before: TransferRow | undefined,
  ): TransferDto {
    const dto = toTransferDto(after);
    this.audit.stage({
      action,
      entityType: 'Transfer',
      entityId: after.id,
      schoolId: after.schoolId,
      branchId: after.fromBranchId,
      before: before && toTransferDto(before),
      after: { ...dto, toEnrollmentId: after.toEnrollmentId },
    });
    return dto;
  }
}
