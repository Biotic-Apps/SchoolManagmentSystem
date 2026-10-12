export interface IncomeCategory {
  id: string;
  name: string;
  code?: string | null;
  schoolId?: string;
}

export interface IncomeCategoryInput {
  name: string;
  code?: string;
}

export interface Income {
  id: string;
  branchId?: string;
  categoryId?: string;
  category?: IncomeCategory | null;
  title: string;
  description?: string | null;
  amountMinor: number;
  currency?: string;
  receivedOn: string;
  receiptFileId?: string | null;
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface IncomeInput {
  branchId: string;
  categoryId: string;
  title: string;
  description?: string;
  amountMinor: number;
  receivedOn: string;
  receiptFileId?: string;
  notes?: string;
}

export interface ProfitLossRow {
  section: string;
  item: string;
  amount: number;
}

export interface ProfitLossReport {
  title: string;
  rows: ProfitLossRow[];
  columns: { key: string; header: string; kind?: string }[];
}
