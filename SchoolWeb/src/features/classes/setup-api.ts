import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Ref } from "@/features/timetable/types";
import type { AllocationRow, ClassSetup, ClassSubjectInput, ClassSubjectItem } from "./setup-types";
import type { Subject } from "./types";

export const setupKey = (classId: string, branchId: string | null, sessionId: string | null) =>
  ["classes", "setup", classId, branchId ?? "", sessionId ?? ""] as const;

/** Every autosave on the Class setup screen shares this key so one indicator covers them all. */
export const classSaveKey = (classId: string) => ["class-setup-save", classId] as const;

const REFRESH = [["classes"], ["sections"], ["teaching-staff"], ["timetable"], ["staff"]];

export function useClassSetup(classId: string, branchId: string | null, sessionId: string | null) {
  return useQuery({
    queryKey: setupKey(classId, branchId, sessionId),
    queryFn: async () => (await http.get<ClassSetup>(`/classes/${classId}/setup`, { branchId, sessionId })).data,
    enabled: !!classId && !!branchId,
  });
}

export function useRenameClass(classId: string) {
  return useApiMutation({
    mutationKey: classSaveKey(classId),
    mutationFn: (name: string) => http.patch(`/classes/${classId}`, { name }),
    invalidate: [["classes"]],
    toastError: false,
  });
}

/** Whole curriculum in order; 409 SUBJECT_IN_USE is shown next to the subject. */
export function useSetClassSubjects(classId: string) {
  return useApiMutation({
    mutationKey: classSaveKey(classId),
    mutationFn: async (items: ClassSubjectInput[]) =>
      (await http.put<ClassSubjectItem[]>(`/classes/${classId}/subjects`, { items })).data,
    invalidate: REFRESH,
    toastError: false,
  });
}

export interface NewSubjectInput {
  schoolId: string;
  name: string;
  classIds: string[];
  periodsPerWeek?: number | null;
}

/** Creates a school subject and links it to the class in one call (code is generated). */
export function useCreateLinkedSubject(classId: string) {
  return useApiMutation({
    mutationKey: classSaveKey(classId),
    mutationFn: async (input: NewSubjectInput) => (await http.post<Subject>("/subjects", input)).data,
    invalidate: [["subjects"], ...REFRESH],
    // Preset fills create several subjects at once; only a single inline create is announced.
    success: (subject, input) => (input.classIds.length ? `${subject.name} added to this class` : ""),
  });
}

export function useSetSubjectTeacher(classId: string) {
  return useApiMutation({
    mutationKey: classSaveKey(classId),
    mutationFn: ({ sectionId, subjectId, staffId }: { sectionId: string; subjectId: string; staffId: string | null }) =>
      http.put<AllocationRow>(`/sections/${sectionId}/subject-teachers/${subjectId}`, { staffId }),
    invalidate: REFRESH,
  });
}

export function useSetClassTeacher(classId: string) {
  return useApiMutation({
    mutationKey: classSaveKey(classId),
    mutationFn: ({ sectionId, staffId }: { sectionId: string; staffId: string | null }) =>
      http.put(`/sections/${sectionId}/class-teacher`, { staffId }),
    invalidate: REFRESH,
  });
}

export interface SectionPatch {
  name?: string;
  capacity?: number;
  roomId?: string | null;
  group?: string | null;
}

export function usePatchSection(classId: string) {
  return useApiMutation({
    mutationKey: classSaveKey(classId),
    mutationFn: ({ id, patch }: { id: string; patch: SectionPatch }) => http.patch(`/sections/${id}`, patch),
    invalidate: REFRESH,
  });
}

export interface NewSectionInput {
  branchId: string;
  sessionId: string;
  classId: string;
  name: string;
  capacity: number;
  group?: string | null;
}

export function useAddSection(classId: string) {
  return useApiMutation({
    mutationKey: classSaveKey(classId),
    mutationFn: (input: NewSectionInput) => http.post<Ref>("/sections", input),
    invalidate: REFRESH,
    success: (_, input) => `Section ${input.name} added`,
  });
}

/** 409 SECTION_IN_USE (students enrolled) is shown in the confirm dialog. */
export function useRemoveSection(classId: string) {
  return useApiMutation({
    mutationKey: classSaveKey(classId),
    mutationFn: (sectionId: string) => http.post(`/sections/${sectionId}/archive`),
    invalidate: REFRESH,
    success: "Section removed",
    toastError: false,
  });
}
