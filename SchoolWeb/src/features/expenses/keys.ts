import type { Query } from "@/lib/http";

export const expenseKeys = {
  all: ["expenses"] as const,
  list: (params: Query) => ["expenses", "list", params] as const,
  vendors: (params: Query) => ["expenses", "vendors", params] as const,
  categories: (schoolId: string | null) => ["expenses", "categories", schoolId] as const,
  fileUrl: (fileId: string) => ["expenses", "file-url", fileId] as const,
};
