"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Assignment } from "@/features/auth/types";
import { formatDate } from "@/lib/format";
import { scopeLabel } from "../assignment-rules";

interface AssignmentListProps {
  assignments: Assignment[];
  onEnd?: (assignment: Assignment) => void;
}

export function AssignmentList({ assignments, onEnd }: AssignmentListProps) {
  if (assignments.length === 0) return <p className="text-label text-fg-muted">No active roles.</p>;

  return (
    <ul className="flex flex-col divide-y divide-border rounded-input border border-border">
      {assignments.map((assignment) => (
        <li key={assignment.id} className="flex items-center gap-3 px-3 py-2.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-2 text-label font-medium text-fg">
              {assignment.roleName}
              {assignment.validUntil && <Badge tone="warning">Until {formatDate(assignment.validUntil)}</Badge>}
            </span>
            <span className="text-caption text-fg-muted">
              {scopeLabel(assignment.scopeType, assignment.schoolName, assignment.branchName)}
            </span>
          </div>
          {onEnd && (
            <Button variant="ghost" size="sm" onClick={() => onEnd(assignment)}>
              End
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
