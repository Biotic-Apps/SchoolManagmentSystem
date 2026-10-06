"use client";

import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useChildActivities } from "../use-child-activities";
import { ChildActivityCard } from "./ChildActivityCard";

/** PARENT: upcoming activities of the Topbar child with consent Grant / Decline. */
export function ChildActivitiesSection({ showHeading = true, className }: { showHeading?: boolean; className?: string }) {
  const state = useChildActivities();
  const { child, query, activities, declining } = state;

  return (
    <section className={cn("flex flex-col gap-4", className)} aria-label="Activities and events">
      {showHeading && <h2 className="text-card-title font-semibold text-fg">Activities & events</h2>}
      {!child && !showHeading && (
        <NoChildState description="Once your child link is verified, their activities appear here." />
      )}
      {child && query.isLoading && <Skeleton className="h-40 w-full" />}
      {!!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {query.data && activities.length === 0 && (
        <Card>
          <EmptyState icon={Trophy} title="No upcoming activities" description="Events, trips and competitions appear here once announced." />
        </Card>
      )}
      {activities.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {activities.map((activity) => (
            <ChildActivityCard
              key={activity.id}
              activity={activity}
              pending={state.pendingId === activity.id}
              onGrant={() => state.grant(activity)}
              onDecline={() => declining.show(activity)}
            />
          ))}
        </div>
      )}
      <ReasonDialog
        open={declining.open}
        onOpenChange={declining.onOpenChange}
        title="Decline consent"
        description={declining.item ? `${declining.item.title}${child ? ` · ${child.name}` : ""}` : undefined}
        label="Note"
        required={false}
        submitLabel="Decline"
        submitting={state.declinePending}
        onSubmit={state.confirmDecline}
      />
    </section>
  );
}
