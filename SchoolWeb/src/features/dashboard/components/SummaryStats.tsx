"use client";

import Link from "next/link";
import { ErrorState } from "@/components/shared/ErrorState";
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
    <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <Link key={stat.key} href={stat.href} className={cn("block h-full rounded-card", focusRing)}>
          <StatCard label={stat.label} icon={stat.icon} value={stat.value} loading={loading} />
        </Link>
      ))}
    </section>
  );
}
