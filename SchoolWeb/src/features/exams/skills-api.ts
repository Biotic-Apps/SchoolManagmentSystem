import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { examsKeys } from "./keys";
import type { SkillConfig, SkillConfigInput, SkillGrid, SkillRatingInput } from "./skill-types";

/** Branch behaviour & skills items and rating scale (defaults on first use). */
export function useSkillConfig(branchId: string | null) {
  return useQuery({
    queryKey: examsKeys.skillConfig(branchId),
    queryFn: async () => (await http.get<SkillConfig>(`/branches/${branchId}/skills`)).data,
    enabled: !!branchId,
  });
}

export function useSaveSkillConfig(branchId: string) {
  return useApiMutation({
    mutationFn: async (input: SkillConfigInput) => (await http.put<SkillConfig>(`/branches/${branchId}/skills`, input)).data,
    invalidate: [examsKeys.skillConfig(branchId), ["exams", "skill-grid"]],
    success: "Behaviour & skills updated",
    toastError: false,
  });
}

/** Ratings grid of one section for an exam. */
export function useSkillGrid(examId: string, sectionId: string | null) {
  return useQuery({
    queryKey: examsKeys.skillGrid(examId, sectionId),
    queryFn: async () => (await http.get<SkillGrid>(`/exams/${examId}/skills`, { sectionId })).data,
    enabled: !!sectionId,
  });
}

export function useSaveSkillRatings(examId: string, sectionId: string | null) {
  return useApiMutation({
    mutationFn: async (ratings: SkillRatingInput[]) =>
      (await http.put<SkillGrid>(`/exams/${examId}/skills`, { sectionId, ratings })).data,
    invalidate: [examsKeys.skillGrid(examId, sectionId)],
    success: "Ratings saved",
  });
}
