"use client";

import { Check, ListChecks } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { todayIso } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { useMyFollowUps } from "../use-follow-ups";

export function FollowUpsTab() {
  const followUps = useMyFollowUps();
  const { query } = followUps;
  const today = todayIso();

  if (query.isLoading) return <Skeleton className="h-48 w-full" />;
  if (query.error) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }
  if (followUps.items.length === 0) {
    return (
      <Card>
        <EmptyState icon={ListChecks} title="No open follow-ups" description="Actions agreed in meetings appear here." />
      </Card>
    );
  }

  return (
    <Card>
      <ul className="flex flex-col">
        {followUps.items.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 border-b border-border px-6 py-4 last:border-b-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-label font-medium text-fg">{item.title}</span>
              {item.student && <span className="text-caption text-fg-muted">{item.student.name}</span>}
            </div>
            <span className="flex items-center gap-2 whitespace-nowrap text-caption text-fg-muted">
              Due {formatDate(item.dueDate)}
              {item.dueDate < today && <Badge tone="error">Overdue</Badge>}
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="self-start sm:self-auto"
              loading={followUps.pendingId === item.id}
              onClick={() => followUps.markDone(item.id)}
            >
              <Check />
              Mark done
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
