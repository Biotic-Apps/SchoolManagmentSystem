import { InlineNotice } from "@/components/shared/InlineNotice";
import type { Exam, MarkSheet } from "../../types";

/** Reviewer's return comment, or why the sheet is read-only. */
export function MarkSheetBanner({ exam, sheet, editable }: { exam: Exam; sheet: MarkSheet; editable: boolean }) {
  if (sheet.status === "RETURNED") {
    return (
      <InlineNotice tone="warning">
        Returned for correction{sheet.comment ? `: ${sheet.comment}` : "."} Fix the marks and submit again.
      </InlineNotice>
    );
  }
  if (sheet.status === "SUBMITTED") {
    return <InlineNotice>Submitted and waiting for review by the coordinator or principal.</InlineNotice>;
  }
  if (sheet.status === "ACCEPTED") return <InlineNotice>Accepted. These marks are final for this exam.</InlineNotice>;
  if (!editable && exam.status !== "MARKS_OPEN") {
    return <InlineNotice>Marks entry is not open for this exam, so the sheet is read-only.</InlineNotice>;
  }
  return null;
}
