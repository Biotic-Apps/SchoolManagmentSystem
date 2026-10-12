import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { toJson } from '../../../core/common/prisma-json';
import { schoolDate } from '../../../core/common/school-time';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { balanceOf, OPEN_STATUSES } from '../../finance-core/invoice-state';
import { LedgerService } from '../../finance-core/ledger.service';
import { minBig } from '../../finance-core/money';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { PaymentFollowup } from '../payments/payment-followup';
import { PaymentRecorder } from '../payments/payment-recorder';
import type {
  GatewayCallbackResultDto,
  InitiateOnlineResultDto,
  OnlinePaymentStatusDto,
} from './dto/online-payment.dto';
import type { GatewayCallbackRequest } from './payment-gateway';
import { PaymentGatewayRegistry } from './payment-gateway.registry';

/** Parent online payment through the configured gateway adapter (contract B3). */
@Injectable()
export class OnlinePaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: PaymentGatewayRegistry,
    private readonly settings: BranchSettingsReader,
    private readonly ledger: LedgerService,
    private readonly recorder: PaymentRecorder,
    private readonly followup: PaymentFollowup,
    private readonly people: SchoolPeopleService,
    private readonly audit: AuditService,
  ) {}

  async initiate(
    scope: Scope,
    invoiceId: string,
  ): Promise<InitiateOnlineResultDto> {
    if (!scope.guardian) throw forbidden('Online payment is for parents');
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice || !scope.canAccessStudent(invoice.studentId))
      throw notFound('Invoice');
    if (!OPEN_STATUSES.includes(invoice.status))
      throw conflict(`The invoice is ${invoice.status.toLowerCase()}`);
    const key = await this.settings.get<string>(
      invoice.branchId,
      'fees.onlineGateway',
    );
    if (!key || key === 'NONE') {
      throw new AppError(
        ErrorCode.GATEWAY_DISABLED,
        'Online payment is not available; pay at the school office or upload a proof',
      );
    }
    const gateway = this.registry.get(key);
    const result = await gateway.initiate(invoice);

    // Track the initiated payment
    const onlinePayment = await this.prisma.onlinePayment.create({
      data: {
        schoolId: invoice.schoolId,
        branchId: invoice.branchId,
        invoiceId: invoice.id,
        gateway: key as 'JAZZCASH' | 'EASYPAISA',
        amountMinor: invoice.totalMinor,
        currency: invoice.currency,
        redirectUrl: result.redirectUrl,
      },
    });

    return {
      gateway: key,
      redirectUrl: result.redirectUrl,
      formData: (result as { formData?: Record<string, string> }).formData,
      onlinePaymentId: onlinePayment.id,
    };
  }

  async callback(
    gatewayKey: string,
    request: GatewayCallbackRequest,
  ): Promise<GatewayCallbackResultDto> {
    const gateway = this.registry.find(gatewayKey);
    if (!gateway) throw notFound('Payment gateway');
    const verified = await gateway.verifyCallback(request);

    // Store webhook payload for the online payment record
    if (verified) {
      await this.updateOnlinePayment(verified.invoiceId, gatewayKey, {
        status: 'SUCCESS',
        gatewayRef: verified.reference,
        webhookPayload: toJson(request.body),
        returnedAt: new Date(),
      });
    }

    if (!verified) throw invalid('Callback could not be verified');
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: verified.invoiceId },
    });
    if (!invoice) throw notFound('Invoice');
    const receivedById = await this.receiver(invoice.branchId);

    const { payment, created } = await this.prisma.$transaction(async (tx) => {
      await this.ledger.lockStudent(tx, invoice.studentId);
      const existing = await tx.payment.findFirst({
        where: { gateway: gateway.key, gatewayRef: verified.reference },
      });
      if (existing) return { payment: existing, created: false };
      const current = await tx.invoice.findUniqueOrThrow({
        where: { id: invoice.id },
      });
      const toInvoice = OPEN_STATUSES.includes(current.status)
        ? minBig(verified.amountMinor, balanceOf(current))
        : 0n;
      const recorded = await this.recorder.record(tx, {
        studentId: invoice.studentId,
        branchId: invoice.branchId,
        amountMinor: verified.amountMinor,
        method: 'ONLINE',
        reference: verified.reference,
        receivedOn: parseDate(schoolDate()),
        receivedById,
        allocations:
          toInvoice > 0n
            ? [{ invoiceId: invoice.id, amountMinor: toInvoice }]
            : [],
        gateway: { key: gateway.key, ref: verified.reference },
      });

      // Link the online payment record to the created payment
      await tx.onlinePayment.updateMany({
        where: { invoiceId: invoice.id, gateway: gatewayKey as 'JAZZCASH' | 'EASYPAISA', status: 'INITIATED' },
        data: { paymentId: recorded.id, status: 'SUCCESS' },
      });

      return { payment: recorded, created: true };
    });
    if (created) {
      this.audit.stage({
        action: 'payment.online',
        entityType: 'Payment',
        entityId: payment.id,
        schoolId: payment.schoolId,
        branchId: payment.branchId,
        actorId: receivedById,
        after: {
          gateway: gateway.key,
          reference: verified.reference,
          amountMinor: Number(payment.amountMinor),
          invoiceId: invoice.id,
        },
      });
      const student = await this.prisma.student.findUniqueOrThrow({
        where: { id: payment.studentId },
        select: { firstName: true, lastName: true },
      });
      await this.followup.afterRecord(
        { id: receivedById },
        payment,
        `${student.firstName} ${student.lastName}`,
      );
    }
    return {
      received: true,
      paymentId: payment.id,
      receiptNo: payment.receiptNo,
    };
  }

  async getStatus(
    scope: Scope,
    onlinePaymentId: string,
  ): Promise<OnlinePaymentStatusDto> {
    const record = await this.prisma.onlinePayment.findUnique({
      where: { id: onlinePaymentId },
    });
    if (!record) throw notFound('Online payment');

    // Parents can only see their own children's payments
    if (scope.guardian) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: record.invoiceId },
        select: { studentId: true },
      });
      if (!invoice || !scope.canAccessStudent(invoice.studentId))
        throw notFound('Online payment');
    } else {
      // Staff must have access to the school
      if (!scope.schoolIds.includes(record.schoolId))
        throw notFound('Online payment');
    }

    return {
      id: record.id,
      gateway: record.gateway,
      status: record.status,
      amountMinor: Number(record.amountMinor),
      currency: record.currency,
      gatewayRef: record.gatewayRef,
      paymentId: record.paymentId,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async listForInvoice(
    scope: Scope,
    invoiceId: string,
  ): Promise<OnlinePaymentStatusDto[]> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) throw notFound('Invoice');
    if (scope.guardian && !scope.canAccessStudent(invoice.studentId))
      throw notFound('Invoice');
    if (!scope.guardian && !scope.schoolIds.includes(invoice.schoolId))
      throw notFound('Invoice');

    const records = await this.prisma.onlinePayment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return records.map((r) => ({
      id: r.id,
      gateway: r.gateway,
      status: r.status,
      amountMinor: Number(r.amountMinor),
      currency: r.currency,
      gatewayRef: r.gatewayRef,
      paymentId: r.paymentId,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  /** Online money has no cashier: booked to the branch principal (else a super admin). */
  private async receiver(branchId: string): Promise<string> {
    const principal = await this.people.principalOf(branchId);
    if (principal) return principal;
    const [admin] = await this.people.superAdmins();
    if (!admin)
      throw conflict('No principal or super admin to book the payment');
    return admin;
  }

  private async updateOnlinePayment(
    invoiceId: string,
    gateway: string,
    data: {
      status: 'SUCCESS' | 'FAILED' | 'EXPIRED';
      gatewayRef?: string;
      webhookPayload?: unknown;
      returnedAt?: Date;
    },
  ): Promise<void> {
    await this.prisma.onlinePayment.updateMany({
      where: {
        invoiceId,
        gateway: gateway as 'JAZZCASH' | 'EASYPAISA',
        status: 'INITIATED',
      },
      data: {
        status: data.status,
        gatewayRef: data.gatewayRef ?? undefined,
        webhookPayload: data.webhookPayload
          ? toJson(data.webhookPayload)
          : undefined,
        returnedAt: data.returnedAt ?? undefined,
      },
    });
  }
}
