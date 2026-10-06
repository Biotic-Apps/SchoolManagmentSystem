import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  Application,
  ApplicationInput,
  ConfirmInput,
  Decision,
  Enquiry,
  EnquiryInput,
  EnquiryUpdate,
  TestInput,
  TestResultInput,
} from "./types";

export const admissionKeys = {
  all: ["admissions"] as const,
  enquiries: (params: Query) => ["admissions", "enquiries", params] as const,
  applications: (params: Query) => ["admissions", "applications", params] as const,
  application: (id: string) => ["admissions", "application", id] as const,
  waitingList: (params: Query) => ["admissions", "waiting-list", params] as const,
};

const INVALIDATE = [admissionKeys.all, ["dashboard"]];

export function useEnquiries(params: Query, enabled = true) {
  return useQuery({
    queryKey: admissionKeys.enquiries(params),
    queryFn: () => http.get<Enquiry[]>("/admissions/enquiries", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSaveEnquiry() {
  return useApiMutation({
    mutationFn: ({ id, input }: { id?: string; input: EnquiryInput | EnquiryUpdate }) =>
      id ? http.patch<Enquiry>(`/admissions/enquiries/${id}`, input) : http.post<Enquiry>("/admissions/enquiries", input),
    invalidate: INVALIDATE,
    success: (_, vars) => (vars.id ? "Enquiry updated" : "Enquiry added"),
    toastError: false,
  });
}

export function useConvertEnquiry() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.post<Application>(`/admissions/enquiries/${id}/convert`)).data,
    invalidate: INVALIDATE,
    success: (application) => `Application ${application.applicationNo} created`,
  });
}

export function useApplications(params: Query, enabled = true) {
  return useQuery({
    queryKey: admissionKeys.applications(params),
    queryFn: () => http.get<Application[]>("/admissions/applications", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useApplication(id: string | null) {
  return useQuery({
    queryKey: admissionKeys.application(id ?? ""),
    queryFn: async () => (await http.get<Application>(`/admissions/applications/${id}`)).data,
    enabled: !!id,
  });
}

export function useSaveApplication() {
  return useApiMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ApplicationInput }) =>
      (id
        ? await http.patch<Application>(`/admissions/applications/${id}`, input)
        : await http.post<Application>("/admissions/applications", input)
      ).data,
    invalidate: INVALIDATE,
    success: (_, vars) => (vars.id ? "Application updated" : "Application submitted"),
    toastError: false,
  });
}

function useApplicationAction<TBody>(action: string, success: string) {
  return useApiMutation({
    mutationFn: async ({ id, body }: { id: string; body: TBody }) =>
      (await http.post<Application>(`/admissions/applications/${id}/${action}`, body)).data,
    invalidate: INVALIDATE,
    success,
    toastError: false,
  });
}

export const useScheduleTest = () => useApplicationAction<TestInput>("test", "Entrance test scheduled");
export const useRecordTestResult = () => useApplicationAction<TestResultInput>("test-result", "Test result saved");
export const useDecideApplication = () =>
  useApplicationAction<{ decision: Decision; reason?: string }>("decide", "Decision saved");
export const useWithdrawApplication = () => useApplicationAction<{ reason: string }>("withdraw", "Application withdrawn");

export function useConfirmApplication() {
  return useApiMutation({
    mutationFn: async ({ id, body }: { id: string; body: ConfirmInput }) =>
      (await http.post<{ application: Application; studentId: string }>(`/admissions/applications/${id}/confirm`, body))
        .data,
    invalidate: [...INVALIDATE, ["students"], ["sections"]],
    success: "Admission confirmed — student enrolled",
    toastError: false,
  });
}

export function useWaitingList(params: Query, enabled = true) {
  return useQuery({
    queryKey: admissionKeys.waitingList(params),
    queryFn: () => http.get<Application[]>("/admissions/waiting-list", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useOfferFromWaitingList() {
  return useApiMutation({
    mutationFn: (applicationId: string) => http.post<Application>(`/admissions/waiting-list/${applicationId}/offer`),
    invalidate: INVALIDATE,
    success: "Seat offered — guardian notified",
  });
}
