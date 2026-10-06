import { MoneyField } from "@/components/shared/form/MoneyField";
import { APPROVAL_LIMIT_TYPES, type ApprovalLimitType } from "../../types";

const LABELS: Record<ApprovalLimitType, string> = {
  CONCESSION: "Concessions",
  REFUND: "Refunds",
  EXPENSE: "Expenses",
  PURCHASE_ORDER: "Purchase orders",
};

/** Highest amount the first approver can approve per request type; above it the request escalates. */
export function ApprovalLimitsFields() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-label font-medium text-fg">Approval limits</h4>
        <p className="text-caption text-fg-muted">
          Requests above a limit go to the next approver. Leave blank for no limit.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {APPROVAL_LIMIT_TYPES.map((type) => (
          <MoneyField key={type} name={`approvalLimits.${type}`} label={LABELS[type]} />
        ))}
      </div>
    </div>
  );
}
