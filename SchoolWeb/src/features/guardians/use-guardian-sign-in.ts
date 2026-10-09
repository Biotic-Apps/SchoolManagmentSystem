import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { toast } from "@/lib/toast";
import { useDialogState } from "@/lib/use-dialog-state";
import { useCreateParentAccount, useGuardian, useResetParentPassword, useSendParentSignIn } from "./api";
import type { Guardian, ParentLogin, SlipChild } from "./types";

type Action = "create" | "reset";

const SENT_TO = { EMAIL: "email", SMS: "SMS" } as const;

/**
 * A guardian's parent sign-in: status, and staff actions to give it, reset the
 * password (both reveal a one-time temporary password) or resend the steps.
 */
export function useGuardianSignIn(guardian: Guardian, child: SlipChild | null) {
  const can = useCan();
  const detail = useGuardian(can("guardians.view") ? guardian.id : null);
  const confirm = useDialogState<Action>();
  const [revealed, setRevealed] = useState<{ title: string; login: ParentLogin } | null>(null);
  const create = useCreateParentAccount();
  const reset = useResetParentPassword();
  const send = useSendParentSignIn();
  const login = detail.data?.login ?? null;
  const canManage = can("guardians.edit");
  const firstChild = detail.data?.children.find((c) => c.status === "VERIFIED" && c.admissionNo);
  const slipChild = child ?? (firstChild ? { name: firstChild.name, admissionNo: firstChild.admissionNo! } : null);

  const reveal = (title: string, ids: { email: string | null; phone: string | null }, password: string | null) => {
    confirm.close();
    setRevealed({
      title,
      login: {
        guardianId: guardian.id,
        guardianName: guardian.name,
        status: password ? "CREATED" : "EXISTING",
        temporaryPassword: password,
        reason: null,
        ...ids,
      },
    });
  };

  const onConfirm = () => {
    if (confirm.item === "create") {
      create.mutate(guardian.id, {
        onSuccess: (r) => reveal(`${guardian.name} can now sign in`, r, r.temporaryPassword),
      });
    } else {
      reset.mutate(guardian.id, {
        onSuccess: (r) =>
          reveal(
            `New password for ${guardian.name}`,
            { email: login?.email ?? null, phone: login?.phone ?? null },
            r.temporaryPassword,
          ),
      });
    }
  };

  const sendDetails = () =>
    send.mutate(guardian.id, {
      onSuccess: (r) =>
        toast.success(`Sign-in steps sent to ${guardian.name} by ${r.channels.map((c) => SENT_TO[c]).join(" and ")}`),
    });

  return {
    hasAccount: guardian.hasAccount,
    login,
    slipChild,
    canCreate: canManage && !guardian.hasAccount,
    canReset: canManage && can("users.edit") && guardian.hasAccount,
    canSend: canManage && login?.status === "ACTIVE",
    confirm,
    onConfirm,
    confirming: create.isPending || reset.isPending,
    sendDetails,
    sending: send.isPending,
    revealed,
    clearRevealed: () => setRevealed(null),
  };
}
