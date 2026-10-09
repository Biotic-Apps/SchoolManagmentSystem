"use client";

import { Printer } from "lucide-react";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useBranding } from "@/features/branding/api";
import { useSessionSchoolId } from "@/features/branding/use-session-school-id";
import { loginPageUrl, printLoginSlip } from "../print-login-slip";
import type { ParentLogin, SlipChild } from "../types";
import { ParentLoginCard } from "./ParentLoginCard";

interface ParentSignInDialogProps {
  title?: string;
  child: SlipChild | null;
  logins: ParentLogin[];
  onClose: () => void;
}

/** One-time parent sign-in details with copy buttons and a printable login slip. */
export function ParentSignInDialog({
  title = "Parent sign-in details",
  child,
  logins,
  onClose,
}: ParentSignInDialogProps) {
  const branding = useBranding(useSessionSchoolId());
  const printable = logins.some((l) => l.temporaryPassword);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Parents sign in at {loginPageUrl()} or in the app with the username and password below, and see their
            children’s attendance, homework, results and fees.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {logins.map((login) => (
            <ParentLoginCard key={login.guardianId} login={login} child={child} />
          ))}
          {printable && (
            <InlineNotice tone="warning">
              <strong>Shown only once.</strong> Copy or print it now and give it to the parent privately. They choose
              their own password the first time they sign in.
            </InlineNotice>
          )}
        </div>
        <DialogFooter>
          {printable && (
            <Button
              variant="secondary"
              onClick={() => printLoginSlip({ schoolName: branding.data?.schoolName ?? null, child, logins })}
            >
              <Printer />
              Print login slip
            </Button>
          )}
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
