import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { conflict, forbidden } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { CertificateAccessService } from './certificate-access.service';
import { CertificateNotifier } from './certificate-notifier';
import { CertificatePresenter } from './certificate-presenter';
import { CERTIFICATE_INCLUDE } from './certificate.mapper';
import { needsClearance } from './clearance';
import { ClearanceService } from './clearance.service';
import type { CertificateDto } from './dto/certificate.dto';

/** Principal decision on a REQUESTED certificate. */
@Injectable()
export class CertificateReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CertificateAccessService,
    private readonly clearance: ClearanceService,
    private readonly presenter: CertificatePresenter,
    private readonly notifier: CertificateNotifier,
    private readonly audit: AuditService,
  ) {}

  async approve(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<CertificateDto> {
    const row = await this.access.manage(scope, id);
    this.assertDecidable(user, row);
    if (needsClearance(row.type)) {
      await this.clearance.assertCleared(row.studentId);
    }
    return this.decide(user, row, 'APPROVED', null);
  }

  async reject(
    user: AuthUser,
    scope: Scope,
    id: string,
    reason: string,
  ): Promise<CertificateDto> {
    const row = await this.access.manage(scope, id);
    this.assertDecidable(user, row);
    return this.decide(user, row, 'REJECTED', reason.trim());
  }

  private assertDecidable(
    user: AuthUser,
    row: { status: string; requestedById: string },
  ): void {
    if (row.status !== 'REQUESTED') {
      throw conflict(`Certificate is ${row.status}`);
    }
    if (row.requestedById === user.id) {
      throw forbidden('You cannot decide your own request');
    }
  }

  private async decide(
    user: AuthUser,
    row: Awaited<ReturnType<CertificateAccessService['find']>>,
    status: 'APPROVED' | 'REJECTED',
    reason: string | null,
  ): Promise<CertificateDto> {
    const changed = await this.prisma.certificate.updateMany({
      where: { id: row.id, status: 'REQUESTED' },
      data: {
        status,
        decidedById: user.id,
        decidedAt: new Date(),
        rejectReason: reason,
      },
    });
    if (changed.count === 0) throw conflict('Certificate was already decided');
    const updated = await this.prisma.certificate.findUniqueOrThrow({
      where: { id: row.id },
      include: CERTIFICATE_INCLUDE,
    });
    this.audit.stage({
      action:
        status === 'APPROVED' ? 'certificate.approve' : 'certificate.reject',
      entityType: 'Certificate',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: 'REQUESTED' },
      after: { status, reason },
    });
    await this.notifier.decided(
      updated,
      user.id,
      status === 'APPROVED' ? 'approved' : 'rejected',
    );
    return this.presenter.one(updated);
  }
}
