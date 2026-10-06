import type { Query } from "@/lib/http";

export const certificateKeys = {
  all: ["certificates"] as const,
  list: (params: Query) => ["certificates", "list", params] as const,
};
