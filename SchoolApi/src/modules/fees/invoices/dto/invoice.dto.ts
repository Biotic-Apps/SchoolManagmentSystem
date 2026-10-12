import type {
  InvoiceSource,
  InvoiceStatus,
} from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';

export class InvoiceStudentDto {
  id!: string;
  name!: string;
  admissionNo!: string;
  className!: string | null;
  sectionName!: string | null;
}

export class InvoiceLineDto {
  id!: string;
  feeHead!: IdNameDto;
  description!: string;
  amountMinor!: number;
}

export class InvoicePaymentDto {
  paymentId!: string;
  receiptNo!: string;
  /** Part of the payment allocated to this invoice. */
  amountMinor!: number;
  paidOn!: string;
}

export class InvoiceDto {
  id!: string;
  invoiceNo!: string;
  student!: InvoiceStudentDto;
  /** `YYYY-MM`; null for ad-hoc invoices. */
  period!: string | null;
  issueDate!: string | null;
  dueDate!: string;
  status!: InvoiceStatus;
  lines!: InvoiceLineDto[];
  concessionMinor!: number;
  siblingDiscountMinor!: number;
  lateFeeMinor!: number;
  totalMinor!: number;
  paidMinor!: number;
  balanceMinor!: number;
  payments!: InvoicePaymentDto[];
  currency!: string;
  // Additions (deviations): helpful for staff screens.
  branchId!: string;
  source!: InvoiceSource;
  subtotalMinor!: number;
  /** Pending (or decided) cancellation request. */
  cancelApprovalId!: string | null;
  cancelReason!: string | null;
}

export class InvoiceJobDto {
  jobId!: string;
}

export class InvoiceIssueFailureDto {
  id!: string;
  reason!: string;
}

export class InvoiceIssueResultDto {
  /** Number of invoices issued. */
  issued!: number;
  issuedIds!: string[];
  failed!: InvoiceIssueFailureDto[];
}

export class InvoicePdfDto {
  jobId!: string;
  status!: 'PENDING' | 'READY' | 'FAILED';
  fileUrl!: string | null;
}
