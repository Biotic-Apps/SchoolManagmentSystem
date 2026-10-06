import { z } from "zod";
import { blankToUndefined, isoDate, optionalIsoDate, requiredText } from "@/lib/validation";
import { SECTION_KINDS } from "./options";
import type { AssignmentInput, AssignmentKind, ProbationInput, StaffStatus, StaffStatusInput } from "./types";

export const statusSchema = z.object({
  status: z.string().min(1, "Choose a status"),
  effectiveDate: isoDate,
  reason: requiredText("a reason", 500),
});

export type StatusFormValues = z.infer<typeof statusSchema>;

export const toStatusInput = (values: StatusFormValues): StaffStatusInput => ({
  status: values.status as StaffStatus,
  effectiveDate: values.effectiveDate,
  reason: values.reason.trim(),
});

export const probationSchema = z
  .object({ requiresReview: z.boolean(), reviewerUserId: z.string() })
  .refine((v) => !v.requiresReview || !!v.reviewerUserId, {
    path: ["reviewerUserId"],
    message: "Choose who reviews this staff member's work",
  });

export type ProbationFormValues = z.infer<typeof probationSchema>;

export const toProbationInput = (values: ProbationFormValues): ProbationInput =>
  values.requiresReview
    ? { requiresReview: true, reviewerUserId: values.reviewerUserId }
    : { requiresReview: false };

const isSectionKind = (kind: string) => (SECTION_KINDS as string[]).includes(kind);

export const assignmentSchema = z
  .object({
    kind: z.string().min(1, "Choose the assignment type"),
    sessionId: z.string().min(1, "Choose a session"),
    sectionId: z.string(),
    subjectId: z.string(),
    responsibleStaffId: z.string(),
    isSubstitute: z.boolean(),
    validUntil: optionalIsoDate,
  })
  .refine((v) => !isSectionKind(v.kind) || !!v.sectionId, { path: ["sectionId"], message: "Choose a section" })
  .refine((v) => v.kind !== "SUBJECT_TEACHER" || !!v.subjectId, { path: ["subjectId"], message: "Choose a subject" })
  .refine((v) => !v.isSubstitute || !!v.validUntil, {
    path: ["validUntil"],
    message: "Pick the last day of the substitute assignment",
  });

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export const assignmentDefaults = (sessionId: string | null): AssignmentFormValues => ({
  kind: "",
  sessionId: sessionId ?? "",
  sectionId: "",
  subjectId: "",
  responsibleStaffId: "",
  isSubstitute: false,
  validUntil: "",
});

/** Only the fields that apply to the chosen kind are sent. */
export function toAssignmentInput(values: AssignmentFormValues, branchId: string): AssignmentInput {
  const kind = values.kind as AssignmentKind;
  return {
    kind,
    sessionId: values.sessionId,
    branchId,
    sectionId: blankToUndefined(values.sectionId),
    ...(kind === "SUBJECT_TEACHER" ? { subjectId: values.subjectId } : {}),
    ...(kind === "HELPER" ? { responsibleStaffId: blankToUndefined(values.responsibleStaffId) } : {}),
    ...(values.isSubstitute ? { isSubstitute: true, validUntil: values.validUntil } : {}),
  };
}
