import { z } from "zod";
import { isoDate, optionalText } from "@/lib/validation";
import type { PromotionDecision } from "./types";

export const suggestSchema = z
  .object({
    fromSessionId: z.string().min(1, "Choose the session being closed"),
    toSessionId: z.string().min(1, "Choose the next session"),
    examIds: z.array(z.string()).min(1, "Choose at least one published exam"),
  })
  .refine((values) => values.fromSessionId !== values.toSessionId, {
    path: ["toSessionId"],
    message: "Pick a different session to promote into",
  });
export type SuggestValues = z.infer<typeof suggestSchema>;

/** A decision that differs from the suggestion needs a reason. */
export const overrideSchema = (suggested: PromotionDecision) =>
  z
    .object({
      decision: z.string().min(1, "Choose a decision"),
      toSectionId: z.string(),
      reason: optionalText(500),
    })
    .refine((values) => values.decision === suggested || !!values.reason.trim(), {
      path: ["reason"],
      message: "Explain why the suggestion is overridden",
    });
export type OverrideValues = z.infer<ReturnType<typeof overrideSchema>>;

export const confirmSchema = z.object({ classId: z.string() });
export type ConfirmValues = z.infer<typeof confirmSchema>;

export const applySchema = z.object({ effectiveDate: isoDate });
export type ApplyValues = z.infer<typeof applySchema>;
