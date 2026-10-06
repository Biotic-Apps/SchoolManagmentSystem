"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ReportGroup } from "../catalog";
import type { Report } from "../types";
import { ReportCard } from "./ReportCard";

interface ReportCatalogProps {
  query: Pick<UseQueryResult<Report[]>, "isLoading" | "error" | "refetch" | "data">;
  groups: ReportGroup[];
  onSelect: (report: Report) => void;
}

export function ReportCatalog({ query, groups, onSelect }: ReportCatalogProps) {
  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (query.error) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }
  if (!groups.length) {
    return (
      <Card>
        <EmptyState icon={BarChart3} title="No reports available" description="Reports for your role appear here." />
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.area} className="flex flex-col gap-3">
          <SectionHeading title={group.area} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.reports.map((report) => (
              <ReportCard key={report.key} report={report} onSelect={() => onSelect(report)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
