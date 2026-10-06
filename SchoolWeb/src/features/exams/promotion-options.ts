import type { Option } from "@/components/shared/OptionSelect";
import type { PromotionDecision, PromotionRow } from "./types";

export const DECISIONS: PromotionDecision[] = ["PROMOTE", "CONDITIONAL", "REPEAT", "GRADUATE"];

export const DECISION_LABEL: Record<PromotionDecision, string> = {
  PROMOTE: "Promote",
  CONDITIONAL: "Conditional",
  REPEAT: "Repeat class",
  GRADUATE: "Graduate",
};

export const DECISION_OPTIONS: Option[] = DECISIONS.map((id) => ({ id, name: DECISION_LABEL[id] }));

export const PROMOTION_STATUS_LABEL: Record<PromotionRow["status"], string> = {
  SUGGESTED: "Suggested",
  CONFIRMED: "Confirmed",
  APPLIED: "Applied",
};

/** Roles that confirm promotions for approval and apply them. */
export const PROMOTION_MANAGER_ROLES = new Set(["PRINCIPAL", "SUPER_ADMIN"]);
