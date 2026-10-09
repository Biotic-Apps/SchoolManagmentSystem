"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { EMPTY_VALUE } from "@/lib/format";
import { SKILL_DOMAINS, type SkillGrid } from "../../skill-types";
import type { SkillGridEditor } from "../../use-skill-grid-editor";
import { SkillRatingSelect } from "./SkillRatingSelect";

interface SkillGridTableProps {
  grid: SkillGrid;
  editor: SkillGridEditor;
  editable: boolean;
}

/** Students down, skills across (grouped by domain); each cell is a rating. */
export function SkillGridTable({ grid, editor, editable }: SkillGridTableProps) {
  const domains = SKILL_DOMAINS.map((domain) => ({
    ...domain,
    items: grid.items.filter((item) => item.domain === domain.id),
  })).filter((domain) => domain.items.length > 0);
  const items = domains.flatMap((domain) => domain.items);

  if (grid.students.length === 0) {
    return <EmptyState title="No students in this section" description="Students appear once they are enrolled." />;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead rowSpan={2} className="sticky left-0 z-10 min-w-48 bg-surface">
              Student
            </TableHead>
            {domains.map((domain) => (
              <TableHead key={domain.id} colSpan={domain.items.length} className="border-l border-border text-center">
                {domain.name}
                <span className="block text-caption font-normal text-fg-muted">{domain.hint}</span>
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="hover:bg-transparent">
            {domains.map((domain) =>
              domain.items.map((item, index) => (
                <TableHead
                  key={item.id}
                  className={index === 0 ? "border-l border-border text-center" : "text-center"}
                >
                  <span className="block w-20 whitespace-normal text-caption leading-tight">{item.name}</span>
                </TableHead>
              )),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {grid.students.map((student) => (
            <TableRow key={student.studentId}>
              <TableCell className="sticky left-0 z-10 bg-surface">
                <span className="font-medium text-fg">{student.name}</span>
                <span className="block text-caption text-fg-muted">Roll no {student.rollNo ?? EMPTY_VALUE}</span>
              </TableCell>
              {items.map((item) => (
                <TableCell key={item.id} className="px-1.5 text-center">
                  <SkillRatingSelect
                    label={`${item.name} for ${student.name}`}
                    value={editor.valueOf(student.studentId, item.id)}
                    scale={grid.scale}
                    disabled={!editable}
                    onChange={(value) => editor.set(student.studentId, item.id, value)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
