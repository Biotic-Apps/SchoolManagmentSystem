"use client";

import { useState } from "react";
import { Printer, Smartphone } from "lucide-react";
import { CopyButton } from "@/components/shared/CopyButton";
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

/** One-time parent sign-in details with copy buttons and a branded printable login slip. */
export function ParentSignInDialog({
  title = "Parent sign-in details",
  child,
  logins,
  onClose,
}: ParentSignInDialogProps) {
  const branding = useBranding(useSessionSchoolId());
  const [printing, setPrinting] = useState(false);
  const fresh = logins.some((l) => l.temporaryPassword);
  const printable = logins.some((l) => l.status !== "SKIPPED");
  const url = loginPageUrl();

  const print = async () => {
    setPrinting(true);
    try {
      await printLoginSlip({
        school: { name: branding.data?.schoolName ?? "School", logoUrl: branding.data?.logoUrl ?? null },
        child,
        logins,
      });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Parents see their children’s attendance, homework, results and fees on the website or in the eSchool app.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-input bg-selected px-3 py-2.5 text-label">
            <span className="text-fg-muted">Sign in at</span>
            <span className="min-w-0 break-all font-medium text-on-selected">{url}</span>
            <CopyButton text={url} aria-label="Copy sign-in address" className="-my-1" />
            <span className="flex items-center gap-1 text-fg-muted">
              <Smartphone className="size-4" aria-hidden />
              or the eSchool app
            </span>
          </div>
          {logins.map((login) => (
            <ParentLoginCard key={login.guardianId} login={login} child={child} />
          ))}
          {fresh && (
            <InlineNotice tone="warning">
              <strong>Shown only once.</strong> Copy or print it now and give it to the parent privately. They choose
              their own password the first time they sign in.
            </InlineNotice>
          )}
        </div>
        <DialogFooter>
          {printable && (
            <Button variant="secondary" onClick={print} loading={printing}>
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
