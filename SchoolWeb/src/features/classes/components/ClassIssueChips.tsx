import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { ISSUE_COPY, classSetupHref, timetableHref } from "../links";
import type { ClassOverview } from "../setup-types";

interface ClassIssueChipsProps {
  item: ClassOverview;
  branchId: string;
  sessionId: string | null;
}

/** What still needs doing for this class; each chip opens the place that fixes it. */
export function ClassIssueChips({ item, branchId, sessionId }: ClassIssueChipsProps) {
  if (item.issues.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Needs attention">
      {item.issues.map((issue) => {
        const copy = ISSUE_COPY[issue];
        const label =
          issue === "SUBJECTS_WITHOUT_TEACHER" && item.unallocated > 0
            ? `${item.unallocated} teacher assignment${item.unallocated === 1 ? "" : "s"} missing`
            : copy.label;
        const href =
          copy.card === "timetable"
            ? timetableHref(branchId, item.sections[0]?.id)
            : classSetupHref(item.id, branchId, sessionId, copy.card);
        return (
          <li key={issue}>
            <Link
              href={href}
              onClick={(event) => event.stopPropagation()}
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-caption font-medium text-warning hover:underline",
                focusRing,
              )}
            >
              <TriangleAlert className="size-3.5" aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
