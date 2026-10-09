"use client";

import { Fragment } from "react";
import { Plus } from "lucide-react";
import type { Option } from "@/components/shared/OptionSelect";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useClassSubjectOptions } from "@/features/classes/api";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { ScheduleRow } from "../../schedule-rows";
import { SchedulePaperRow } from "./SchedulePaperRow";

interface ScheduleClassGroupProps {
  classId: string;
  className: string;
  rows: ScheduleRow[];
  problems: Record<string, string[]>;
  roomOptions: Option[];
  readOnly: boolean;
  onAdd: () => void;
  onChange: (key: string, patch: Partial<ScheduleRow>) => void;
  onRemove: (key: string) => void;
}

const HEADERS = [
  { id: "subject", label: "Subject" },
  { id: "date", label: "Date" },
  { id: "start", label: "Start" },
  { id: "end", label: "End" },
  { id: "max", label: "Max marks", numeric: true },
  { id: "pass", label: "Pass marks", numeric: true },
  { id: "room", label: "Room" },
];

/** Papers of one class; subject choices are the subjects taught in that class. */
export function ScheduleClassGroup(props: ScheduleClassGroupProps) {
  const { classId, className, rows, problems, roomOptions, readOnly, onAdd, onChange, onRemove } = props;
  const subjects = useClassSubjectOptions(classId);

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        title={className}
        actions={
          !readOnly && (
            <Button variant="secondary" size="sm" onClick={onAdd}>
              <Plus />
              Add paper
            </Button>
          )
        }
      />
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {HEADERS.map((header) => (
                <TableHead key={header.id} className={header.numeric ? NUMERIC_COLUMN : undefined}>
                  {header.label}
                </TableHead>
              ))}
              <TableHead className="w-12">
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={HEADERS.length + 1} className="text-fg-muted">
                  No papers for this class yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const rowProblems = problems[row.key] ?? [];
              return (
                <Fragment key={row.key}>
                  <SchedulePaperRow
                    row={row}
                    subjectOptions={subjects.options}
                    roomOptions={roomOptions}
                    readOnly={readOnly}
                    invalid={rowProblems.length > 0}
                    onChange={(patch) => onChange(row.key, patch)}
                    onRemove={() => onRemove(row.key)}
                  />
                  {rowProblems.length > 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={HEADERS.length + 1} className="px-2 pb-3 pt-0">
                        <p role="alert" className="text-caption text-error">
                          {rowProblems.join(" · ")}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
