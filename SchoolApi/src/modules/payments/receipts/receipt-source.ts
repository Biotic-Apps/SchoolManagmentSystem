import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { monthLabel, printDate } from '../../fees/challans/challan-data';
import { amountInWords } from '../../fees/challans/amount-in-words';
import { LedgerService } from '../../finance-core/ledger.service';
import { sumMinor } from '../../finance-core/money';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { ReceiptData } from './receipt-data';

/** Loads one payment as printed on its receipts (A4 and 80 mm thermal). */
@Injectable()
export class ReceiptSource {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: BranchSettingsReader,
    private readonly people: SchoolPeopleService,
    private readonly ledger: LedgerService,
  ) {}

  async load(paymentId: string): Promise<ReceiptData> {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNo: true },
        },
        allocations: {
          include: {
            invoice: {
              select: { invoiceNo: true, period: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        refunds: { where: { status: 'APPROVED' } },
      },
    });
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: payment.branchId },
      include: { school: { select: { name: true } } },
    });
    const [names, footer, balance, classLabel] = await Promise.all([
      this.people.names([payment.receivedById]),
      this.settings.get<string>(branch.id, 'fees.receiptFooter'),
      this.ledger.balance(payment.studentId),
      this.classLabel(payment.studentId),
    ]);
    const allocated = sumMinor(payment.allocations.map((a) => a.amountMinor));
    const refunded = sumMinor(payment.refunds.map((r) => r.amountMinor));
    return {
      schoolName: branch.school.name,
      branchLine: [branch.name, branch.address, branch.phone]
        .filter(Boolean)
        .join(', '),
      receiptNo: payment.receiptNo,
      receivedOn: printDate(payment.receivedOn),
      studentName: `${payment.student.firstName} ${payment.student.lastName}`,
      admissionNo: payment.student.admissionNo,
      classLabel,
      method: payment.method,
      reference: payment.reference,
      amountMinor: payment.amountMinor,
      advanceMinor: payment.amountMinor - allocated - refunded,
      refundedMinor: refunded,
      balanceMinor: balance,
      currency: payment.currency,
      receivedBy: names.get(payment.receivedById) ?? '-',
      allocations: payment.allocations.map((a) => ({
        invoiceNo: a.invoice.invoiceNo,
        period: a.invoice.period ? monthLabel(a.invoice.period) : '',
        amountMinor: a.amountMinor,
        reversed: a.reversed,
      })),
      reversed: payment.status === 'REVERSED',
      reversalReason: payment.reversalReason,
      amountInWords: amountInWords(payment.amountMinor, payment.currency),
      footer: footer ?? '',
    };
  }

  /** "Class 5 - A" of the active (else latest) enrollment. */
  private async classLabel(studentId: string): Promise<string> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      select: {
        section: {
          select: { name: true, schoolClass: { select: { name: true } } },
        },
      },
    });
    return enrollment
      ? `${enrollment.section.schoolClass.name} - ${enrollment.section.name}`
      : '';
  }
}
