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
  if (sheet.status === "ACCEPTED") {
    const missing = sheet.total - sheet.entered;
    if (missing > 0)
      return (
        <InlineNotice tone="warning">
          Accepted, but {missing} student{missing === 1 ? " has" : "s have"} no marks (joined after acceptance).{" "}
          {exam.status === "MARKS_OPEN"
            ? "Return the sheet to the teacher to enter them."
            : "A principal can reopen marks entry on the Overview tab, then return this sheet."}
        </InlineNotice>
      );
    return <InlineNotice>Accepted. These marks are final unless the sheet is returned while marks entry is open.</InlineNotice>;
  }
  if (!editable && exam.status !== "MARKS_OPEN") {
    return <InlineNotice>Marks entry is not open for this exam, so the sheet is read-only.</InlineNotice>;
  }
  return null;
}
