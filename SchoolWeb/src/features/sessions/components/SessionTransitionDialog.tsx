"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useSessionTransition } from "../api";
import type { TransitionTarget } from "../use-sessions-tab";

interface SessionTransitionDialogProps {
  target: TransitionTarget | null;
  onClose: () => void;
}

const COPY = {
  activate: {
    title: (name: string) => `Activate ${name}?`,
    description:
      "This becomes the branch's current session. Only one session can be active per branch — close the current one first if needed.",
    confirm: "Activate",
    tone: "primary",
  },
  close: {
    title: (name: string) => `Close ${name}?`,
    description:
      "Closing makes this session and its terms read-only — nothing in it can be edited afterwards. There is no way to reopen it.",
    confirm: "Close session",
    tone: "danger",
  },
} as const;

export function SessionTransitionDialog({ target, onClose }: SessionTransitionDialogProps) {
  const mutation = useSessionTransition();
  const copy = COPY[target?.action ?? "activate"];

  const confirm = () => {
    if (target) mutation.mutate({ id: target.session.id, action: target.action }, { onSuccess: onClose });
  };

  return (
    <ConfirmDialog
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
      title={copy.title(target?.session.name ?? "")}
      description={copy.description}
      confirmLabel={copy.confirm}
      tone={copy.tone}
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
