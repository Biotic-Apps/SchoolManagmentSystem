import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";

export interface LoginSlipTarget {
  sectionId?: string;
  branchId?: string;
  classId?: string;
  /** This web app's sign-in page; the API prefers its PUBLIC_WEB_URL. */
  loginUrl?: string;
}

/** POST /guardians/login-slips/preview: what printing would change. */
export interface LoginSlipPreview {
  students: number;
  slips: number;
  create: number;
  reset: number;
  keep: number;
  skip: number;
  loginUrl: string;
}

export function usePreviewLoginSlips() {
  return useApiMutation({
    mutationFn: async (input: LoginSlipTarget) =>
      (await http.post<LoginSlipPreview>("/guardians/login-slips/preview", input)).data,
  });
}

/** Queues the slips PDF (three per A4 page); passwords are made inside the job. */
export function usePrintLoginSlips() {
  return useApiMutation({
    mutationFn: async (input: LoginSlipTarget) =>
      (await http.post<{ jobId: string; count: number }>("/guardians/login-slips/print", input)).data,
  });
}
