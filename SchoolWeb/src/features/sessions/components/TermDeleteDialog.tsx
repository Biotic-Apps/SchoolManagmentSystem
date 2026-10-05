"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteTerm } from "../api";
import type { Term } from "../types";

interface TermDeleteDialogProps {
  sessionId: string;
  term: Term | null;
  onClose: () => void;
}

export function TermDeleteDialog({ sessionId, term, onClose }: TermDeleteDialogProps) {
  const mutation = useDeleteTerm(sessionId);

  const confirm = () => {
    if (term) mutation.mutate(term.id, { onSuccess: onClose });
  };

  return (
    <ConfirmDialog
      open={!!term}
      onOpenChange={(open) => !open && onClose()}
      title={`Delete ${term?.name}?`}
      description="The term is removed from this session."
      confirmLabel="Delete term"
      tone="danger"
      loading={mutation.isPending}
      onConfirm={confirm}
    />
  );
}
