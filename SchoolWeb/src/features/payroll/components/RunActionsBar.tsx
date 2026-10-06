import { Calculator, CheckCheck, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { RunActionsState } from "../use-run-actions";

export function RunActionsBar({ actions }: { actions: RunActionsState }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.canCalculate && (
        <Button variant="secondary" loading={actions.calculating} onClick={actions.startCalculation}>
          <Calculator />
          {actions.calculateLabel}
        </Button>
      )}
      {actions.canReview && (
        <Button loading={actions.reviewing} onClick={actions.markReviewed}>
          <CheckCheck />
          Mark reviewed
        </Button>
      )}
      {actions.canSendForApproval && (
        <Button onClick={() => actions.confirm.show("approve")}>
          <Send />
          Send for approval
        </Button>
      )}
      {actions.canClose && (
        <Button variant="secondary" disabled={!actions.closeEnabled} onClick={() => actions.confirm.show("close")}>
          <Lock />
          Close run
        </Button>
      )}
    </div>
  );
}
