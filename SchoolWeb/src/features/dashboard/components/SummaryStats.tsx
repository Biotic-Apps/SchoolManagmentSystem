"use client";

import Link from "next/link";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/Card";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { DashboardState } from "../use-dashboard";

export function SummaryStats({ dashboard }: { dashboard: DashboardState }) {
  const { stats, loading, error, retry } = dashboard;
  if (error) {
    return (
      <Card>
        <ErrorState error={error} onRetry={retry} />
      </Card>
    );
  }
  if (stats.length === 0) return null;
  return (
    <section aria-labelledby="dashboard-overview" className="flex flex-col gap-3">
      <SectionHeading id="dashboard-overview" title="Overview" level={2} />
      <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.key} href={stat.href} className={cn("block h-full rounded-card", focusRing)}>
            <StatCard label={stat.label} icon={stat.icon} value={stat.value} loading={loading} interactive />
          </Link>
        ))}
      </div>
    </section>
  );
}
