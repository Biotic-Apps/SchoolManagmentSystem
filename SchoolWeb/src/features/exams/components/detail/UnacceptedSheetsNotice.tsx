import { InlineNotice } from "@/components/shared/InlineNotice";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { UnacceptedSheet } from "../../conflict-details";

/** 409 from approve-results: every mark sheet must be accepted first. */
export function UnacceptedSheetsNotice({ sheets }: { sheets: UnacceptedSheet[] }) {
  return (
    <InlineNotice tone="warning">
      <div className="flex flex-col gap-2">
        <span>These mark sheets are not accepted yet:</span>
        <ul className="flex flex-col gap-1.5">
          {sheets.map((sheet) => (
            <li key={sheet.key} className="flex flex-wrap items-center gap-2 text-fg">
              <span>{sheet.label}</span>
              {sheet.status && <StatusBadge status={sheet.status} />}
            </li>
          ))}
        </ul>
      </div>
    </InlineNotice>
  );
}
