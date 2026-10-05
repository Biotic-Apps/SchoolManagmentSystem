"use client";

import Link from "next/link";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScopePicker } from "@/components/shared/ScopePicker";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { useDashboard } from "../use-dashboard";

export function DashboardPage() {
  const { title, greetingName, scope, stats, loading, error, retry } = useDashboard();

  return (
    <>
      <PageHeader title={title} description={`Welcome, ${greetingName}`} />
      {scope.showPicker && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ScopePicker
            value={scope.scope}
            onChange={scope.setScope}
            schools={scope.schools}
            branches={scope.branches}
            sessions={scope.sessions}
            hideSchool={scope.hideSchool}
          />
          {scope.isFiltered && (
            <Button variant="ghost" onClick={scope.reset}>
              Show everything
            </Button>
          )}
        </div>
      )}
      {error ? (
        <Card>
          <ErrorState error={error} onRetry={retry} />
        </Card>
      ) : (
        stats.length > 0 && (
          <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <Link key={stat.key} href={stat.href} className={cn("rounded-card", focusRing)}>
                <StatCard label={stat.label} icon={stat.icon} value={stat.value} loading={loading} />
              </Link>
            ))}
          </section>
        )
      )}
    </>
  );
}
