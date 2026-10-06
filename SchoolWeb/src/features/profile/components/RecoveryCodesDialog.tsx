"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { downloadTextFile, recoveryCodesText } from "../recovery-codes";

interface RecoveryCodesDialogProps {
  codes: string[] | null;
  account: string;
  onClose: () => void;
}

/** One-time view of the recovery codes; the API keeps only their hashes. */
export function RecoveryCodesDialog({ codes, account, onClose }: RecoveryCodesDialogProps) {
  const [copied, setCopied] = useState(false);
  const text = codes ? recoveryCodesText(codes, account) : "";

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <Dialog open={!!codes} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save your recovery codes</DialogTitle>
          <DialogDescription>
            Use one of these if you lose your phone. Each code works once and they are shown only now.
          </DialogDescription>
        </DialogHeader>
        {codes && codes.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 rounded-input border border-border bg-background p-3">
            {codes.map((code) => (
              <li key={code} className="select-all font-mono text-label text-fg">
                {code}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-label text-fg-muted">No recovery codes were returned. Turn two-step sign-in off and on again to get new ones.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={copy} disabled={!codes?.length}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy all"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadTextFile("eschool-recovery-codes.txt", text)}
            disabled={!codes?.length}
          >
            <Download />
            Download
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>I have saved them</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
