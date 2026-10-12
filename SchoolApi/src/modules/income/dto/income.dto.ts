export class IncomeCategoryRefDto {
  id!: string;
  code!: string;
  name!: string;
}

export class IncomeDto {
  id!: string;
  branchId!: string;
  category!: IncomeCategoryRefDto;
  title!: string;
  description!: string | null;
  amountMinor!: number;
  currency!: string;
  receivedOn!: string;
  receiptFileId!: string | null;
  receiptUrl!: string | null;
  notes!: string | null;
  createdAt!: string;
}
