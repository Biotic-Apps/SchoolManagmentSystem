"use client";

import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SectionScopeBar } from "@/features/classes/components/SectionScopeBar";
import { useAllergyAlertsTab } from "../use-allergy-alerts-tab";
import { AllergyAlertCard } from "./AllergyAlertCard";

export function AllergyAlertsTab() {
  const { scope, query, alerts } = useAllergyAlertsTab();
  const loading = scope.isLoading || query.isLoading;

  return (
    <div className="flex flex-col gap-4">
      <SectionScopeBar scope={scope} />
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-card" />
          ))}
        </div>
      )}
      {!loading && !!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {!loading && !query.error && alerts.length === 0 && (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title={scope.sectionId ? "No allergy or medical alerts" : "Choose a section"}
            description={
              scope.sectionId
                ? "No student in this section has a recorded allergy or medical instruction."
                : "Alerts are listed per section."
            }
          />
        </Card>
      )}
      {alerts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => (
            <AllergyAlertCard key={alert.studentId} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
