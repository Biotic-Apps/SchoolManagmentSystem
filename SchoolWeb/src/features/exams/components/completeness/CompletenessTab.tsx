"use client";

import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { humanize } from "@/lib/format";
import type { Exam } from "../../types";
import { useCompletenessBoard } from "../../use-completeness-board";
import { CompletenessGroupCard } from "./CompletenessGroupCard";

export function CompletenessTab({ exam }: { exam: Exam }) {
  const board = useCompletenessBoard(exam);
  const { query } = board;

  if (query.isLoading) return <Skeleton className="h-48 w-full" />;
  if (query.error) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }
  if (board.sheets === 0) {
    return (
      <Card>
        <EmptyState icon={ClipboardCheck} title="No mark sheets yet" description="Mark sheets appear once marks entry opens." />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Accepted" value={`${board.accepted} of ${board.sheets}`} />
        {board.counts.map((item) => (
          <StatCard key={item.status} label={humanize(item.status)} value={item.count} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {board.groups.map((group) => (
          <CompletenessGroupCard key={group.key} group={group} />
        ))}
      </div>
    </div>
  );
}
