"use client";

import { FileCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useChildResults } from "../../use-child-results";
import { ChildResultCard } from "./ChildResultCard";
import { ResultTrend } from "./ResultTrend";

/** PARENT: published exam results of the child picked in the Topbar. */
/** `withHeader` is false when embedded under another page header (parent Progress page). */
export function ChildResultsView({ withHeader = true }: { withHeader?: boolean }) {
  const { child, query, results, trend, caption } = useChildResults();

  return (
    <div className="flex flex-col gap-6">
      {withHeader && <PageHeader title="Progress & Results" description={caption} />}
      {!child && <NoChildState description="Once your child link is verified, their exam results appear here." />}
      {child && query.isLoading && <Skeleton className="h-64 w-full" />}
      {!!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {query.data && results.length === 0 && (
        <Card>
          <EmptyState
            icon={FileCheck}
            title="No results published yet"
            description="Results and report cards appear here once the school publishes them."
          />
        </Card>
      )}
      {trend.length > 1 && <ResultTrend points={trend} />}
      {results.map((result) => (
        <ChildResultCard key={result.examId} result={result} />
      ))}
    </div>
  );
}
