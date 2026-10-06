import { InlineNotice } from "@/components/shared/InlineNotice";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { Spinner } from "@/components/ui/Spinner";
import { importKindLabel } from "../../import-kinds";
import { IMPORT_STEPS } from "../../import-steps";
import type { ImportFlow } from "../../use-import-flow";

const BUSY_TEXT: Record<string, string> = {
  VALIDATING: "Checking every row against the template and existing records…",
  COMMITTING: "Applying rows in one transaction…",
};

export function ImportStatusPanel({ flow }: { flow: ImportFlow }) {
  const detail = flow.detail;
  if (!detail) return null;
  const busyText = BUSY_TEXT[detail.status];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {detail.kind && <span className="text-body font-semibold text-fg">{importKindLabel(detail.kind)}</span>}
        <StatusBadge status={detail.status} />
      </div>
      <StatusStepper steps={IMPORT_STEPS} current={flow.step.current} failedLabel={flow.step.failedLabel} />
      {busyText && (
        <InlineNotice>
          <span className="flex items-center gap-2">
            <Spinner className="shrink-0" label="Working" />
            {busyText} This view updates on its own.
          </span>
        </InlineNotice>
      )}
      {detail.status === "FAILED" && (
        <InlineNotice tone="error">{detail.error || "The import failed and nothing was saved. Try again."}</InlineNotice>
      )}
      {detail.status === "REVERTED" && (
        <InlineNotice tone="warning">This import was reverted. The records it created were removed.</InlineNotice>
      )}
    </div>
  );
}
