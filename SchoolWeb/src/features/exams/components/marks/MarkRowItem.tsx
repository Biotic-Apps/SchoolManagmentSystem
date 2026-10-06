"use client";

import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { TableCell, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { EMPTY_VALUE } from "@/lib/format";
import type { MarkGridNav } from "../../use-mark-grid-nav";
import type { MarkEditorRow, MarkSheetEditorState } from "../../use-mark-sheet-editor";

interface MarkRowItemProps {
  row: MarkEditorRow;
  index: number;
  editable: boolean;
  flagged: boolean;
  nav: MarkGridNav;
  editor: MarkSheetEditorState;
}

/** One student: marks cell, Absent toggle and an optional remark. */
export function MarkRowItem({ row, index, editable, flagged, nav, editor }: MarkRowItemProps) {
  const marksId = `marks-${row.studentId}`;
  const errorId = `${marksId}-error`;

  return (
    <TableRow className={cn(flagged ? "bg-error-soft/40" : row.pending && "bg-warning-soft/40")}>
      <TableCell className="w-20 whitespace-nowrap tabular-nums">{row.rollNo ?? EMPTY_VALUE}</TableCell>
      <TableCell className="min-w-56">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-fg">{row.name}</span>
          {row.pending && <Badge tone={flagged ? "error" : "warning"}>Pending</Badge>}
        </span>
      </TableCell>
      <TableCell className="w-36 align-top">
        {editable ? (
          <div className="flex flex-col gap-1">
            <Input
              id={marksId}
              ref={nav.register(index)}
              inputMode="decimal"
              autoComplete="off"
              aria-label={`Marks for ${row.name}`}
              aria-invalid={!!row.error}
              aria-describedby={row.error ? errorId : undefined}
              placeholder={row.absent ? "Absent" : "Marks"}
              disabled={row.absent}
              value={row.marks}
              onChange={(event) => editor.setMarks(row.studentId, event.target.value)}
              onKeyDown={nav.onKeyDown(index)}
              className={cn("h-9 text-right tabular-nums", row.belowPass && "text-error")}
            />
            {row.error && (
              <span id={errorId} role="alert" className="text-caption text-error">
                {row.error}
              </span>
            )}
          </div>
        ) : (
          <span className={cn("block text-right tabular-nums", row.belowPass && "text-error")}>
            {row.absent ? "Absent" : row.marks || EMPTY_VALUE}
          </span>
        )}
      </TableCell>
      <TableCell className="w-24">
        <Checkbox
          aria-label={`${row.name} absent`}
          checked={row.absent}
          disabled={!editable}
          onCheckedChange={(checked) => editor.setAbsent(row.studentId, checked === true)}
        />
      </TableCell>
      <TableCell className="min-w-48">
        {editable ? (
          <Input
            aria-label={`Remark for ${row.name}`}
            placeholder="Optional"
            maxLength={200}
            value={row.remark}
            onChange={(event) => editor.setRemark(row.studentId, event.target.value)}
            className="h-9"
          />
        ) : (
          <span className="text-fg-muted">{row.remark || EMPTY_VALUE}</span>
        )}
      </TableCell>
    </TableRow>
  );
}
