"use client";

import { Trash2 } from "lucide-react";
import { FormAlert } from "@/components/shared/FormAlert";
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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { School } from "../types";
import { DeletionPreviewList } from "./DeletionPreviewList";
import { useDeleteSchool } from "./use-delete-school";

interface DeleteSchoolDialogProps {
  school: School;
  onClose: () => void;
  onDeleted: (school: School) => void;
}

/** Permanent delete: shows what goes, then asks for the school code. */
export function DeleteSchoolDialog({ school, onClose, onDeleted }: DeleteSchoolDialogProps) {
  const flow = useDeleteSchool(school, onDeleted);
  const { preview } = flow;

  return (
    <Dialog open onOpenChange={(open) => !open && !flow.running && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete {school.name} permanently?</DialogTitle>
          <DialogDescription>
            Everything in this school is removed from eSchool for good: branches, people, classes, attendance, fees and
            files. People who only belong to this school lose their accounts.
          </DialogDescription>
        </DialogHeader>

        <DeletionPreviewList
          preview={preview.data}
          loading={preview.isLoading}
          error={preview.error}
          onRetry={() => preview.refetch()}
        />

        <p className="text-label font-semibold text-error">This can&apos;t be undone.</p>
        {school.status === "ACTIVE" && (
          <p className="-mt-2 text-caption text-fg-muted">
            If you may need this school again, archive it instead.
          </p>
        )}

        <form
          id="delete-school-form"
          className="flex flex-col gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            flow.submit();
          }}
        >
          <Label htmlFor="delete-school-code">
            Type <span className="font-mono font-semibold text-fg">{school.code}</span> to confirm
          </Label>
          <Input
            id="delete-school-code"
            value={flow.confirmText}
            onChange={(event) => flow.setConfirmText(event.target.value)}
            disabled={flow.running}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        </form>

        {flow.running && (
          <InlineNotice>Deleting {school.name}… this can take a minute. Keep this window open.</InlineNotice>
        )}
        <FormAlert message={flow.error} />

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={flow.running}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="delete-school-form"
            variant="danger"
            loading={flow.running}
            disabled={!flow.matches || !preview.data}
          >
            {!flow.running && <Trash2 />}
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
