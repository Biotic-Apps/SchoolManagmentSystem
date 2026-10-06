import { Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatTimeRange } from "@/lib/time";
import { modeLabel } from "../options";
import type { MeetingSlot } from "../types";

export function SlotItem({ slot, onDelete }: { slot: MeetingSlot; onDelete: () => void }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-input border border-border px-4 py-2.5">
      <span className="whitespace-nowrap text-label font-medium text-fg">{formatTimeRange(slot.startTime, slot.endTime)}</span>
      <span className="text-label text-fg-muted">{modeLabel(slot.mode)}</span>
      {slot.location && <span className="min-w-0 truncate text-label text-fg-muted">· {slot.location}</span>}
      <span className="ml-auto flex items-center gap-2">
        <StatusBadge status={slot.status} />
        {slot.status === "OPEN" && (
          <Button variant="ghost" size="sm" aria-label="Remove slot" onClick={onDelete}>
            <Trash2 />
          </Button>
        )}
      </span>
    </li>
  );
}
