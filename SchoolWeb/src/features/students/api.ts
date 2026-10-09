import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { ParentLogin } from "@/features/guardians/types";
import type {
  ChangeSectionInput,
  Enrollment,
  RegisterStudentInput,
  StudentDetail,
  StudentSummary,
  StudentUpdate,
  TransferRequestInput,
  WithdrawInput,
} from "./types";

export const studentKeys = {
  all: ["students"] as const,
  list: (params: Query) => ["students", "list", params] as const,
  detail: (id: string) => ["students", "detail", id] as const,
  enrollments: (id: string) => ["students", "enrollments", id] as const,
};

const INVALIDATE = [studentKeys.all, ["sections"], ["dashboard"]];

export function useStudents(params: Query, enabled = true) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => http.get<StudentSummary[]>("/students", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useStudent(id: string | null) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<StudentDetail>(`/students/${id}`)).data,
    enabled: !!id,
  });
}

export function useEnrollments(id: string | null) {
  return useQuery({
    queryKey: studentKeys.enrollments(id ?? ""),
    queryFn: async () => (await http.get<Enrollment[]>(`/students/${id}/enrollments`)).data,
    enabled: !!id,
  });
}

export function useRegisterStudent() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: RegisterStudentInput) =>
        (await http.post<StudentDetail & { parentLogins: ParentLogin[] }>("/students", input)).data,
      (student) => student.id,
    ),
    invalidate: INVALIDATE,
    success: (student) => `${student.name} registered (${student.admissionNo})`,
    toastError: false,
  });
}

export function useUpdateStudent(id: string) {
  return useApiMutation({
    mutationFn: withRowFlash((input: StudentUpdate) => http.patch<StudentDetail>(`/students/${id}`, input), () => id),
    invalidate: [studentKeys.all],
    success: "Student updated",
    toastError: false,
  });
}

export function useWithdrawStudent(id: string) {
  return useApiMutation({
    mutationFn: (input: WithdrawInput) => http.post(`/students/${id}/withdraw`, input),
    invalidate: INVALIDATE,
    success: "Student withdrawn",
    toastError: false,
  });
}

export function useChangeSection(id: string) {
  return useApiMutation({
    mutationFn: (input: ChangeSectionInput) => http.post(`/students/${id}/change-section`, input),
    invalidate: INVALIDATE,
    success: "Section changed",
    toastError: false,
  });
}

export function useRequestTransfer(id: string) {
  return useApiMutation({
    mutationFn: (input: TransferRequestInput) => http.post(`/students/${id}/transfers`, input),
    invalidate: [studentKeys.all, ["transfers"]],
    success: "Transfer requested — the destination branch will place the student",
    toastError: false,
  });
}
