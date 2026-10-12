import type { Query } from "@/lib/http";

export const hrLetterKeys = {
  all: ["hr-letters"] as const,
  templates: (params: Query) => ["hr-letters", "templates", params] as const,
  staffLetters: (staffId: string) => ["hr-letters", "staff", staffId] as const,
  detail: (id: string) => ["hr-letters", "detail", id] as const,
};
