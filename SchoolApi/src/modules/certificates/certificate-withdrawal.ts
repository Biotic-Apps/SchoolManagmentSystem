import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { conflict, invalid } from '../../core/common/errors/errors';

/**
 * Same DB effects as `POST /students/:id/withdraw` (EnrollmentActionsService),
 * inside the certificate issue transaction.
 */
@Injectable()
export class CertificateWithdrawal {
  async withdraw(
    tx: Prisma.TransactionClient,
    input: {
      studentId: string;
      effectiveDate: Date;
      reason: string;
      actorId: string;
    },
  ): Promise<{ enrollmentId: string; branchId: string }> {
    const current = await tx.enrollment.findFirst({
      where: { studentId: input.studentId, status: 'ACTIVE' },
    });
    if (!current) throw conflict('Student has already left the school');
    if (input.effectiveDate < current.startDate) {
      throw invalid('effectiveDate is before the enrollment start');
    }
    const open = await tx.transfer.count({
      where: { studentId: input.studentId, status: 'REQUESTED' },
    });
    if (open > 0) throw conflict('Cancel the open transfer first');
    await tx.student.update({
      where: { id: input.studentId },
      data: { status: 'WITHDRAWN', updatedById: input.actorId },
    });
    await tx.enrollment.update({
      where: { id: current.id },
      data: {
        status: 'WITHDRAWN',
        endDate: input.effectiveDate,
        reason: input.reason,
        updatedById: input.actorId,
      },
    });
    return { enrollmentId: current.id, branchId: current.branchId };
  }
}
