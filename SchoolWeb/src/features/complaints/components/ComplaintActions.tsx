"use client";

import { ArrowUpCircle, CircleCheck, MessageSquarePlus, RotateCcw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ComplaintDetail, ComplaintDialog } from "../use-complaint-detail";

interface ComplaintActionsProps {
  rights: ComplaintDetail["rights"];
  onOpen: (dialog: ComplaintDialog) => void;
}

export function ComplaintActions({ rights, onOpen }: ComplaintActionsProps) {
  return (
    <>
      {rights.update && (
        <Button size="sm" onClick={() => onOpen("update")}>
          <MessageSquarePlus />
          Add update
        </Button>
      )}
      {rights.assign && (
        <Button size="sm" variant="secondary" onClick={() => onOpen("assign")}>
          <UserPlus />
          Assign
        </Button>
      )}
      {rights.escalate && (
        <Button size="sm" variant="secondary" onClick={() => onOpen("escalate")}>
          <ArrowUpCircle />
          Escalate
        </Button>
      )}
      {rights.reopen && (
        <Button size="sm" variant="secondary" onClick={() => onOpen("reopen")}>
          <RotateCcw />
          Reopen
        </Button>
      )}
      {rights.close && (
        <Button size="sm" variant="secondary" onClick={() => onOpen("close")}>
          <CircleCheck />
          Close
        </Button>
      )}
    </>
  );
}
