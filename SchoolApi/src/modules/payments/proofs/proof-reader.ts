import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { notFound } from '../../../core/common/errors/errors';
import { UrlSigner } from '../../../core/files/url-signer';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { ProofDto } from './dto/proof.dto';

export const PROOF_INCLUDE = {
  invoice: {
    select: {
      invoiceNo: true,
      currency: true,
      student: {
        select: { firstName: true, lastName: true, admissionNo: true },
      },
    },
  },
} satisfies Prisma.PaymentProofInclude;

export type ProofRow = Prisma.PaymentProofGetPayload<{
  include: typeof PROOF_INCLUDE;
}>;

/** Proof rows → DTOs (student, invoice no, signed file url, receipt no). */
@Injectable()
export class ProofReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
    private readonly signer: UrlSigner,
  ) {}

  async row(id: string): Promise<ProofRow> {
    const row = await this.prisma.paymentProof.findUnique({
      where: { id },
      include: PROOF_INCLUDE,
    });
    if (!row) throw notFound('Payment proof');
    return row;
  }

  async dto(id: string): Promise<ProofDto> {
    return (await this.dtos([await this.row(id)]))[0];
  }

  async dtos(rows: ProofRow[]): Promise<ProofDto[]> {
    const userIds = rows.flatMap((r) =>
      r.decidedById ? [r.submittedById, r.decidedById] : [r.submittedById],
    );
    const paymentIds = rows.flatMap((r) => (r.paymentId ? [r.paymentId] : []));
    const [names, payments] = await Promise.all([
      this.people.names(userIds),
      this.prisma.payment.findMany({
        where: { id: { in: paymentIds } },
        select: { id: true, receiptNo: true },
      }),
    ]);
    const receipts = new Map(payments.map((p) => [p.id, p.receiptNo]));
    const person = (id: string) => ({ id, name: names.get(id) ?? '' });
    return rows.map((row) => ({
      id: row.id,
      invoiceId: row.invoiceId,
      invoiceNo: row.invoice.invoiceNo,
      student: {
        id: row.studentId,
        name: `${row.invoice.student.firstName} ${row.invoice.student.lastName}`,
        admissionNo: row.invoice.student.admissionNo,
      },
      amountMinor: Number(row.amountMinor),
      paidOn: formatDate(row.paidOn),
      method: row.method,
      reference: row.reference,
      fileId: row.fileId,
      fileUrl: this.signer.sign(row.fileId).url,
      status: row.status,
      submittedBy: person(row.submittedById),
      decidedBy: row.decidedById ? person(row.decidedById) : null,
      decidedAt: row.decidedAt?.toISOString() ?? null,
      note: row.note,
      rejectReason: row.rejectReason,
      paymentId: row.paymentId,
      receiptNo: row.paymentId ? (receipts.get(row.paymentId) ?? null) : null,
      currency: row.invoice.currency,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
