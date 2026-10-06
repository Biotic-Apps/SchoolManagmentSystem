import { Injectable, Logger } from '@nestjs/common';
import type { Invoice } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate } from '../../../core/common/dates';
import { AppError } from '../../../core/common/errors/app-error';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { InvoiceLedgerService } from '../../finance-core/invoice-ledger.service';
import { formatMinor } from '../../finance-core/money';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { InvoiceIssueResultDto } from './dto/invoice.dto';

/**
 * DRAFT → ISSUED, one transaction per invoice (ledger posting + advance
 * credit); failures are reported per invoice and do not stop the batch.
 */
@Injectable()
export class InvoiceIssueService {
  private readonly logger = new Logger(InvoiceIssueService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoiceLedgerService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async issue(
    user: AuthUser,
    scope: Scope,
    invoiceIds: string[],
  ): Promise<InvoiceIssueResultDto> {
    const rows = await this.prisma.invoice.findMany({
      where: { id: { in: invoiceIds } },
      select: { id: true, schoolId: true, branchId: true, status: true },
    });
    const byId = new Map(rows.map((row) => [row.id, row]));
    const issued: Invoice[] = [];
    const failed: { id: string; reason: string }[] = [];
    for (const id of invoiceIds) {
      const row = byId.get(id);
      if (!row || scope.guardian) {
        failed.push({ id, reason: 'Invoice not found' });
        continue;
      }
      if (
        !scope.canManageBranch({ id: row.branchId, schoolId: row.schoolId })
      ) {
        failed.push({ id, reason: 'Outside your scope' });
        continue;
      }
      if (row.status !== 'DRAFT') {
        failed.push({ id, reason: `Invoice is ${row.status}, not DRAFT` });
        continue;
      }
      try {
        const invoice = await this.prisma.$transaction((tx) =>
          this.invoices.issue(tx, id, user.id),
        );
        issued.push(invoice);
        this.audit.stage({
          action: 'invoice.issue',
          entityType: 'Invoice',
          entityId: id,
          schoolId: invoice.schoolId,
          branchId: invoice.branchId,
          before: { status: 'DRAFT' },
          after: { status: invoice.status, totalMinor: invoice.totalMinor },
        });
      } catch (error) {
        const reason =
          error instanceof AppError ? error.message : 'Could not issue';
        if (!(error instanceof AppError)) this.logger.error(error);
        failed.push({ id, reason });
      }
    }
    await this.notify(issued);
    return {
      issued: issued.length,
      issuedIds: issued.map((i) => i.id),
      failed,
    };
  }

  private async notify(invoices: Invoice[]): Promise<void> {
    if (invoices.length === 0) return;
    const guardians = await this.people.guardiansByStudent([
      ...new Set(invoices.map((i) => i.studentId)),
    ]);
    for (const invoice of invoices) {
      await this.notifications.notify({
        userIds: guardians.get(invoice.studentId) ?? [],
        category: 'FEE',
        title: 'Fee invoice issued',
        body: `Invoice ${invoice.invoiceNo} of ${formatMinor(invoice.totalMinor, invoice.currency)} is due on ${formatDate(invoice.dueDate)}.`,
        data: { invoiceId: invoice.id, studentId: invoice.studentId },
      });
    }
  }
}
