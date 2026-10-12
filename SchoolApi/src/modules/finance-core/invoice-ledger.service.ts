import { Injectable } from '@nestjs/common';
import type {
  Invoice,
  InvoiceSource,
  Prisma,
} from '../../generated/prisma/client';
import { parseDate } from '../../core/common/dates';
import { conflict } from '../../core/common/errors/errors';
import { schoolDate } from '../../core/common/school-time';
import { SequenceService } from '../../core/sequences/sequence.service';
import { InvoiceSettlementService } from './invoice-settlement.service';
import { settledStatus } from './invoice-state';
import { LedgerService } from './ledger.service';
import { sumMinor } from './money';

export interface NewInvoiceLine {
  feeHeadId: string;
  description: string;
  amountMinor: bigint;
  refType?: string | null;
  refId?: string | null;
}

export interface NewInvoiceConcession {
  concessionId: string;
  amountMinor: bigint;
}

export interface NewInvoice {
  schoolId: string;
  branchId: string;
  sessionId: string;
  studentId: string;
  sectionId?: string | null;
  classId?: string | null;
  /** `YYYY-MM`; numbering uses it (or the due month for ad-hoc invoices). */
  period?: string | null;
  source: InvoiceSource;
  dueDate: Date;
  lines: NewInvoiceLine[];
  concessions?: NewInvoiceConcession[];
  siblingDiscountMinor?: bigint;
  planId?: string | null;
  lateFeeRule?: { amountMinor: number; afterDays: number } | null;
  createdById?: string | null;
}

/**
 * Invoice money events and their ledger postings, shared by fees, sales and
 * payments. Every method expects to run inside the caller's transaction.
 */
@Injectable()
export class InvoiceLedgerService {
  constructor(
    private readonly ledger: LedgerService,
    private readonly settlement: InvoiceSettlementService,
    private readonly sequences: SequenceService,
  ) {}

  /** `INV-{BRANCH}-{YYYYMM}-{SEQ}` (sequence per branch and month). */
  async nextInvoiceNo(
    tx: Prisma.TransactionClient,
    branchId: string,
    period: string,
  ): Promise<string> {
    const branch = await tx.branch.findUniqueOrThrow({
      where: { id: branchId },
      select: { code: true },
    });
    const month = period.replace('-', '');
    const seq = await this.sequences.next(tx, `invoice:${branchId}:${month}`);
    return `INV-${branch.code}-${month}-${String(seq).padStart(4, '0')}`;
  }

  /** Creates a DRAFT invoice; concessions never exceed the subtotal. */
  async create(
    tx: Prisma.TransactionClient,
    input: NewInvoice,
  ): Promise<Invoice> {
    const subtotal = sumMinor(input.lines.map((line) => line.amountMinor));
    const concessions = (input.concessions ?? []).filter(
      (c) => c.amountMinor > 0n,
    );
    const concession = sumMinor(concessions.map((c) => c.amountMinor));
    if (input.lines.some((line) => line.amountMinor < 0n)) {
      throw new Error('Invoice lines must not be negative');
    }
    if (concession > subtotal) throw new Error('Concession exceeds subtotal');
    const siblingDiscount = input.siblingDiscountMinor ?? 0n;
    const numberingPeriod =
      input.period ?? input.dueDate.toISOString().slice(0, 7);
    return tx.invoice.create({
      data: {
        invoiceNo: await this.nextInvoiceNo(
          tx,
          input.branchId,
          numberingPeriod,
        ),
        schoolId: input.schoolId,
        branchId: input.branchId,
        sessionId: input.sessionId,
        studentId: input.studentId,
        sectionId: input.sectionId ?? null,
        classId: input.classId ?? null,
        period: input.period ?? null,
        source: input.source,
        dueDate: input.dueDate,
        subtotalMinor: subtotal,
        concessionMinor: concession,
        siblingDiscountMinor: siblingDiscount,
        totalMinor: subtotal - concession - siblingDiscount,
        planId: input.planId ?? null,
        lateFeeRule: input.lateFeeRule ?? undefined,
        createdById: input.createdById ?? null,
        lines: {
          create: input.lines.map((line) => ({
            feeHeadId: line.feeHeadId,
            description: line.description,
            amountMinor: line.amountMinor,
            refType: line.refType ?? null,
            refId: line.refId ?? null,
          })),
        },
        concessions: {
          create: concessions.map((c) => ({
            concessionId: c.concessionId,
            amountMinor: c.amountMinor,
          })),
        },
      },
    });
  }

  /**
   * DRAFT → ISSUED: posts CHARGE (+subtotal), CONCESSION (−concession) and any
   * late fee to the ledger, then spends advance credit on it.
   */
  async issue(
    tx: Prisma.TransactionClient,
    invoiceId: string,
    actorId: string | null,
  ): Promise<Invoice> {
    const draft = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    await this.ledger.lockStudent(tx, draft.studentId);
    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    if (invoice.status !== 'DRAFT') {
      throw conflict(`Invoice ${invoice.invoiceNo} is not a draft`);
    }
    const today = parseDate(schoolDate());
    const status = settledStatus({ ...invoice, status: 'ISSUED' }, today);
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status,
        issueDate: today,
        issuedById: actorId,
        version: { increment: 1 },
      },
    });
    const base = this.base(invoice, actorId);
    await this.ledger.post(tx, [
      { ...base, type: 'CHARGE', amountMinor: invoice.subtotalMinor },
      {
        ...base,
        type: 'CONCESSION',
        amountMinor: -invoice.concessionMinor,
      },
      { ...base, type: 'LATE_FEE', amountMinor: invoice.lateFeeMinor },
    ]);
    await this.settlement.applyAdvance(tx, invoice.studentId);
    return tx.invoice.findUniqueOrThrow({ where: { id: invoice.id } });
  }

  /** Adds a late fee once to an open invoice (+LATE_FEE ledger entry). */
  async addLateFee(
    tx: Prisma.TransactionClient,
    invoiceId: string,
    amountMinor: bigint,
    reason: string,
  ): Promise<void> {
    if (amountMinor <= 0n) return;
    const found = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    await this.ledger.lockStudent(tx, found.studentId);
    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    if (invoice.lateFeeMinor > 0n) return;
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        lateFeeMinor: amountMinor,
        totalMinor: invoice.totalMinor + amountMinor,
        version: { increment: 1 },
      },
    });
    await this.ledger.post(tx, [
      {
        ...this.base(invoice, null),
        type: 'LATE_FEE',
        amountMinor,
        reason,
      },
    ]);
    await this.settlement.refreshStatus(tx, invoice.id);
    await this.settlement.applyAdvance(tx, invoice.studentId);
  }

  /**
   * DRAFT → CANCELLED (nothing posted). An issued invoice with no money on it
   * is cancelled with a CANCELLATION entry reversing its total.
   */
  async cancel(
    tx: Prisma.TransactionClient,
    invoiceId: string,
    reason: string,
    actorId: string | null,
  ): Promise<void> {
    const found = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    await this.ledger.lockStudent(tx, found.studentId);
    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    const cancellable = ['DRAFT', 'ISSUED', 'OVERDUE'].includes(invoice.status);
    if (!cancellable || invoice.paidMinor > 0n) {
      throw conflict(
        `Invoice ${invoice.invoiceNo} has payments or cannot be cancelled`,
      );
    }
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        cancelledAt: new Date(),
        version: { increment: 1 },
      },
    });
    if (invoice.status !== 'DRAFT') {
      await this.ledger.post(tx, [
        {
          ...this.base(invoice, actorId),
          type: 'CANCELLATION',
          amountMinor: -invoice.totalMinor,
          reason,
        },
      ]);
    }
  }

  private base(invoice: Invoice, actorId: string | null) {
    return {
      schoolId: invoice.schoolId,
      branchId: invoice.branchId,
      studentId: invoice.studentId,
      invoiceId: invoice.id,
      refType: 'Invoice',
      refId: invoice.id,
      createdById: actorId,
    };
  }
}
