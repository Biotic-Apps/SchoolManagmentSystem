"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { focusRing } from "@/components/ui/styles";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { StudentSummary } from "@/features/students/types";
import { cn } from "@/lib/cn";

interface StudentPickListProps {
  query: Pick<UseQueryResult, "isLoading" | "error" | "refetch">;
  students: StudentSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function StudentPickList({ query, students, selectedId, onSelect }: StudentPickListProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Students</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-1 px-3 pb-3">
        {query.isLoading && <Skeleton className="h-48 w-full" />}
        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {!query.isLoading && !query.error && students.length === 0 && (
          <EmptyState icon={Users} title="No students" description="This section has no active students." className="py-6" />
        )}
        <ul className="flex max-h-[32rem] flex-col gap-1 overflow-y-auto">
          {students.map((student) => {
            const selected = student.id === selectedId;
            return (
              <li key={student.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(student.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-input px-3 py-2 text-left transition-colors",
                    focusRing,
                    selected ? "bg-selected text-primary" : "text-fg hover:bg-selected/60",
                  )}
                >
                  <PersonAvatar name={student.name} photoUrl={student.photoUrl} />
                  <span className="flex min-w-0 flex-col">
                    <span className="break-words text-label font-medium">{student.name}</span>
                    {student.rollNo !== null && (
                      <span className="text-caption text-fg-muted">Roll no {student.rollNo}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
