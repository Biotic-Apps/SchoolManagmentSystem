import { useState } from "react";
import { useDialogState } from "@/lib/use-dialog-state";
import { useCreateParentAccount } from "./api";
import type { Guardian } from "./types";

/** Confirm, create the PARENT login, then reveal its one-time temporary password. */
export function useParentAccount() {
  const confirmTarget = useDialogState<Guardian>();
  const create = useCreateParentAccount();
  const [revealed, setRevealed] = useState<{ title: string; password: string; login: string } | null>(null);

  const confirm = () => {
    const guardian = confirmTarget.item;
    if (!guardian) return;
    create.mutate(guardian.id, {
      onSuccess: (result) => {
        confirmTarget.close();
        setRevealed({
          title: `Temporary password for ${guardian.name}`,
          password: result.temporaryPassword,
          login: [guardian.phone, guardian.email].filter(Boolean).join(" or "),
        });
      },
    });
  };

  return {
    confirmTarget,
    confirm,
    creating: create.isPending,
    revealed,
    clearRevealed: () => setRevealed(null),
  };
}
