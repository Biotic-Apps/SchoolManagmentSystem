import { Injectable } from '@nestjs/common';
import { parseDate } from '../../../../core/common/dates';
import { schoolDate } from '../../../../core/common/school-time';
import { InvoiceLedgerService } from '../../../finance-core/invoice-ledger.service';
import { InvoiceSettlementService } from '../../../finance-core/invoice-settlement.service';
import { settledStatus } from '../../../finance-core/invoice-state';
import { LedgerService } from '../../../finance-core/ledger.service';
import type { ParsedRow } from '../../validation/sheet';
import {
  ids,
  type CommitResult,
  type Db,
  type ImportTarget,
  type KindCommitter,
} from '../kind-handler';
import { ReferenceReport } from '../shared/references';
import { planOpeningBalances, reconcileOpening } from './opening-plan';
import type { OpeningContext, OpeningImportRow } from './opening-validator';

export const OPENING_REF = 'OPENING_BALANCE';

/** System fee head for opening-balance invoice lines (not plannable). */
function openingHead(tx: Db, schoolId: string) {
  return tx.feeHead.upsert({
    where: { schoolId_code: { schoolId, code: 'OPENING' } },
    create: {
      schoolId,
      code: 'OPENING',
      name: 'Opening balance',
      kind: 'ONE_TIME',
      refundable: false,
      system: true,
    },
    update: {},
  });
}

/**
 * OPENING_BALANCES: per student an ISSUED invoice (source OPENING) due on
 * the as-of date + ledger CHARGE `OPENING_BALANCE`, then advance credit is
 * spent on it like on any issued invoice.
 */
@Injectable()
export class OpeningCommitter implements KindCommitter<
  OpeningImportRow,
  OpeningContext
> {
  readonly kind = 'OPENING_BALANCES' as const;

  constructor(
    private readonly ledger: LedgerService,
    private readonly invoices: InvoiceLedgerService,
    private readonly settlement: InvoiceSettlementService,
  ) {}

  async commit(
    tx: Db,
    target: ImportTarget,
    rows: ParsedRow<OpeningImportRow>[],
  ): Promise<CommitResult> {
    const plan = planOpeningBalances(
      rows.map(({ row, data: d }) => ({
        row,
        admissionNo: d.admissionNo!,
        studentId: d.studentId!,
        amountMinor: d.amountMinor!,
        asOfDate: d.asOfDate!,
      })),
    );
    const byStudent = new Map(rows.map((r) => [r.data.studentId!, r.data]));
    const head = await openingHead(tx, target.schoolId);
    const today = parseDate(schoolDate());
    const invoiceIds: string[] = [];
    for (const line of plan.lines) {
      const d = byStudent.get(line.studentId)!;
      const asOf = parseDate(line.asOfDate);
      await this.ledger.lockStudent(tx, line.studentId);
      const draft = await this.invoices.create(tx, {
        schoolId: target.schoolId,
        branchId: target.branchId,
        sessionId: target.sessionId,
        studentId: line.studentId,
        sectionId: d.sectionId ?? null,
        classId: d.classId ?? null,
        source: 'OPENING',
        dueDate: asOf,
        lines: [
          {
            feeHeadId: head.id,
            description: 'Opening balance',
            amountMinor: BigInt(line.amountMinor),
            refType: OPENING_REF,
          },
        ],
        createdById: target.actorId,
      });
      await tx.invoice.update({
        where: { id: draft.id },
        data: {
          status: settledStatus({ ...draft, status: 'ISSUED' }, today),
          issueDate: asOf,
          issuedById: target.actorId,
          version: { increment: 1 },
        },
      });
      await this.ledger.post(tx, [
        {
          schoolId: target.schoolId,
          branchId: target.branchId,
          studentId: line.studentId,
          invoiceId: draft.id,
          type: 'CHARGE',
          amountMinor: BigInt(line.amountMinor),
          refType: OPENING_REF,
          refId: draft.id,
          reason: `Opening balance as of ${line.asOfDate} (import ${target.importId})`,
          createdById: target.actorId,
        },
      ]);
      await this.settlement.applyAdvance(tx, line.studentId);
      invoiceIds.push(draft.id);
    }
    const [charged, paid] = await Promise.all([
      tx.ledgerEntry.aggregate({
        where: {
          refType: OPENING_REF,
          refId: { in: invoiceIds },
          type: 'CHARGE',
        },
        _sum: { amountMinor: true },
      }),
      tx.invoice.aggregate({
        where: { id: { in: invoiceIds } },
        _sum: { paidMinor: true },
      }),
    ]);
    return {
      created: { invoices: invoiceIds },
      reconciliation: {
        created: invoiceIds.length,
        ...reconcileOpening(plan, Number(charged._sum.amountMinor ?? 0n)),
        advanceAppliedMinor: Number(paid._sum.paidMinor ?? 0n),
      },
    };
  }

  /**
   * The ledger is append-only: unpaid opening invoices are CANCELLED with a
   * CANCELLATION entry; any money on them → 409.
   */
  async revert(
    tx: Db,
    target: ImportTarget,
    created: Record<string, unknown>,
  ): Promise<{ userIds?: string[] }> {
    const invoiceIds = ids(created, 'invoices');
    const invoices = await tx.invoice.findMany({
      where: { id: { in: invoiceIds } },
      select: {
        id: true,
        invoiceNo: true,
        status: true,
        paidMinor: true,
        _count: { select: { allocations: true, proofs: true } },
      },
    });
    const report = new ReferenceReport();
    for (const invoice of invoices) {
      if (invoice.status === 'CANCELLED') continue;
      if (invoice.paidMinor > 0n || invoice._count.allocations > 0) {
        report.add('Invoice', invoice.id, invoice.invoiceNo, 'payments');
      }
      if (invoice._count.proofs > 0) {
        report.add('Invoice', invoice.id, invoice.invoiceNo, 'payment proofs');
      }
    }
    report.throwIfAny();
    for (const invoice of invoices) {
      if (invoice.status === 'CANCELLED') continue;
      await this.invoices.cancel(
        tx,
        invoice.id,
        `Import ${target.importId} reverted`,
        target.actorId,
      );
    }
    return {};
  }
}
