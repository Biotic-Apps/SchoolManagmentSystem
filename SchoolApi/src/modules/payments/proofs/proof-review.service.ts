import { Injectable } from '@nestjs/common';
import type { PaymentProof, Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { FinanceAccess } from '../shared/finance-access';
import type { ProofDto, ProofQueryDto, VerifyProofDto } from './dto/proof.dto';
import { PROOF_INCLUDE, ProofReader } from './proof-reader';
import { ProofVerifier } from './proof-verifier';

/** Accountant review of parent proofs; parents follow their own (contract B3). */
@Injectable()
export class ProofReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FinanceAccess,
    private readonly reader: ProofReader,
    private readonly verifier: ProofVerifier,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: ProofQueryDto,
  ): Promise<PageResult<ProofDto>> {
    const and: Prisma.PaymentProofWhereInput[] = [];
    if (scope.guardian) {
      if (query.studentId && !scope.canAccessStudent(query.studentId))
        throw notFound('Student');
      and.push({ studentId: { in: [...scope.studentIds] } });
    } else {
      and.push(scope.managedBranchFilter());
      if (query.branchId)
        await this.access.managedBranch(scope, query.branchId);
    }
    if (query.branchId) and.push({ branchId: query.branchId });
    if (query.studentId) and.push({ studentId: query.studentId });
    if (query.status) and.push({ status: query.status });
    const where = { AND: and };
    const [rows, total] = await Promise.all([
      this.prisma.paymentProof.findMany({
        where,
        include: PROOF_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.paymentProof.count({ where }),
    ]);
    return toPageResult(await this.reader.dtos(rows), total, query);
  }

  async verify(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: VerifyProofDto,
  ): Promise<ProofDto> {
    const proof = await this.reviewable(user, scope, id);
    const receivedOn = dto.receivedOn
      ? parseDate(dto.receivedOn)
      : proof.paidOn;
    if (receivedOn > parseDate(schoolDate()))
      throw invalid('receivedOn cannot be in the future');
    await this.verifier.verify(user, proof, receivedOn, dto.note);
    return this.reader.dto(id);
  }

  async reject(
    user: AuthUser,
    scope: Scope,
    id: string,
    reason: string,
  ): Promise<ProofDto> {
    const proof = await this.reviewable(user, scope, id);
    const moved = await this.prisma.paymentProof.updateMany({
      where: { id, status: 'SUBMITTED' },
      data: {
        status: 'REJECTED',
        rejectReason: reason,
        decidedById: user.id,
        decidedAt: new Date(),
      },
    });
    if (moved.count === 0) throw conflict('The proof changed, reload');
    this.audit.stage({
      action: 'payment-proof.reject',
      entityType: 'PaymentProof',
      entityId: id,
      schoolId: proof.schoolId,
      branchId: proof.branchId,
      before: { status: proof.status },
      after: { status: 'REJECTED', reason },
    });
    await this.notifications.notify({
      userIds: [proof.submittedById],
      category: 'FEE',
      title: 'Payment proof rejected',
      body: reason,
      data: { proofId: id, invoiceId: proof.invoiceId },
    });
    return this.reader.dto(id);
  }

  private async reviewable(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<PaymentProof> {
    if (scope.guardian) throw forbidden();
    const proof = await this.prisma.paymentProof.findUnique({ where: { id } });
    if (!proof) throw notFound('Payment proof');
    this.access.assertRecord(scope, proof, 'Payment proof');
    if (proof.status !== 'SUBMITTED')
      throw conflict(`The proof is ${proof.status.toLowerCase()}`);
    if (proof.submittedById === user.id)
      throw forbidden('You cannot review your own proof');
    return proof;
  }
}
