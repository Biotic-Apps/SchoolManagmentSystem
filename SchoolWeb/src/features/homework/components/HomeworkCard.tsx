"use client";

import { CalendarDays, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AttachmentList } from "@/components/shared/AttachmentList";
import type { Homework } from "../types";

interface HomeworkCardProps {
  homework: Homework;
  onSelect: () => void;
  /** Parent/student view: hide submission counts, show due status. */
  compact?: boolean;
}

function dueLabel(dueDate: string): { text: string; overdue: boolean } {
  const due = new Date(dueDate + "T23:59:59");
  const now = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} day(s)`, overdue: true };
  if (diff === 0) return { text: "Due today", overdue: false };
  if (diff === 1) return { text: "Due tomorrow", overdue: false };
  return { text: `Due in ${diff} days`, overdue: false };
}

export function HomeworkCard({ homework, onSelect, compact }: HomeworkCardProps) {
  const due = dueLabel(homework.dueDate);

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body font-semibold text-fg">{homework.title}</h3>
          <p className="text-caption text-fg-muted">
            {homework.subject.name} &middot; {homework.className} {homework.sectionName}
          </p>
        </div>
        <StatusBadge status={homework.status} />
      </div>

      <p className="line-clamp-2 text-label text-fg-muted">{homework.description}</p>

      <div className="flex flex-wrap items-center gap-3 text-caption text-fg-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {homework.dueDate}
        </span>
        {due.overdue && <span className="font-medium text-error">{due.text}</span>}
        {!due.overdue && <span>{due.text}</span>}
        {homework.maxMarks != null && (
          <span className="inline-flex items-center gap-1">
            <FileText className="size-3.5" />
            Max: {homework.maxMarks}
          </span>
        )}
        {!compact && (
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {homework.submissionCount} submitted &middot; {homework.gradedCount} graded
          </span>
        )}
      </div>

      {homework.attachments.length > 0 && (
        <AttachmentList items={homework.attachments} />
      )}

      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={onSelect}>
          {compact ? "View / Submit" : "View submissions"}
        </Button>
      </div>
    </Card>
  );
}
