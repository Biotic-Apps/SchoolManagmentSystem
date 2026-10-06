import { Injectable } from '@nestjs/common';
import { formatDate, parseDate } from '../../../core/common/dates';
import { schoolDate } from '../../../core/common/school-time';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { balanceOf, OPEN_STATUSES } from '../../finance-core/invoice-state';
import { LedgerService } from '../../finance-core/ledger.service';
import { sumMinor } from '../../finance-core/money';
import { FeeAccessService } from '../shared/fee-access.service';
import type { FeeSummaryDto } from './dto/student-fees.dto';

/** Balance card of a student (parents and staff). */
@Injectable()
export class FeeSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FeeAccessService,
    private readonly ledger: LedgerService,
    private readonly settings: BranchSettingsReader,
  ) {}

  async summary(scope: Scope, studentId: string): Promise<FeeSummaryDto> {
    const student = await this.access.readStudent(scope, studentId);
    const today = parseDate(schoolDate());
    const [open, advance, last, balance] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { studentId, status: { in: OPEN_STATUSES } },
        select: {
          id: true,
          invoiceNo: true,
          dueDate: true,
          totalMinor: true,
          paidMinor: true,
          currency: true,
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.payment.aggregate({
        where: { studentId, status: 'RECORDED' },
        _sum: { unallocatedMinor: true },
      }),
      this.prisma.payment.findFirst({
        where: { studentId, status: 'RECORDED' },
        orderBy: [{ receivedOn: 'desc' }, { createdAt: 'desc' }],
      }),
      this.ledger.balance(studentId),
    ]);
    const due = open.filter((i) => balanceOf(i) > 0n);
    const next = due[0];
    const branchId = student.branchId;
    const gateway = branchId
      ? await this.settings.get<string>(branchId, 'fees.onlineGateway')
      : 'NONE';
    const proofUpload = branchId
      ? await this.settings.get<boolean>(branchId, 'fees.proofUpload')
      : false;
    return {
      totalDueMinor: Number(sumMinor(due.map(balanceOf))),
      overdueMinor: Number(
        sumMinor(due.filter((i) => i.dueDate < today).map(balanceOf)),
      ),
      advanceMinor: Number(advance._sum.unallocatedMinor ?? 0n),
      balanceMinor: Number(balance),
      lastPayment: last
        ? {
            paymentId: last.id,
            receiptNo: last.receiptNo,
            amountMinor: Number(last.amountMinor),
            paidOn: formatDate(last.receivedOn),
          }
        : null,
      nextDue: next
        ? {
            invoiceId: next.id,
            invoiceNo: next.invoiceNo,
            dueDate: formatDate(next.dueDate),
            balanceMinor: Number(balanceOf(next)),
          }
        : null,
      currency: next?.currency ?? last?.currency ?? 'PKR',
      onlineGatewayEnabled: gateway !== 'NONE',
      proofUploadEnabled: proofUpload === true,
    };
  }
}
