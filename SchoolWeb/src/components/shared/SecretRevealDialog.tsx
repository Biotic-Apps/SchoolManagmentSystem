"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { CopyButton } from "./CopyButton";

interface SecretRevealDialogProps {
  secret: string | null;
  title: string;
  description: string;
  onClose: () => void;
}

/** Shows a one-time secret (e.g. a temporary password); it is never shown again after closing. */
export function SecretRevealDialog({ secret, title, description, onClose }: SecretRevealDialogProps) {
  return (
    <Dialog open={!!secret} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-input border border-border bg-background px-3 py-2">
          <code className="flex-1 select-all break-all font-mono text-body text-fg">{secret}</code>
          {secret && <CopyButton text={secret} />}
        </div>
        <p className="text-caption text-fg-muted">The user must change it at first sign-in.</p>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
