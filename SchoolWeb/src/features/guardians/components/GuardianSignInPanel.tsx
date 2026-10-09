"use client";

import { KeyRound, RotateCcw, Send } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import type { Guardian, SlipChild } from "../types";
import { useGuardianSignIn } from "../use-guardian-sign-in";
import { GuardianSignInHint } from "./GuardianSignInHint";
import { ParentSignInDialog } from "./ParentSignInDialog";

const CONFIRM = {
  create: {
    title: (name: string) => `Give ${name} parent sign-in?`,
    description:
      "Creates their parent sign-in with a temporary password, shown once with a printable login slip. They then see their children's attendance, homework, results and fees.",
    label: "Give sign-in access",
  },
  reset: {
    title: (name: string) => `Make a new password for ${name}?`,
    description:
      "Their old password stops working and they are signed out everywhere. The new temporary password is shown once with a printable login slip.",
    label: "Make new password",
  },
} as const;

interface GuardianSignInPanelProps {
  guardian: Guardian;
  /** The child whose admission number is printed as the username. */
  child?: SlipChild | null;
}

/** How a guardian signs in to the parent app/website, with staff actions. */
export function GuardianSignInPanel({ guardian, child = null }: GuardianSignInPanelProps) {
  const signIn = useGuardianSignIn(guardian, child);
  const action = signIn.confirm.item;

  return (
    <div className="flex flex-col gap-2 rounded-input bg-background p-3">
      <p className="flex items-start gap-1.5 text-label">
        <KeyRound className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
        <GuardianSignInHint
          hasAccount={signIn.hasAccount}
          login={signIn.login}
          admissionNo={signIn.slipChild?.admissionNo}
        />
      </p>
      {(signIn.canCreate || signIn.canSend || signIn.canReset) && (
        <div className="flex flex-wrap gap-2">
          {signIn.canCreate && (
            <Button size="sm" onClick={() => signIn.confirm.show("create")}>
              <KeyRound />
              Give sign-in access
            </Button>
          )}
          {signIn.canReset && (
            <Button variant="secondary" size="sm" onClick={() => signIn.confirm.show("reset")}>
              <RotateCcw />
              New password &amp; login slip
            </Button>
          )}
          {signIn.canSend && (
            <Button variant="ghost" size="sm" loading={signIn.sending} onClick={signIn.sendDetails}>
              <Send />
              Send sign-in steps
            </Button>
          )}
        </div>
      )}
      <ConfirmDialog
        open={!!action}
        onOpenChange={signIn.confirm.onOpenChange}
        title={action ? CONFIRM[action].title(guardian.name) : ""}
        description={action ? CONFIRM[action].description : undefined}
        confirmLabel={action ? CONFIRM[action].label : undefined}
        loading={signIn.confirming}
        onConfirm={signIn.onConfirm}
      />
      {signIn.revealed && (
        <ParentSignInDialog
          title={signIn.revealed.title}
          child={signIn.slipChild}
          logins={[signIn.revealed.login]}
          onClose={signIn.clearRevealed}
        />
      )}
    </div>
  );
}
