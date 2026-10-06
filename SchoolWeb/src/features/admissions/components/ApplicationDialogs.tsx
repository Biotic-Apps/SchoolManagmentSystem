"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import type { Application } from "../types";
import type { ApplicationDialog } from "../use-application-detail";
import { ApplicationFormDialog } from "./ApplicationFormDialog";
import { ConfirmAdmissionDialog } from "./ConfirmAdmissionDialog";
import { DecideDialog } from "./DecideDialog";
import { ScheduleTestDialog } from "./ScheduleTestDialog";
import { TestResultDialog } from "./TestResultDialog";

interface ApplicationDialogsProps {
  app: Application;
  active: ApplicationDialog | null;
  classOptions: Option[];
  onClose: () => void;
  withdraw: { submitting: boolean; error: string | null; onSubmit: (reason: string) => void };
}

/** The one action dialog open over the application drawer. */
export function ApplicationDialogs({ app, active, classOptions, onClose, withdraw }: ApplicationDialogsProps) {
  const context = { branchId: app.branchId, sessionId: app.sessionId, classId: app.classId };
  return (
    <>
      {active === "edit" && (
        <ApplicationFormDialog item={app} context={context} classOptions={classOptions} onClose={onClose} />
      )}
      {active === "test" && <ScheduleTestDialog app={app} onClose={onClose} />}
      {active === "result" && <TestResultDialog app={app} onClose={onClose} />}
      {active === "decide" && <DecideDialog app={app} onClose={onClose} />}
      {active === "confirm" && <ConfirmAdmissionDialog app={app} onClose={onClose} />}
      {active === "withdraw" && (
        <ReasonDialog
          open
          onOpenChange={(open) => !open && onClose()}
          title={`Withdraw application ${app.applicationNo}?`}
          description="The application is closed and can't be reopened."
          submitLabel="Withdraw"
          submitting={withdraw.submitting}
          error={withdraw.error}
          onSubmit={withdraw.onSubmit}
        />
      )}
    </>
  );
}
