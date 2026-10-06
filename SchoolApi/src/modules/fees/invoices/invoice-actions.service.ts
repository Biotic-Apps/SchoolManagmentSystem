import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { conflict, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { principalOrAbove } from '../../finance-core/approval-routing';
import { InvoiceLedgerService } from '../../finance-core/invoice-ledger.service';
import { FeeAccessService } from '../shared/fee-access.service';
import type { InvoiceDto } from './dto/invoice.dto';
import type {
  CancelInvoiceDto,
  CreateAdhocInvoiceDto,
} from './dto/invoice-input.dto';
import { InvoiceReader } from './invoice-reader.service';

/** Ad-hoc invoices and cancellation (issued invoices need INVOICE_CANCEL approval). */
@Injectable()
export class InvoiceActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reader: InvoiceReader,
    private readonly access: FeeAccessService,
    private readonly invoices: InvoiceLedgerService,
    private readonly approvals: ApprovalService,
    private readonly audit: AuditService,
  ) {}

  async createAdhoc(
    user: AuthUser,
    scope: Scope,
    dto: CreateAdhocInvoiceDto,
  ): Promise<InvoiceDto> {
    const student = await this.access.manageStudent(scope, dto.studentId);
    if (!student.active) throw conflict('Student has no active enrollment');
    const headIds = [...new Set(dto.lines.map((l) => l.feeHeadId))];
    const heads = await this.prisma.feeHead.count({
      where: {
        id: { in: headIds },
        schoolId: student.schoolId,
        status: 'ACTIVE',
        system: false,
      },
    });
    if (heads !== headIds.length) throw invalid('Unknown or system fee head');
    const active = student.active;
    const invoice = await this.prisma.$transaction((tx) =>
      this.invoices.create(tx, {
        schoolId: student.schoolId,
        branchId: active.branchId,
        sessionId: active.sessionId,
        studentId: student.studentId,
        sectionId: active.sectionId,
        classId: active.classId,
        period: null,
        source: 'ADHOC',
        dueDate: parseDate(dto.dueDate),
        lines: dto.lines.map((line) => ({
          feeHeadId: line.feeHeadId,
          description: line.description.trim(),
          amountMinor: BigInt(line.amountMinor),
        })),
        createdById: user.id,
      }),
    );
    this.audit.stage({
      action: 'invoice.create_adhoc',
      entityType: 'Invoice',
      entityId: invoice.id,
      schoolId: invoice.schoolId,
      branchId: invoice.branchId,
      after: { invoiceNo: invoice.invoiceNo, totalMinor: invoice.totalMinor },
    });
    return this.reader.dto(invoice.id);
  }

  /**
   * DRAFT: cancelled at once. ISSUED/OVERDUE without payments: INVOICE_CANCEL
   * approval (principal, or super admin for a principal). Paid → 409.
   */
  async cancel(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: CancelInvoiceDto,
  ): Promise<InvoiceDto> {
    const invoice = await this.reader.read(scope, id);
    await this.access.manageBranch(scope, invoice.branchId);
    const reason = dto.reason.trim();
    if (
      invoice.paidMinor > 0n ||
      ['PAID', 'PARTIALLY_PAID'].includes(invoice.status)
    )
      throw conflict('Invoice has payments; reverse them first');
    if (invoice.status === 'CANCELLED')
      throw conflict('Invoice is already cancelled');
    if (invoice.status === 'DRAFT') {
      await this.prisma.$transaction((tx) =>
        this.invoices.cancel(tx, id, reason, user.id),
      );
      this.stageCancel(invoice, 'invoice.cancel', reason);
      return this.reader.dto(id);
    }
    if (invoice.cancelApprovalId) {
      const pending = await this.prisma.approvalRequest.findFirst({
        where: { id: invoice.cancelApprovalId, status: 'PENDING' },
      });
      if (pending) throw conflict('A cancellation is already pending');
    }
    await this.prisma.$transaction(async (tx) => {
      const approval = await this.approvals.create(
        {
          type: 'INVOICE_CANCEL',
          entityType: 'Invoice',
          entityId: id,
          schoolId: invoice.schoolId,
          branchId: invoice.branchId,
          requestedById: user.id,
          title: `Cancel invoice ${invoice.invoiceNo}`,
          payload: { invoiceId: id, invoiceNo: invoice.invoiceNo },
          reason,
          amountMinor: invoice.totalMinor,
          steps: principalOrAbove(user.activeRole),
        },
        tx,
      );
      await tx.invoice.update({
        where: { id },
        data: { cancelApprovalId: approval.id, cancelReason: reason },
      });
    });
    this.stageCancel(invoice, 'invoice.cancel_request', reason);
    return this.reader.dto(id);
  }

  private stageCancel(
    invoice: { id: string; schoolId: string; branchId: string; status: string },
    action: string,
    reason: string,
  ) {
    this.audit.stage({
      action,
      entityType: 'Invoice',
      entityId: invoice.id,
      schoolId: invoice.schoolId,
      branchId: invoice.branchId,
      before: { status: invoice.status },
      after: { reason },
    });
  }
}
