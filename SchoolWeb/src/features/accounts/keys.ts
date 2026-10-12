import type { Query } from "@/lib/http";

export const accountKeys = {
  all: ["accounts"] as const,
  income: (params: Query) => ["accounts", "income", params] as const,
  incomeCategories: (schoolId: string | null) => ["accounts", "income-categories", schoolId] as const,
  profitLoss: (params: Query) => ["accounts", "profit-loss", params] as const,
};
