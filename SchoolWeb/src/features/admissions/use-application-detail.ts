import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { useDialogState } from "@/lib/use-dialog-state";
import { NO_ACTIONS, applicationActions } from "./application-actions";
import { useApplication, useWithdrawApplication } from "./api";
import { applicationStepper, childName, isOpenStatus } from "./status";

export type ApplicationDialog = "edit" | "test" | "result" | "decide" | "confirm" | "withdraw";

/** Detail drawer state: the application, the actions allowed now and which action dialog is open. */
export function useApplicationDetail(applicationId: string | null) {
  const can = useCan();
  const query = useApplication(applicationId);
  const app = query.data;
  const dialog = useDialogState<ApplicationDialog>();
  const withdraw = useWithdrawApplication();
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const closeDialog = () => {
    setWithdrawError(null);
    dialog.close();
  };

  const confirmWithdraw = (reason: string) => {
    if (!app) return;
    setWithdrawError(null);
    withdraw.mutate(
      { id: app.id, body: { reason } },
      { onSuccess: dialog.close, onError: (error) => setWithdrawError(errorMessage(error)) },
    );
  };

  return {
    query,
    app,
    title: app ? childName(app) : "Application",
    stepper: app ? applicationStepper(app) : null,
    actions: app ? applicationActions(app, can) : NO_ACTIONS,
    documentsReadOnly: !app || !isOpenStatus(app.status),
    open: (which: ApplicationDialog) => dialog.show(which),
    active: dialog.item,
    closeDialog,
    confirmWithdraw,
    withdrawing: withdraw.isPending,
    withdrawError,
  };
}
