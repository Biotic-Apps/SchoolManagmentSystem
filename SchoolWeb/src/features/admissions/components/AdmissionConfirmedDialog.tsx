"use client";

import { CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { StudentProfileLink } from "./StudentProfileLink";

interface AdmissionConfirmedDialogProps {
  name: string;
  studentId: string;
  onClose: () => void;
}

/** Success state after confirming an admission, with a way to the new student's profile. */
export function AdmissionConfirmedDialog({ name, studentId, onClose }: AdmissionConfirmedDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-success-soft text-success">
            <CircleCheckBig className="size-5" />
          </span>
          <DialogTitle>{name} is enrolled</DialogTitle>
          <DialogDescription>
            The student record, guardian links and enrollment were created. The ID card is being prepared.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <StudentProfileLink studentId={studentId} size="md" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
