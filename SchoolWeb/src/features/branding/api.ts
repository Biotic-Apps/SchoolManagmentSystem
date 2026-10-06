import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { Branding } from "./types";

export const brandingKeys = {
  all: ["branding"] as const,
  school: (schoolId: string | null) => ["branding", schoolId] as const,
};

/** Public branding; without a school id the API answers with the default school. */
export function useBranding(schoolId: string | null) {
  return useQuery({
    queryKey: brandingKeys.school(schoolId),
    queryFn: async () => (await http.get<Branding>("/branding", { schoolId })).data,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
