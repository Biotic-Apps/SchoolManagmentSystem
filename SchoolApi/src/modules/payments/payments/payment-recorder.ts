import { Injectable } from '@nestjs/common';
import type {
  Payment,
  PaymentMethod,
  Prisma,
} from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { invalid } from '../../../core/common/errors/errors';
import { SequenceService } from '../../../core/sequences/sequence.service';
import {
  AllocationError,
  planAllocation,
  type Allocation,
  type AllocationPlan,
} from '../../finance-core/allocation';
import { InvoiceSettlementService } from '../../finance-core/invoice-settlement.service';
import { LedgerService } from '../../finance-core/ledger.service';
import { lockCollectionDay } from '../collections/collection-lock';
import {
  receiptNumber,
  receiptSequenceKey,
  receiptYear,
} from './receipt-number';

export interface RecordPaymentInput {
  studentId: string;
  /** Branch of the student (latest enrollment) or of the invoice paid. */
  branchId: string;
  amountMinor: bigint;
  method: PaymentMethod;
  reference?: string | null;
  receivedOn: Date;
  receivedById: string;
  /**
   * Omitted: oldest due first. Given: exactly these (an empty list keeps the
   * whole amount as advance credit).
   */
  allocations?: Allocation[];
  proofId?: string;
  gateway?: { key: string; ref: string };
}

/**
 * The one way money comes in (counter, verified proof, gateway): receipt
 * number, allocation, advance credit and a single PAYMENT ledger entry.
 * Must run inside the caller's transaction.
 */
@Injectable()
export class PaymentRecorder {
  constructor(
    private readonly ledger: LedgerService,
    private readonly settlement: InvoiceSettlementService,
    private readonly sequences: SequenceService,
  ) {}

  async record(
    tx: Prisma.TransactionClient,
    input: RecordPaymentInput,
  ): Promise<Payment> {
    await this.ledger.lockStudent(tx, input.studentId);
    if (input.method === 'CASH') await this.assertDayOpen(tx, input);
    const branch = await tx.branch.findUniqueOrThrow({
      where: { id: input.branchId },
    });
    const plan = await this.plan(tx, input);

    const year = receiptYear(input.receivedOn);
    const seq = await this.sequences.next(
      tx,
      receiptSequenceKey(branch.id, year),
    );
    const payment = await tx.payment.create({
      data: {
        receiptNo: receiptNumber(branch.code, year, seq),
        schoolId: branch.schoolId,
        branchId: branch.id,
        studentId: input.studentId,
        amountMinor: input.amountMinor,
        unallocatedMinor: plan.advanceMinor,
        method: input.method,
        reference: input.reference ?? null,
        receivedOn: input.receivedOn,
        receivedById: input.receivedById,
        proofId: input.proofId ?? null,
        gateway: input.gateway?.key ?? null,
        gatewayRef: input.gateway?.ref ?? null,
      },
    });
    await this.settlement.allocate(tx, payment.id, plan.allocations);
    await this.ledger.post(tx, [
      {
        schoolId: branch.schoolId,
        branchId: branch.id,
        studentId: input.studentId,
        type: 'PAYMENT',
        amountMinor: -input.amountMinor,
        refType: 'Payment',
        refId: payment.id,
        paymentId: payment.id,
        createdById: input.receivedById,
      },
    ]);
    return payment;
  }

  private async plan(
    tx: Prisma.TransactionClient,
    input: RecordPaymentInput,
  ): Promise<AllocationPlan> {
    if (input.amountMinor <= 0n) throw invalid('Amount must be positive');
    if (input.allocations && input.allocations.length === 0) {
      return { allocations: [], advanceMinor: input.amountMinor };
    }
    const open = await this.settlement.openInvoices(tx, input.studentId);
    try {
      return planAllocation(open, input.amountMinor, input.allocations);
    } catch (error) {
      if (error instanceof AllocationError) throw invalid(error.message);
      throw error;
    }
  }

  /** contract B5: a closed day takes no new (back-dated) cash. */
  private async assertDayOpen(
    tx: Prisma.TransactionClient,
    input: RecordPaymentInput,
  ): Promise<void> {
    await lockCollectionDay(tx, input.branchId, input.receivedOn);
    const closed = await tx.dailyCollection.findUnique({
      where: {
        branchId_date: { branchId: input.branchId, date: input.receivedOn },
      },
      select: { id: true },
    });
    if (closed) {
      throw new AppError(
        ErrorCode.DAY_CLOSED,
        `Cash collection for ${formatDate(input.receivedOn)} is closed`,
      );
    }
  }
}
