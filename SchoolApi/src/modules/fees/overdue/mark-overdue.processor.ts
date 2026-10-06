import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import type { AuditEntry } from '../../../core/audit/audit-entry';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate, parseDate } from '../../../core/common/dates';
import { schoolDate } from '../../../core/common/school-time';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { InvoiceLedgerService } from '../../finance-core/invoice-ledger.service';
import { InvoiceSettlementService } from '../../finance-core/invoice-settlement.service';
import { OPEN_STATUSES } from '../../finance-core/invoice-state';
import { LedgerService } from '../../finance-core/ledger.service';
import { lateFeeDue } from './late-fee';

export const MARK_OVERDUE_JOB = 'fees.markOverdue';
const BATCH = 200;

/** Daily: open invoices past due → OVERDUE, then the late fee once when due. */
@Injectable()
export class MarkOverdueProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = MARK_OVERDUE_JOB;
  private readonly logger = new Logger(MarkOverdueProcessor.name);

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly settlement: InvoiceSettlementService,
    private readonly invoices: InvoiceLedgerService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '15 0 * * *',
    });
  }

  async process(): Promise<void> {
    const today = parseDate(schoolDate());
    let cursor: string | undefined;
    for (;;) {
      const batch = await this.prisma.invoice.findMany({
        where: { status: { in: OPEN_STATUSES }, dueDate: { lt: today } },
        orderBy: { id: 'asc' },
        take: BATCH,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      if (batch.length === 0) return;
      for (const invoice of batch) {
        try {
          await this.handle(invoice.id, today);
        } catch (error) {
          this.logger.warn(
            `Overdue ${invoice.invoiceNo} failed: ${String(error)}`,
          );
        }
      }
      cursor = batch[batch.length - 1].id;
    }
  }

  /** Audit entries are written after the commit (jobs write them at once). */
  private async handle(invoiceId: string, today: Date): Promise<void> {
    const entries: AuditEntry[] = [];
    await this.prisma.$transaction(async (tx) => {
      const found = await tx.invoice.findUniqueOrThrow({
        where: { id: invoiceId },
      });
      await this.ledger.lockStudent(tx, found.studentId);
      const before = await tx.invoice.findUniqueOrThrow({
        where: { id: invoiceId },
      });
      if (!OPEN_STATUSES.includes(before.status)) return;
      await this.settlement.refreshStatus(tx, invoiceId);
      const invoice = await tx.invoice.findUniqueOrThrow({
        where: { id: invoiceId },
      });
      if (invoice.status !== before.status) {
        entries.push({
          action: 'invoice.overdue',
          entityType: 'Invoice',
          entityId: invoice.id,
          schoolId: invoice.schoolId,
          branchId: invoice.branchId,
          before: { status: before.status },
          after: { status: invoice.status },
        });
      }
      const fee = lateFeeDue(invoice, today);
      if (fee <= 0n) return;
      const reason = `Late fee: not paid by ${formatDate(invoice.dueDate)}`;
      await this.invoices.addLateFee(tx, invoice.id, fee, reason);
      entries.push({
        action: 'invoice.late_fee',
        entityType: 'Invoice',
        entityId: invoice.id,
        schoolId: invoice.schoolId,
        branchId: invoice.branchId,
        after: { lateFeeMinor: fee, reason },
      });
    });
    for (const entry of entries) this.audit.stage(entry);
  }
}
