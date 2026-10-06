import { Badge } from "@/components/ui/Badge";
import { roomName } from "../grid";
import type { TeacherSlot } from "../types";

interface TeacherSlotCellProps {
  slots: TeacherSlot[] | undefined;
  /** Teacher views show which class the period is in. */
  showSection: boolean;
}

export function TeacherSlotCell({ slots, showSection }: TeacherSlotCellProps) {
  if (!slots?.length) return null;
  return (
    <>
      {slots.map((slot) => (
        <div key={`${slot.section.id}-${slot.subject.id}`} className="flex flex-col gap-0.5">
          <span className="font-medium text-fg">{slot.subject.name}</span>
          {showSection && (
            <span className="text-caption text-fg-muted">
              {slot.section.className} {slot.section.name}
            </span>
          )}
          {roomName(slot.room) && <span className="text-caption text-fg-muted">{roomName(slot.room)}</span>}
          {slot.isSubstitute && (
            <Badge tone="warning" className="self-start">
              Substitute
            </Badge>
          )}
        </div>
      ))}
    </>
  );
}
