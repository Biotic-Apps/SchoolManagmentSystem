import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  AssignmentInput,
  CreatedStaff,
  ProbationInput,
  SectionStaff,
  StaffAssignment,
  StaffDetail,
  StaffInput,
  StaffStatusInput,
  StaffSummary,
  StaffUpdate,
  StaffWorkload,
} from "./types";

export const staffKeys = {
  all: ["staff"] as const,
  list: (params: Query) => ["staff", "list", params] as const,
  detail: (id: string) => ["staff", "detail", id] as const,
  assignments: (id: string, sessionId: string | null) => ["staff", "assignments", id, sessionId] as const,
  workload: (id: string, sessionId: string | null) => ["staff", "workload", id, sessionId] as const,
  section: (sectionId: string) => ["staff", "section", sectionId] as const,
};

const INVALIDATE = [staffKeys.all, ["sections"], ["dashboard"]];

export function useStaffList(params: Query, enabled = true) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => http.get<StaffSummary[]>("/staff", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Active staff of a branch for pickers; `role` narrows to holders of that role. */
export function useStaffOptions(branchId: string | null, role?: string) {
  const query = useStaffList({ ...OPTIONS_PAGE, branchId, status: "ACTIVE" }, !!branchId);
  const staff = (query.data?.data ?? []).filter((member) => !role || member.roles.includes(role));
  const options: Option[] = staff.map((member) => ({ id: member.id, name: member.name }));
  return { staff, options, isLoading: query.isLoading };
}

export function useStaffMember(id: string | null) {
  return useQuery({
    queryKey: staffKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<StaffDetail>(`/staff/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateStaff() {
  return useApiMutation({
    mutationFn: async (input: StaffInput) => (await http.post<CreatedStaff>("/staff", input)).data,
    invalidate: INVALIDATE,
    success: (created) => `${created.staff.name} added`,
    toastError: false,
  });
}

export function useUpdateStaff(id: string) {
  return useApiMutation({
    mutationFn: (input: StaffUpdate) => http.patch<StaffDetail>(`/staff/${id}`, input),
    invalidate: [staffKeys.all],
    success: "Staff details saved",
    toastError: false,
  });
}

export function useStaffStatus(id: string) {
  return useApiMutation({
    mutationFn: (input: StaffStatusInput) => http.post<StaffDetail>(`/staff/${id}/status`, input),
    invalidate: INVALIDATE,
    success: "Status updated",
    toastError: false,
  });
}

export function useSetProbation(id: string) {
  return useApiMutation({
    mutationFn: (input: ProbationInput) => http.put<StaffDetail>(`/staff/${id}/probation`, input),
    invalidate: [staffKeys.all],
    success: (_, vars) => (vars.requiresReview ? "Probation review turned on" : "Probation review turned off"),
    toastError: false,
  });
}

export function useStaffAssignments(id: string, sessionId: string | null) {
  return useQuery({
    queryKey: staffKeys.assignments(id, sessionId),
    queryFn: async () => (await http.get<StaffAssignment[]>(`/staff/${id}/assignments`, { sessionId })).data,
    enabled: !!sessionId,
  });
}

export function useAddStaffAssignment(id: string) {
  return useApiMutation({
    mutationFn: (input: AssignmentInput) => http.post<StaffAssignment>(`/staff/${id}/assignments`, input),
    invalidate: INVALIDATE,
    success: "Assignment added",
    toastError: false,
  });
}

export function useEndStaffAssignment(id: string) {
  return useApiMutation({
    mutationFn: (assignmentId: string) => http.delete(`/staff/${id}/assignments/${assignmentId}`),
    invalidate: INVALIDATE,
    success: "Assignment ended",
  });
}

export function useStaffWorkload(id: string, sessionId: string | null) {
  return useQuery({
    queryKey: staffKeys.workload(id, sessionId),
    queryFn: async () => (await http.get<StaffWorkload>(`/staff/${id}/workload`, { sessionId })).data,
    enabled: !!sessionId,
  });
}

export function useSectionStaff(sectionId: string | null, enabled = true) {
  return useQuery({
    queryKey: staffKeys.section(sectionId ?? ""),
    queryFn: async () => (await http.get<SectionStaff>(`/sections/${sectionId}/staff`)).data,
    enabled: enabled && !!sectionId,
  });
}
