import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { isPrismaKnownError } from '../../../core/common/errors/prisma-error.mapper';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { NewInvoiceLine } from '../../finance-core/invoice-ledger.service';
import { InvoiceLedgerService } from '../../finance-core/invoice-ledger.service';
import { percentOf, sumMinor } from '../../finance-core/money';
import { systemFeeHead } from '../../finance-core/system-fee-heads';
import { ACTIVITY_REF, ActivityFeesService } from './activity-fees.service';
import { applyConcessions, concessionTotal } from './concession-math';
import { dueItems, invoiceDueDate } from './due-lines';
import {
  GenerationContextService,
  type GenerateInvoicesInput,
} from './generation-context.service';

export interface GenerationResult {
  count: number;
  skipped: number;
}

/**
 * Creates DRAFT invoices for a branch, session and month from approved plan
 * snapshots, active concessions and activity fees. Idempotent per
 * student + period (the partial unique index backs the skip).
 */
@Injectable()
export class InvoiceGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: GenerationContextService,
    private readonly activities: ActivityFeesService,
    private readonly invoices: InvoiceLedgerService,
    private readonly audit: AuditService,
  ) {}

  async generate(input: GenerateInvoicesInput): Promise<GenerationResult> {
    const { period } = input;
    const calendar = await this.context.calendar(input.sessionId);
    const plans = await this.context.plans(input);
    const enrollments = await this.context.enrollments(input);
    const studentIds = enrollments.map((e) => e.studentId);
    const invoiced = await this.context.alreadyInvoiced(studentIds, period);
    const pending = enrollments.filter((e) => !invoiced.has(e.studentId));
    const pendingIds = pending.map((e) => e.studentId);
    const allItems = [...plans.values()].flatMap((p) => p.snapshot.items);
    const onceHeads = allItems
      .filter((i) => i.frequency === 'ONCE')
      .map((i) => i.feeHeadId);
    const [concessions, onceBilled, charges, headNames] = await Promise.all([
      this.context.concessions(pendingIds, period),
      this.context.onceBilled(pendingIds, input.sessionId, onceHeads),
      this.activities.chargesByStudent(input.branchId, period, pendingIds),
      this.context.headNames([...new Set(allItems.map((i) => i.feeHeadId))]),
    ]);
    // Load sibling discount rules and indices for all pending students
    const schoolId = pending.length > 0 ? pending[0].schoolId : null;
    const [discountRules, siblingIndices] = await Promise.all([
      schoolId
        ? this.context.siblingDiscountRules(schoolId)
        : Promise.resolve([]),
      schoolId
        ? this.context.siblingIndices(schoolId, pendingIds)
        : Promise.resolve(new Map<string, number>()),
    ]);
    const activityHead =
      charges.size > 0 && pending.length > 0
        ? await systemFeeHead(this.prisma, pending[0].schoolId, 'ACTIVITY')
        : null;

    let count = 0;
    let skipped = invoiced.size;
    for (const student of pending) {
      const plan = plans.get(student.classId);
      const billedOnce = new Set(
        onceHeads.filter((h) => onceBilled.has(`${student.studentId}:${h}`)),
      );
      const items = plan
        ? dueItems(plan.snapshot.items, period, calendar, billedOnce)
        : [];
      const planLines: NewInvoiceLine[] = items.map((item) => ({
        feeHeadId: item.feeHeadId,
        description: `${headNames.get(item.feeHeadId) ?? 'Fee'} (${period})`,
        amountMinor: item.amountMinor,
      }));
      const activityLines: NewInvoiceLine[] = activityHead
        ? (charges.get(student.studentId) ?? []).map((charge) => ({
            feeHeadId: activityHead.id,
            description: `Activity: ${charge.title}`,
            amountMinor: charge.feeMinor,
            refType: ACTIVITY_REF,
            refId: charge.activityId,
          }))
        : [];
      const lines = [...planLines, ...activityLines];
      if (lines.length === 0) continue;
      const applied = applyConcessions(
        planLines,
        (concessions.get(student.studentId) ?? []).map((c) => ({
          id: c.id,
          feeHeadId: c.feeHeadId,
          type: c.type,
          value: c.value,
        })),
      );
      // Compute sibling discount
      const childIndex = siblingIndices.get(student.studentId) ?? 1;
      const siblingPercent =
        discountRules.find((r) => r.childIndex === childIndex)?.percentOff ?? 0;
      const subtotalAfterConcession =
        sumMinor(lines.map((l) => l.amountMinor)) - concessionTotal(applied);
      const siblingDiscount =
        siblingPercent > 0
          ? percentOf(subtotalAfterConcession, siblingPercent)
          : 0n;
      try {
        const invoice = await this.prisma.$transaction((tx) =>
          this.invoices.create(tx, {
            schoolId: student.schoolId,
            branchId: input.branchId,
            sessionId: input.sessionId,
            studentId: student.studentId,
            sectionId: student.sectionId,
            classId: student.classId,
            period,
            source: 'GENERATED',
            dueDate: invoiceDueDate(items, period),
            lines,
            concessions: applied,
            siblingDiscountMinor: siblingDiscount,
            planId: plan?.id ?? null,
            lateFeeRule: plan?.snapshot.lateFee ?? null,
            createdById: input.actorId,
          }),
        );
        count += 1;
        this.audit.stage({
          action: 'invoice.generate',
          entityType: 'Invoice',
          entityId: invoice.id,
          schoolId: invoice.schoolId,
          branchId: invoice.branchId,
          actorId: input.actorId ?? undefined,
          after: {
            invoiceNo: invoice.invoiceNo,
            period,
            totalMinor: invoice.totalMinor,
            planRevision: plan?.snapshot.revision ?? null,
          },
        });
      } catch (error) {
        if (isPrismaKnownError(error) && error.code === 'P2002') {
          skipped += 1;
          continue;
        }
        throw error;
      }
    }
    return { count, skipped };
  }
}
