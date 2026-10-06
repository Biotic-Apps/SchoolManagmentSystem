import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { FileRefService } from '../../../core/files/file-ref.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { balanceOf, OPEN_STATUSES } from '../../finance-core/invoice-state';
import { LedgerService } from '../../finance-core/ledger.service';
import { formatMinor } from '../../finance-core/money';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { CreateProofDto, ProofDto } from './dto/proof.dto';
import { ProofReader } from './proof-reader';

/**
 * Parent uploads a payment proof (contract B3). The proof never touches the
 * invoice or the ledger: only a verified proof records a payment.
 */
@Injectable()
export class ProofSubmitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly settings: BranchSettingsReader,
    private readonly files: FileRefService,
    private readonly reader: ProofReader,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async submit(
    user: AuthUser,
    scope: Scope,
    dto: CreateProofDto,
  ): Promise<ProofDto> {
    if (!scope.guardian)
      throw forbidden('Payment proofs are uploaded by parents');
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
    });
    if (!invoice || !scope.canAccessStudent(invoice.studentId))
      throw notFound('Invoice');
    if (!OPEN_STATUSES.includes(invoice.status))
      throw conflict(`The invoice is ${invoice.status.toLowerCase()}`);
    const allowed = await this.settings.get<boolean>(
      invoice.branchId,
      'fees.proofUpload',
    );
    if (!allowed) throw forbidden('Proof upload is turned off for this branch');
    const paidOn = parseDate(dto.paidOn);
    if (paidOn > parseDate(schoolDate()))
      throw invalid('paidOn cannot be in the future');
    await this.files.assertUsable(dto.fileId, {
      schoolId: invoice.schoolId,
      userId: user.id,
      purposes: ['DOCUMENT', 'ATTACHMENT'],
    });
    const amount = BigInt(dto.amountMinor);

    const proof = await this.prisma.$transaction(async (tx) => {
      await this.ledger.lockStudent(tx, invoice.studentId);
      const current = await tx.invoice.findUniqueOrThrow({
        where: { id: invoice.id },
      });
      if (amount > balanceOf(current)) {
        throw invalid('Amount is more than the invoice balance', {
          balanceMinor: Number(balanceOf(current)),
        });
      }
      const open = await tx.paymentProof.count({
        where: { invoiceId: invoice.id, status: 'SUBMITTED' },
      });
      if (open > 0)
        throw conflict('A proof for this invoice is already awaiting review');
      return tx.paymentProof.create({
        data: {
          schoolId: invoice.schoolId,
          branchId: invoice.branchId,
          studentId: invoice.studentId,
          invoiceId: invoice.id,
          amountMinor: amount,
          paidOn,
          method: dto.method,
          reference: dto.reference.trim(),
          fileId: dto.fileId,
          submittedById: user.id,
        },
      });
    });
    this.audit.stage({
      action: 'payment-proof.submit',
      entityType: 'PaymentProof',
      entityId: proof.id,
      schoolId: proof.schoolId,
      branchId: proof.branchId,
      after: {
        invoiceId: proof.invoiceId,
        amountMinor: dto.amountMinor,
        method: dto.method,
        reference: proof.reference,
      },
    });
    await this.notifications.notify({
      userIds: await this.people.roleHolders(
        proof.branchId,
        RoleKey.ACCOUNTANT,
      ),
      category: 'FEE',
      title: 'Payment proof to verify',
      body: `${formatMinor(amount, invoice.currency)} for invoice ${invoice.invoiceNo}`,
      data: { proofId: proof.id, invoiceId: invoice.id },
    });
    return this.reader.dto(proof.id);
  }
}
