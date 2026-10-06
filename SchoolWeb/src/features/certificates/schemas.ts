import { z } from "zod";
import { blankToUndefined, optionalText } from "@/lib/validation";
import type { CertificateInput, CertificateType } from "./types";

export const requestSchema = z
  .object({
    studentId: z.string().min(1, "Choose the student"),
    type: z.string().min(1, "Choose a certificate type"),
    purpose: optionalText(200),
    achievement: optionalText(500),
  })
  .refine((values) => values.type !== "ACHIEVEMENT" || !!values.achievement.trim(), {
    path: ["achievement"],
    message: "Describe the achievement",
  });
export type RequestFormValues = z.infer<typeof requestSchema>;

export const requestDefaults = (studentId?: string | null): RequestFormValues => ({
  studentId: studentId ?? "",
  type: "",
  purpose: "",
  achievement: "",
});

export function toCertificateInput(values: RequestFormValues): CertificateInput {
  const type = values.type as CertificateType;
  const achievement = type === "ACHIEVEMENT" ? blankToUndefined(values.achievement.trim()) : undefined;
  return {
    studentId: values.studentId,
    type,
    purpose: blankToUndefined(values.purpose.trim()),
    details: achievement ? { achievement } : undefined,
  };
}
