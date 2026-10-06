import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { parseDate } from '../../core/common/dates';
import { schoolDate } from '../../core/common/school-time';
import {
  planAllocation,
  type Allocation,
  type OpenInvoice,
} from './allocation';
import { balanceOf, OPEN_STATUSES, settledStatus } from './invoice-state';

/**
 * Moves money between payments and invoices. Callers hold
 * `LedgerService.lockStudent` in the same transaction. The ledger is not
 * touched here: a payment is posted once for its full amount; allocations only
 * say which invoices it settles (the rest is advance credit).
 */
@Injectable()
export class InvoiceSettlementService {
  async openInvoices(
    tx: Prisma.TransactionClient,
    studentId: string,
  ): Promise<OpenInvoice[]> {
    const rows = await tx.invoice.findMany({
      where: { studentId, status: { in: OPEN_STATUSES } },
      select: {
        id: true,
        dueDate: true,
        createdAt: true,
        totalMinor: true,
        paidMinor: true,
      },
    });
    return rows.map((row) => ({
      id: row.id,
      dueDate: row.dueDate,
      createdAt: row.createdAt,
      balanceMinor: balanceOf(row),
    }));
  }

  /** Writes allocation rows and bumps each invoice's paid amount/status. */
  async allocate(
    tx: Prisma.TransactionClient,
    paymentId: string,
    allocations: Allocation[],
  ): Promise<void> {
    const today = parseDate(schoolDate());
    for (const allocation of allocations) {
      if (allocation.amountMinor <= 0n) continue;
      await tx.paymentAllocation.create({
        data: {
          paymentId,
          invoiceId: allocation.invoiceId,
          amountMinor: allocation.amountMinor,
        },
      });
      await this.addPaid(
        tx,
        allocation.invoiceId,
        allocation.amountMinor,
        today,
      );
    }
  }

  /**
   * Spends a student's advance credit (unallocated parts of RECORDED payments,
   * oldest first) on open invoices, oldest due first.
   */
  async applyAdvance(
    tx: Prisma.TransactionClient,
    studentId: string,
  ): Promise<void> {
    const payments = await tx.payment.findMany({
      where: { studentId, status: 'RECORDED', unallocatedMinor: { gt: 0n } },
      orderBy: [{ receivedOn: 'asc' }, { createdAt: 'asc' }],
    });
    for (const payment of payments) {
      const open = await this.openInvoices(tx, studentId);
      if (!open.some((invoice) => invoice.balanceMinor > 0n)) return;
      const plan = planAllocation(open, payment.unallocatedMinor);
      const used = payment.unallocatedMinor - plan.advanceMinor;
      if (used === 0n) continue;
      await tx.payment.update({
        where: { id: payment.id },
        data: { unallocatedMinor: plan.advanceMinor },
      });
      await this.allocate(tx, payment.id, plan.allocations);
    }
  }

  /** Undoes a payment's allocations (reversal); invoices reopen. */
  async releasePayment(
    tx: Prisma.TransactionClient,
    paymentId: string,
  ): Promise<string[]> {
    const today = parseDate(schoolDate());
    const rows = await tx.paymentAllocation.findMany({
      where: { paymentId, reversed: false },
    });
    for (const row of rows) {
      await tx.paymentAllocation.update({
        where: { id: row.id },
        data: { reversed: true },
      });
      await this.addPaid(tx, row.invoiceId, -row.amountMinor, today);
    }
    return rows.map((row) => row.invoiceId);
  }

  /** Recomputes the status of an invoice from its amounts (e.g. after a late fee). */
  async refreshStatus(
    tx: Prisma.TransactionClient,
    invoiceId: string,
  ): Promise<void> {
    await this.addPaid(tx, invoiceId, 0n, parseDate(schoolDate()));
  }

  private async addPaid(
    tx: Prisma.TransactionClient,
    invoiceId: string,
    delta: bigint,
    today: Date,
  ): Promise<void> {
    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    const paidMinor = invoice.paidMinor + delta;
    if (paidMinor < 0n || paidMinor > invoice.totalMinor) {
      throw new Error(`Invoice ${invoice.invoiceNo} paid amount out of range`);
    }
    const status = settledStatus({ ...invoice, paidMinor }, today);
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { paidMinor, status, version: { increment: 1 } },
    });
  }
}
