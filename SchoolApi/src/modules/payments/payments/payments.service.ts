import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import {
  ClientRequestService,
  isDuplicateKey,
} from '../../../core/idempotency/client-request.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { schoolDate } from '../../../core/common/school-time';
import { FinanceAccess } from '../shared/finance-access';
import type { CreatePaymentDto, PaymentDto } from './dto/payment.dto';
import { PaymentFollowup } from './payment-followup';
import { PaymentReader } from './payment-reader';
import { PaymentRecorder } from './payment-recorder';

/** Counter payments (cashier/accountant), contract B3. */
@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FinanceAccess,
    private readonly recorder: PaymentRecorder,
    private readonly reader: PaymentReader,
    private readonly followup: PaymentFollowup,
    private readonly requests: ClientRequestService,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreatePaymentDto,
  ): Promise<PaymentDto> {
    if (scope.guardian)
      throw forbidden('Parents pay online or upload a payment proof');
    const key = {
      userId: user.id,
      clientRequestId: dto.clientRequestId,
      action: 'payments.record',
    };
    const seen = await this.requests.seen(key);
    if (seen) return this.reader.dto(seen);

    const receivedOn = parseDate(dto.receivedOn);
    if (receivedOn > parseDate(schoolDate()))
      throw invalid('receivedOn cannot be in the future');
    const student = await this.access.payingStudent(dto.studentId);
    if (!student) throw notFound('Student');
    scope.assertManageBranch({
      id: student.branchId,
      schoolId: student.schoolId,
    });

    let payment;
    try {
      payment = await this.prisma.$transaction(async (tx) => {
        const created = await this.recorder.record(tx, {
          studentId: student.id,
          branchId: student.branchId,
          amountMinor: BigInt(dto.amountMinor),
          method: dto.method,
          reference: dto.reference?.trim() || null,
          receivedOn,
          receivedById: user.id,
          allocations: dto.allocations?.length
            ? dto.allocations.map((a) => ({
                invoiceId: a.invoiceId,
                amountMinor: BigInt(a.amountMinor),
              }))
            : undefined,
        });
        await this.requests.remember(tx, key, created.id);
        return created;
      });
    } catch (error) {
      const repeat = isDuplicateKey(error) && (await this.requests.seen(key));
      if (repeat) return this.reader.dto(repeat);
      throw error;
    }

    const result = await this.reader.dto(payment.id);
    this.audit.stage({
      action: 'payment.record',
      entityType: 'Payment',
      entityId: payment.id,
      schoolId: payment.schoolId,
      branchId: payment.branchId,
      after: {
        receiptNo: result.receiptNo,
        amountMinor: result.amountMinor,
        method: result.method,
        receivedOn: result.receivedOn,
        allocations: result.allocations,
        unallocatedMinor: result.unallocatedMinor,
      },
    });
    await this.followup.afterRecord(user, payment, student.name);
    return result;
  }
}
