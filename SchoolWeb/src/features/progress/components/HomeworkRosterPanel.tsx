"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { CheckCheck, Save } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DiaryEntry } from "@/features/diary/types";
import type { StudentSummary } from "@/features/students/types";
import { formatDate } from "@/lib/format";
import { homeworkColumns } from "../homework-columns";
import { useHomeworkEditor } from "../use-homework-editor";

interface HomeworkRosterPanelProps {
  entry: DiaryEntry;
  students: StudentSummary[];
  studentsQuery: Pick<UseQueryResult, "isLoading" | "error" | "refetch">;
  editable: boolean;
}

export function HomeworkRosterPanel({ entry, students, studentsQuery, editable }: HomeworkRosterPanelProps) {
  const editor = useHomeworkEditor(entry, students);
  const columns = homeworkColumns({ editable: editable && !editor.saving, onStatus: editor.setStatus });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>{entry.subject.name}</CardTitle>
            <CardDescription className="whitespace-pre-wrap break-words">{entry.homework}</CardDescription>
            {entry.dueDate && <CardDescription>Due {formatDate(entry.dueDate)}</CardDescription>}
          </div>
          {editable && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={editor.markAllDone} disabled={editor.saving || !students.length}>
                <CheckCheck />
                Mark all done
              </Button>
              {editor.dirty && (
                <Button variant="ghost" size="sm" onClick={editor.reset} disabled={editor.saving}>
                  Discard
                </Button>
              )}
              <Button size="sm" onClick={editor.save} loading={editor.saving} disabled={!editor.dirty}>
                <Save />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>
      <p className="text-caption text-fg-muted">
        {editor.marked} of {students.length} students checked
      </p>
      <DataTable
        columns={columns}
        rows={editor.rows}
        getRowId={(row) => row.id}
        loading={studentsQuery.isLoading}
        error={studentsQuery.error}
        onRetry={() => studentsQuery.refetch()}
        emptyTitle="No students"
        emptyDescription="This section has no active students."
      />
    </div>
  );
}
