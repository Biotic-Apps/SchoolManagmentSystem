"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { NUMERIC_COLUMN } from "@/lib/table";
import { useMarkGridNav } from "../../use-mark-grid-nav";
import type { MarkSheetEditorState } from "../../use-mark-sheet-editor";
import { MarkRowItem } from "./MarkRowItem";

interface MarkGridProps {
  editor: MarkSheetEditorState;
  editable: boolean;
  flagged: Set<string>;
}

/** Keyboard-friendly marks grid (rows need their own highlight, so it is not a DataTable). */
export function MarkGrid({ editor, editable, flagged }: MarkGridProps) {
  const nav = useMarkGridNav();

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Roll no</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className={NUMERIC_COLUMN}>Marks</TableHead>
            <TableHead>Absent</TableHead>
            <TableHead>Remark</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editor.rows.map((row, index) => (
            <MarkRowItem
              key={row.studentId}
              row={row}
              index={index}
              editable={editable}
              flagged={flagged.has(row.studentId)}
              nav={nav}
              editor={editor}
            />
          ))}
        </TableBody>
      </Table>
      {editor.rows.length === 0 && (
        <EmptyState title="No students on this sheet" description="Students appear once they are enrolled in the section." />
      )}
    </div>
  );
}
