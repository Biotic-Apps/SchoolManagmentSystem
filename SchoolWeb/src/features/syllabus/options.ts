import type { Option } from "@/components/shared/OptionSelect";
import type { ReviewStatus, TopicStatus } from "./types";

export const TOPIC_STATUS_OPTIONS: { id: TopicStatus; name: string }[] = [
  { id: "NOT_STARTED", name: "Not started" },
  { id: "IN_PROGRESS", name: "In progress" },
  { id: "COMPLETED", name: "Completed" },
];

export type DraftAction = "create" | "edit" | "revise" | null;

/** What "edit" means for the latest revision: a submitted one is locked until it is reviewed. */
export function draftAction(status: ReviewStatus | undefined): DraftAction {
  if (!status) return "create";
  if (status === "DRAFT" || status === "RETURNED") return "edit";
  if (status === "APPROVED") return "revise";
  return null;
}

export const DRAFT_ACTION_LABEL: Record<Exclude<DraftAction, null>, string> = {
  create: "Create draft",
  edit: "Edit draft",
  revise: "Start new revision",
};

export function latestRevision<T extends { revision: number }>(items: T[] | null | undefined): T | null {
  if (!items?.length) return null;
  return items.reduce((latest, item) => (item.revision > latest.revision ? item : latest));
}

export function latestApproved<T extends { revision: number; status: ReviewStatus }>(items: T[] | null | undefined) {
  return latestRevision(items?.filter((item) => item.status === "APPROVED"));
}

export function byOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function coverageTone(percent: number): "success" | "warning" | "error" {
  if (percent >= 80) return "success";
  if (percent >= 50) return "warning";
  return "error";
}

export function optionName(options: Option[], id: string | null | undefined): string | undefined {
  return options.find((option) => option.id === id)?.name;
}
