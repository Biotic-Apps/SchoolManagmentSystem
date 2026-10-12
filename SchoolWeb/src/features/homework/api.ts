import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  CreateHomeworkInput,
  GradeSubmissionInput,
  Homework,
  HomeworkSubmission,
  SubmitHomeworkInput,
  UpdateHomeworkInput,
} from "./types";

export const homeworkKeys = {
  all: ["homework"] as const,
  list: (params: Query) => ["homework", "list", params] as const,
  studentList: (studentId: string | null, params: Query) =>
    ["homework", "student", studentId, params] as const,
  submissions: (homeworkId: string) =>
    ["homework", "submissions", homeworkId] as const,
  studentSubmission: (homeworkId: string, studentId: string) =>
    ["homework", "submission", homeworkId, studentId] as const,
};

// ─── Teacher queries ──────────────────────────────────────────

export function useHomeworkList(params: Query, enabled = true) {
  return useQuery({
    queryKey: homeworkKeys.list(params),
    queryFn: async () => (await http.get<Homework[]>("/homework", params)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useHomeworkSubmissions(homeworkId: string | null) {
  return useQuery({
    queryKey: homeworkKeys.submissions(homeworkId ?? ""),
    queryFn: async () =>
      (await http.get<HomeworkSubmission[]>(`/homework/${homeworkId}/submissions`)).data,
    enabled: !!homeworkId,
  });
}

// ─── Student / Parent queries ─────────────────────────────────

export function useStudentHomework(studentId: string | null, params: Query) {
  return useQuery({
    queryKey: homeworkKeys.studentList(studentId, params),
    queryFn: async () =>
      (await http.get<Homework[]>(`/homework/student/${studentId}`, params)).data,
    placeholderData: keepPreviousData,
    enabled: !!studentId,
  });
}

export function useStudentSubmission(homeworkId: string | null, studentId: string | null) {
  return useQuery({
    queryKey: homeworkKeys.studentSubmission(homeworkId ?? "", studentId ?? ""),
    queryFn: async () =>
      (await http.get<HomeworkSubmission | null>(`/homework/${homeworkId}/submission/${studentId}`)).data,
    enabled: !!homeworkId && !!studentId,
  });
}

// ─── Teacher mutations ────────────────────────────────────────

export function useCreateHomework() {
  return useApiMutation({
    mutationFn: async (input: CreateHomeworkInput) =>
      (await http.post<Homework>("/homework", input)).data,
    invalidate: [homeworkKeys.all],
    success: "Homework assigned",
  });
}

export function useUpdateHomework() {
  return useApiMutation({
    mutationFn: async ({ id, ...input }: UpdateHomeworkInput & { id: string }) =>
      (await http.put<Homework>(`/homework/${id}`, input)).data,
    invalidate: [homeworkKeys.all],
    success: "Homework updated",
  });
}

export function useArchiveHomework() {
  return useApiMutation({
    mutationFn: async (id: string) =>
      (await http.delete<Homework>(`/homework/${id}`)).data,
    invalidate: [homeworkKeys.all],
    success: "Homework archived",
  });
}

export function useGradeSubmission() {
  return useApiMutation({
    mutationFn: async ({
      submissionId,
      ...input
    }: GradeSubmissionInput & { submissionId: string }) =>
      (await http.post<HomeworkSubmission>(`/homework/submissions/${submissionId}/grade`, input)).data,
    invalidate: [homeworkKeys.all],
    success: "Submission graded",
  });
}

export function useReturnSubmission() {
  return useApiMutation({
    mutationFn: async ({ submissionId, feedback }: { submissionId: string; feedback: string }) =>
      (await http.post<HomeworkSubmission>(`/homework/submissions/${submissionId}/return`, { feedback }))
        .data,
    invalidate: [homeworkKeys.all],
    success: "Submission returned for revision",
  });
}

// ─── Student / Parent mutations ───────────────────────────────

export function useSubmitHomework() {
  return useApiMutation({
    mutationFn: async ({
      homeworkId,
      studentId,
      ...input
    }: SubmitHomeworkInput & { homeworkId: string; studentId: string }) =>
      (await http.post<HomeworkSubmission>(`/homework/${homeworkId}/submit/${studentId}`, input)).data,
    invalidate: [homeworkKeys.all],
    success: "Homework submitted",
  });
}
