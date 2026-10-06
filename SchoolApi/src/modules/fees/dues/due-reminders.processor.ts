import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { balanceOf, OPEN_STATUSES } from '../../finance-core/invoice-state';
import { formatMinor } from '../../finance-core/money';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { fullName } from '../../students/student.mapper';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../tasks/async-task.service';

export const DUE_REMINDERS_JOB = 'fees.dueReminders';

export interface DueRemindersInput {
  studentIds: string[];
}

/** Notifies guardians (FEE) of each student's open balance; result `{ count }`. */
@Injectable()
export class DueRemindersProcessor
  implements JobProcessor<TaskJobData<DueRemindersInput>>, OnModuleInit
{
  readonly queue = QUEUES.NOTIFICATIONS;
  readonly name = DUE_REMINDERS_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly tasks: AsyncTaskService,
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<DueRemindersInput>): Promise<void> {
    return this.tasks.track(input.taskId, async () => ({
      count: await this.remind(input.studentIds),
    }));
  }

  private async remind(studentIds: string[]): Promise<number> {
    const [invoices, students, guardians] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { studentId: { in: studentIds }, status: { in: OPEN_STATUSES } },
        select: {
          studentId: true,
          totalMinor: true,
          paidMinor: true,
          currency: true,
        },
      }),
      this.prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, firstName: true, lastName: true },
      }),
      this.people.guardiansByStudent(studentIds),
    ]);
    const due = new Map<string, { amount: bigint; currency: string }>();
    for (const invoice of invoices) {
      const current = due.get(invoice.studentId);
      due.set(invoice.studentId, {
        amount: (current?.amount ?? 0n) + balanceOf(invoice),
        currency: invoice.currency,
      });
    }
    let count = 0;
    for (const student of students) {
      const balance = due.get(student.id);
      const userIds = guardians.get(student.id) ?? [];
      if (!balance || balance.amount <= 0n || userIds.length === 0) continue;
      await this.notifications.notify({
        userIds,
        category: 'FEE',
        title: 'Fee reminder',
        body: `Outstanding fee for ${fullName(student)}: ${formatMinor(balance.amount, balance.currency)}. Please pay at the earliest.`,
        data: { studentId: student.id },
      });
      count += 1;
    }
    return count;
  }
}
