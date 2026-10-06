import { canScheduleTestStatus, isBeforeDecision, isOpenStatus } from "./status";
import type { Application } from "./types";

export interface ApplicationActionFlags {
  edit: boolean;
  scheduleTest: boolean;
  recordResult: boolean;
  decide: boolean;
  confirm: boolean;
  withdraw: boolean;
}

export const NO_ACTIONS: ApplicationActionFlags = {
  edit: false,
  scheduleTest: false,
  recordResult: false,
  decide: false,
  confirm: false,
  withdraw: false,
};

/** Which workflow actions the user may take on the application in its current status. */
export function applicationActions(app: Application, can: (permission: string) => boolean): ApplicationActionFlags {
  const { status } = app;
  const canEdit = can("admissions.edit");
  const canApprove = can("admissions.approve");
  return {
    edit: canEdit && isBeforeDecision(status),
    scheduleTest: canEdit && canScheduleTestStatus(status),
    recordResult: canEdit && status === "TEST_SCHEDULED",
    decide: canApprove && isBeforeDecision(status),
    confirm: canApprove && status === "OFFERED",
    withdraw: canEdit && isOpenStatus(status),
  };
}
