import type { CellValue } from "../grid";

/** Section-grid cell: subject / teacher / room, or an empty hint. */
export function SlotCell({ cell, emptyLabel }: { cell: CellValue | undefined; emptyLabel?: string }) {
  if (!cell) return <span className="text-caption text-fg-muted">{emptyLabel ?? ""}</span>;
  return (
    <>
      <span className="font-medium text-fg">{cell.subject.name}</span>
      <span className="text-caption text-fg-muted">{cell.staff.name}</span>
      {cell.room && <span className="text-caption text-fg-muted">{cell.room.name}</span>}
    </>
  );
}
