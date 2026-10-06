"use client";

import { CalendarClock, CircleCheckBig, ClipboardCheck, Gavel, Pencil, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ApplicationActionFlags } from "../application-actions";
import type { ApplicationDialog } from "../use-application-detail";

interface ApplicationActionsProps {
  actions: ApplicationActionFlags;
  hasTest: boolean;
  onOpen: (dialog: ApplicationDialog) => void;
}

/** Workflow buttons for the drawer header; only the ones allowed now are shown. */
export function ApplicationActions({ actions, hasTest, onOpen }: ApplicationActionsProps) {
  return (
    <>
      {actions.confirm && (
        <Button size="sm" onClick={() => onOpen("confirm")}>
          <CircleCheckBig />
          Confirm admission
        </Button>
      )}
      {actions.decide && (
        <Button size="sm" onClick={() => onOpen("decide")}>
          <Gavel />
          Decide
        </Button>
      )}
      {actions.recordResult && (
        <Button variant="secondary" size="sm" onClick={() => onOpen("result")}>
          <ClipboardCheck />
          Record result
        </Button>
      )}
      {actions.scheduleTest && (
        <Button variant="secondary" size="sm" onClick={() => onOpen("test")}>
          <CalendarClock />
          {hasTest ? "Reschedule test" : "Schedule test"}
        </Button>
      )}
      {actions.edit && (
        <Button variant="secondary" size="sm" onClick={() => onOpen("edit")}>
          <Pencil />
          Edit
        </Button>
      )}
      {actions.withdraw && (
        <Button variant="danger" size="sm" onClick={() => onOpen("withdraw")}>
          <Undo2 />
          Withdraw
        </Button>
      )}
    </>
  );
}
