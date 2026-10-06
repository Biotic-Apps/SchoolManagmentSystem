import { ApiProperty } from '@nestjs/swagger';
import { ExpenseStatus, PaymentMethod } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class ExpenseCategoryRefDto {
  id!: string;
  code!: string;
  name!: string;
}

export class RecurringDto {
  monthly!: boolean;
  untilMonth!: string | null;
}

export class ExpensePaymentDto {
  id!: string;
  amountMinor!: number;
  @ApiProperty({ enum: PaymentMethod })
  method!: PaymentMethod;
  reference!: string | null;
  paidOn!: string;
  paidById!: string;
  createdAt!: string;
}

export class ExpenseDto {
  id!: string;
  branchId!: string;
  category!: ExpenseCategoryRefDto;
  vendor!: IdNameDto | null;
  title!: string;
  amountMinor!: number;
  paidMinor!: number;
  balanceMinor!: number;
  currency!: string;
  billDate!: string;
  dueDate!: string | null;
  billFileId!: string | null;
  billUrl!: string | null;
  recurring!: RecurringDto | null;
  /** Month of a copy generated from a recurring template. */
  recurringPeriod!: string | null;
  recurringParentId!: string | null;
  purchaseOrderId!: string | null;
  notes!: string | null;
  @ApiProperty({ enum: ExpenseStatus })
  status!: ExpenseStatus;
  approvalId!: string | null;
  payments!: ExpensePaymentDto[];
  createdAt!: string;
}
