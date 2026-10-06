import type { MarkSheetStatus } from "./types";

export const MARK_SHEET_STATUS_LABEL: Record<MarkSheetStatus, string> = {
  NOT_ENTERED: "Not entered",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  RETURNED: "Returned",
};

export function markSheetTitle(sheet: { paper: { className: string; subject: { name: string } }; sectionName: string }) {
  return `${sheet.paper.className} ${sheet.sectionName} · ${sheet.paper.subject.name}`;
}
