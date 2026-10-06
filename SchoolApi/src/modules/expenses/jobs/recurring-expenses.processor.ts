import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import type { Expense } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { schoolDate } from '../../../core/common/school-time';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { periodOf } from '../../finance-core/period';
import { isDuplicate } from '../unique-conflict';
import { copyDates, dueTemplates } from './recurring-due';

export const RECURRING_EXPENSES_JOB = 'expenses.recurring';

/** 1st of each month: a DRAFT copy of every due recurring expense. */
@Injectable()
export class RecurringExpensesProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = RECURRING_EXPENSES_JOB;
  private readonly logger = new Logger(RecurringExpensesProcessor.name);

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '30 0 1 * *',
    });
  }

  async process(): Promise<void> {
    const month = periodOf(parseDate(schoolDate()));
    const templates = await this.prisma.expense.findMany({
      where: {
        recurringMonthly: true,
        recurringParentId: null,
        status: { not: 'REJECTED' },
        OR: [{ recurringUntil: null }, { recurringUntil: { gte: month } }],
      },
    });
    for (const template of dueTemplates(templates, month)) {
      try {
        await this.copy(template, month);
      } catch (error) {
        if (isDuplicate(error)) continue;
        this.logger.warn(
          `Recurring copy of ${template.id} failed: ${String(error)}`,
        );
      }
    }
  }

  private async copy(template: Expense, month: string): Promise<void> {
    const dates = copyDates(template, month);
    const row = await this.prisma.expense.create({
      data: {
        schoolId: template.schoolId,
        branchId: template.branchId,
        categoryId: template.categoryId,
        vendorId: template.vendorId,
        title: template.title,
        amountMinor: template.amountMinor,
        currency: template.currency,
        billDate: dates.billDate,
        dueDate: dates.dueDate,
        notes: template.notes,
        recurringParentId: template.id,
        recurringPeriod: month,
        createdById: template.createdById,
      },
    });
    this.audit.stage({
      action: 'expense.recurring_copy',
      entityType: 'Expense',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: { recurringParentId: template.id, recurringPeriod: month },
    });
    await this.notifications.notify({
      userIds: [template.createdById],
      category: 'EXPENSE',
      title: 'Recurring expense drafted',
      body: `${template.title} for ${month} is ready to review and submit.`,
      data: { expenseId: row.id, month },
    });
  }
}
