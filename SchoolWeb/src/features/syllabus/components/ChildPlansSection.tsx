import type { UseQueryResult } from "@tanstack/react-query";
import { ListChecks } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SyllabusPlan } from "../types";
import { ChildPlanCard } from "./ChildPlanCard";

interface ChildPlansSectionProps {
  query: UseQueryResult<SyllabusPlan[]>;
  plans: SyllabusPlan[];
}

export function ChildPlansSection({ query, plans }: ChildPlansSectionProps) {
  const empty = !query.isLoading && !query.error && plans.length === 0;
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Syllabus" />
      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {empty && (
        <Card>
          <EmptyState icon={ListChecks} title="No approved syllabus plans yet" />
        </Card>
      )}
      {plans.map((plan) => (
        <ChildPlanCard key={plan.id} plan={plan} />
      ))}
    </section>
  );
}
