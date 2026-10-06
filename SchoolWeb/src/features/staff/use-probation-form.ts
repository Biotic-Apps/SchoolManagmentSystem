import { useWatch } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { roleLabel } from "@/config/roles";
import { useServerForm } from "@/lib/use-server-form";
import { probationSchema, toProbationInput, type ProbationFormValues } from "./action-schemas";
import { useSetProbation, useStaffList } from "./api";
import { REVIEWER_ROLES } from "./options";
import type { StaffDetail } from "./types";

/** Reviewers: active staff of the same branch with a sign-in account and a supervising role. */
function useReviewerOptions(staff: StaffDetail, branchId: string | null) {
  const query = useStaffList({ ...OPTIONS_PAGE, branchId, status: "ACTIVE" }, !!branchId);
  const options: Option[] = (query.data?.data ?? [])
    .filter((member) => member.id !== staff.id && !!member.userId)
    .filter((member) => member.roles.some((role) => REVIEWER_ROLES.includes(role)))
    .map((member) => ({
      id: member.userId as string,
      name: `${member.name} (${member.roles.filter((role) => REVIEWER_ROLES.includes(role)).map(roleLabel).join(", ")})`,
    }));
  return { options, isLoading: query.isLoading };
}

export function useProbationForm(staff: StaffDetail, branchId: string | null, onDone: () => void) {
  const save = useSetProbation(staff.id);
  const reviewers = useReviewerOptions(staff, branchId);
  const server = useServerForm<ProbationFormValues>({
    schema: probationSchema,
    defaultValues: { requiresReview: staff.requiresReview, reviewerUserId: staff.reviewer?.id ?? "" },
    onSubmit: (values) => save.mutateAsync(toProbationInput(values)),
    onSuccess: onDone,
  });
  const requiresReview = useWatch({ control: server.form.control, name: "requiresReview" });

  return {
    ...server,
    requiresReview,
    reviewerOptions: reviewers.options,
    reviewersLoading: reviewers.isLoading,
    noReviewers: !reviewers.isLoading && reviewers.options.length === 0,
  };
}
