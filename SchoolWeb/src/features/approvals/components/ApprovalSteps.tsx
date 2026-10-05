import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { approverLabel, decidedByName, stepStatus } from "../step-format";
import type { ApprovalRequest } from "../types";

export function ApprovalSteps({ request }: { request: ApprovalRequest }) {
  const steps = [...(request.steps ?? [])].sort((a, b) => a.order - b.order);

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Approval steps" />
      {steps.length === 0 ? (
        <p className="text-label text-fg-muted">No steps recorded for this request.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {steps.map((step) => {
            const by = decidedByName(step.decidedBy);
            return (
              <li key={step.order} className="flex gap-3 rounded-input border border-border p-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-selected text-caption font-semibold text-primary">
                  {step.order}
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-label font-medium text-fg">{approverLabel(step)}</span>
                    <StatusBadge status={stepStatus(step, request)} />
                  </div>
                  {step.decidedAt && (
                    <span className="text-caption text-fg-muted">
                      {by ? `${by} · ` : ""}
                      {formatDateTime(step.decidedAt)}
                    </span>
                  )}
                  {step.comment && <p className="text-label text-fg">{step.comment}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
