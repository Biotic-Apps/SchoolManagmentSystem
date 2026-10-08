"use client";

import { SignInCredentials } from "@/components/shared/SignInCredentials";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface SignInResultDialogProps {
  title: string;
  description: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  temporaryPassword?: string | null;
  onClose: () => void;
}

/** Success step after creating a sign-in or resetting its password. */
export function SignInResultDialog({ title, description, onClose, ...credentials }: SignInResultDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <SignInCredentials {...credentials} stacked />
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
