import type { Query } from "@/lib/http";

export const inventoryKeys = {
  all: ["inventory"] as const,
  items: (params: Query) => ["inventory", "items", params] as const,
  stock: (branchId: string | null) => ["inventory", "stock", branchId] as const,
  movements: (branchId: string | null) => ["inventory", "movements", branchId] as const,
  assets: (params: Query) => ["inventory", "assets", params] as const,
  purchaseRequests: (params: Query) => ["inventory", "purchase-requests", params] as const,
};
