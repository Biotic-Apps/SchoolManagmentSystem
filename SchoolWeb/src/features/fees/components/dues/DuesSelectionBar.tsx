"use client";

import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";

interface DuesSelectionBarProps {
  selection: { count: number; allOnPage: boolean; toggleAll: () => void; clear: () => void };
  hasRows: boolean;
  sending: boolean;
  onSend: () => void;
}

/** Select students on the page and send fee reminders to their guardians. */
export function DuesSelectionBar({ selection, hasRows, sending, onSend }: DuesSelectionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="dues-select-all" checked={selection.allOnPage} disabled={!hasRows} onCheckedChange={selection.toggleAll} />
        <Label htmlFor="dues-select-all">Select all on this page</Label>
      </div>
      <span className="text-label text-fg-muted">{selection.count} selected</span>
      {selection.count > 0 && (
        <Button variant="ghost" size="sm" onClick={selection.clear}>
          Clear
        </Button>
      )}
      <Button className="sm:ml-auto" disabled={selection.count === 0} loading={sending} onClick={onSend}>
        <BellRing />
        Send reminders
      </Button>
    </div>
  );
}
