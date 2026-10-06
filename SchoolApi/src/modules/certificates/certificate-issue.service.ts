import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { conflict, invalid } from '../../core/common/errors/errors';
import { schoolDate } from '../../core/common/school-time';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { SequenceService } from '../../core/sequences/sequence.service';
import { CertificateAccessService } from './certificate-access.service';
import { CertificateNotifier } from './certificate-notifier';
import { CertificatePdfRequester } from './certificate-pdf-requester';
import {
  certificateSequenceKey,
  certificateSerial,
} from './certificate-serial';
import { CertificateWithdrawal } from './certificate-withdrawal';
import { CERTIFICATE_INCLUDE } from './certificate.mapper';
import { needsClearance } from './clearance';
import { ClearanceService } from './clearance.service';
import type { CertificateDto } from './dto/certificate.dto';

/** Issuing an APPROVED certificate: serial, PDF; leaving withdraws the student. */
@Injectable()
export class CertificateIssueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: CertificateAccessService,
    private readonly clearance: ClearanceService,
    private readonly sequences: SequenceService,
    private readonly withdrawal: CertificateWithdrawal,
    private readonly pdf: CertificatePdfRequester,
    private readonly notifier: CertificateNotifier,
    private readonly audit: AuditService,
  ) {}

  async issue(
    user: AuthUser,
    scope: Scope,
    id: string,
    effectiveDate?: string,
  ): Promise<CertificateDto> {
    const row = await this.access.manage(scope, id);
    if (row.status !== 'APPROVED') {
      throw conflict(
        `Only APPROVED certificates can be issued (${row.status})`,
      );
    }
    if (effectiveDate && row.type !== 'SCHOOL_LEAVING') {
      throw invalid('effectiveDate applies to SCHOOL_LEAVING only');
    }
    const today = schoolDate();
    const leaving = row.type === 'SCHOOL_LEAVING';
    const effective = leaving ? parseDate(effectiveDate ?? today) : null;

    const serialNo = await this.prisma.$transaction(async (tx) => {
      if (needsClearance(row.type)) {
        await this.clearance.assertCleared(row.studentId, tx);
      }
      const year = Number(today.slice(0, 4));
      const seq = await this.sequences.next(
        tx,
        certificateSequenceKey(row.schoolId, row.type, year),
      );
      const serial = certificateSerial(row.type, year, seq);
      const changed = await tx.certificate.updateMany({
        where: { id: row.id, status: 'APPROVED' },
        data: {
          status: 'ISSUED',
          serialNo: serial,
          issuedOn: parseDate(today),
          effectiveDate: effective,
          issuedById: user.id,
        },
      });
      if (changed.count === 0) throw conflict('Certificate was already issued');
      if (effective) {
        await this.withdrawal.withdraw(tx, {
          studentId: row.studentId,
          effectiveDate: effective,
          reason: `School leaving certificate ${serial}`,
          actorId: user.id,
        });
      }
      return serial;
    });
    this.audit.stage({
      action: 'certificate.issue',
      entityType: 'Certificate',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: 'APPROVED' },
      after: {
        status: 'ISSUED',
        serialNo,
        effectiveDate: effectiveDate ?? null,
      },
    });
    if (effective) {
      this.audit.stage({
        action: 'student.withdraw',
        entityType: 'Student',
        entityId: row.studentId,
        schoolId: row.schoolId,
        branchId: row.branchId,
        before: { enrollmentStatus: 'ACTIVE' },
        after: {
          enrollmentStatus: 'WITHDRAWN',
          effectiveDate: effectiveDate ?? today,
          certificateId: row.id,
        },
      });
    }
    const updated = await this.prisma.certificate.findUniqueOrThrow({
      where: { id: row.id },
      include: CERTIFICATE_INCLUDE,
    });
    await this.notifier.decided(updated, user.id, 'issued');
    return this.pdf.request(user, updated);
  }

  /** A duplicate row (same serial, "DUPLICATE" PDF); the original is untouched. */
  async reissue(
    user: AuthUser,
    scope: Scope,
    id: string,
    reason: string,
  ): Promise<CertificateDto> {
    const original = await this.access.manage(scope, id);
    if (original.status !== 'ISSUED' || original.duplicateOfId) {
      throw conflict('Only issued original certificates can be reissued');
    }
    const duplicate = await this.prisma.certificate.create({
      data: {
        schoolId: original.schoolId,
        branchId: original.branchId,
        studentId: original.studentId,
        type: original.type,
        purpose: original.purpose,
        details: original.details ?? undefined,
        status: 'ISSUED',
        serialNo: original.serialNo,
        duplicateOfId: original.id,
        reissueReason: reason.trim(),
        issuedOn: parseDate(schoolDate()),
        effectiveDate: original.effectiveDate,
        requestedById: user.id,
        decidedById: original.decidedById,
        decidedAt: original.decidedAt,
        issuedById: user.id,
      },
      include: CERTIFICATE_INCLUDE,
    });
    this.audit.stage({
      action: 'certificate.reissue',
      entityType: 'Certificate',
      entityId: duplicate.id,
      schoolId: original.schoolId,
      branchId: original.branchId,
      after: {
        duplicateOfId: original.id,
        serialNo: original.serialNo,
        reason: duplicate.reissueReason,
      },
    });
    return this.pdf.request(user, duplicate);
  }
}
