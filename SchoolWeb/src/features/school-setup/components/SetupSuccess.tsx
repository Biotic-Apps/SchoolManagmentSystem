"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { FormPanel } from "@/components/shared/FormPanel";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { countOf } from "../summary";
import type { SchoolSetupResult } from "../types";
import { SignInDetail } from "./SignInDetail";

function createdLine({ session, counts }: SchoolSetupResult): string {
  if (!session) return "No academic year yet; the principal can set it up from Sessions & Calendar.";
  return `Session ${session.name} is active with ${countOf(counts.classes, "class", "classes")}, ${countOf(
    counts.sections,
    "section",
    "sections",
  )} and ${countOf(counts.subjects, "subject", "subjects")}.`;
}

export function SetupSuccess({ result }: { result: SchoolSetupResult }) {
  const { principal } = result;
  const temporary = principal.temporaryPassword;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <CircleCheck className="mt-0.5 size-6 shrink-0 text-success" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-body font-semibold text-fg">
            {result.school.name} and its {result.branch.name} are ready.
          </p>
          <p className="text-label text-fg-muted">{createdLine(result)}</p>
        </div>
      </div>

      <FormPanel
        title={`Principal sign-in for ${principal.name}`}
        description="A welcome message with sign-in steps was also sent to the principal (without the password)."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {principal.email && <SignInDetail label="Email" value={principal.email} />}
          {principal.phone && <SignInDetail label="Phone" value={principal.phone} />}
          {temporary && <SignInDetail label="Temporary password" value={temporary} secret />}
        </div>
        {temporary ? (
          <InlineNotice tone="warning">
            <strong>Shown only once.</strong> Copy it now and share it with {principal.name} privately. They choose a new
            password the first time they sign in.
          </InlineNotice>
        ) : (
          <p className="text-label text-fg-muted">They sign in with the password you set; no change is needed.</p>
        )}
      </FormPanel>
    </div>
  );
}

interface FooterProps {
  branchId: string;
  onDone: () => void;
  className?: string;
}

export function SetupSuccessFooter({ branchId, onDone, className }: FooterProps) {
  return (
    <footer className={cn("flex shrink-0 items-center justify-end gap-2 border-t border-border bg-surface py-4", className)}>
      <Button variant="secondary" asChild>
        <Link href={`/branches?open=${branchId}`} onClick={onDone}>
          Open branch
        </Link>
      </Button>
      <Button onClick={onDone}>Done</Button>
    </footer>
  );
}
