import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";
import type { Concession, ConcessionType, FeeHead } from "./types";

export interface ConcessionInput {
  studentId: string;
  feeHeadId?: string;
  type: ConcessionType;
  value: number;
  from: string;
  to?: string;
  reason: string;
}

export function useConcessions(params: Query, enabled = true) {
  return useQuery({
    queryKey: feesKeys.concessions(params),
    queryFn: () => http.get<Concession[]>("/concessions", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useRequestConcession() {
  return useApiMutation({
    mutationFn: (input: ConcessionInput) => http.post<Concession>("/concessions", input),
    invalidate: [feesKeys.all, ["approvals"]],
    success: "Concession sent for approval",
    toastError: false,
  });
}

/** Fee heads of the school as picker options. */
export function useConcessionHeadOptions(schoolId: string | null) {
  const query = useQuery({
    queryKey: ["fees", "heads", "options", schoolId],
    queryFn: async () => (await http.get<FeeHead[]>("/fee-heads", { ...OPTIONS_PAGE, schoolId })).data ?? [],
    enabled: !!schoolId,
  });
  const options: Option[] = (query.data ?? []).map((head) => ({ id: head.id, name: head.name }));
  return { options, isLoading: query.isLoading };
}
