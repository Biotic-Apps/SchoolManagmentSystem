"use client";

import { ChevronRight } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { REGISTER_STATUS_LABEL, sectionLabel } from "../options";
import type { useBranchSummary } from "../use-branch-summary";

interface UnmarkedSectionsCardProps {
  query: ReturnType<typeof useBranchSummary>["unmarked"];
  onOpen: (sectionId: string) => void;
}

/** Sections without a submitted register; each opens that section's register. */
export function UnmarkedSectionsCard({ query, onOpen }: UnmarkedSectionsCardProps) {
  const sections = query.data ?? [];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Not submitted</CardTitle>
          {sections.length > 0 && <Badge tone="warning">{sections.length}</Badge>}
        </div>
        <CardDescription>Registers still to be submitted for this day.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {query.isLoading && <Skeleton className="h-24 w-full" />}
        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} className="py-6" />}
        {!query.isLoading && !query.error && sections.length === 0 && (
          <p className="text-label text-fg-muted">Every section has submitted its register.</p>
        )}
        {sections.map((section) => (
          <button
            key={section.sectionId}
            type="button"
            onClick={() => onOpen(section.sectionId)}
            className="flex items-center gap-3 rounded-input border border-border px-3 py-2.5 text-left transition-colors hover:bg-selected/60"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-label font-medium text-fg">{sectionLabel(section)}</span>
              {section.classTeacher && (
                <span className="truncate text-caption text-fg-muted">{section.classTeacher.name}</span>
              )}
            </span>
            <StatusBadge
              status={section.status ?? "UNMARKED"}
              label={REGISTER_STATUS_LABEL[section.status ?? "UNMARKED"]}
            />
            <ChevronRight className="size-4 shrink-0 text-fg-muted" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
