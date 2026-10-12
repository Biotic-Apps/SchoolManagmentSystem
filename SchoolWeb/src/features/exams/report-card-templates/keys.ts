import type { Query } from "@/lib/http";

export const templateKeys = {
  all: ["report-card-templates"] as const,
  list: (params: Query) => ["report-card-templates", "list", params] as const,
  detail: (id: string) => ["report-card-templates", id] as const,
};
