"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { useBranchSettings } from "../api";
import type { Branch } from "../types";
import { BranchSettingsForm } from "./BranchSettingsForm";

/** Loads the branch settings (merged with defaults) before showing the form. */
export function BranchSettingsDialog({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const query = useBranchSettings(branch.id);

  if (query.data) {
    return <BranchSettingsForm branchId={branch.id} branchName={branch.name} settings={query.data} onClose={onClose} />;
  }
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogTitle>Settings — {branch.name}</DialogTitle>
        {query.error ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <div className="grid place-items-center py-10 text-fg-muted">
            <Spinner className="size-6" label="Loading settings" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
