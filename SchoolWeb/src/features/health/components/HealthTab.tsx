"use client";

import { HeartPulse, PenLine, Send } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/format";
import { useHealthTab } from "../use-health-tab";
import { HealthProfileDialog } from "./HealthProfileDialog";
import { HealthProfileView } from "./HealthProfileView";
import { StudentIncidentsCard } from "./StudentIncidentsCard";

interface HealthTabProps {
  studentId: string;
  readOnly?: boolean;
}

export function HealthTab({ studentId, readOnly = false }: HealthTabProps) {
  const tab = useHealthTab(studentId, readOnly);
  const { profile } = tab;
  const data = profile.data ?? null;

  const action = tab.canEdit ? (
    <Button variant="secondary" onClick={() => tab.openEditor("edit")}>
      <PenLine />
      Edit health profile
    </Button>
  ) : tab.canRequest ? (
    <Button variant="secondary" onClick={() => tab.openEditor("request")}>
      <Send />
      Request a change
    </Button>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      {profile.isLoading && <Skeleton className="h-56 w-full rounded-card" />}
      {!!profile.error && (
        <Card>
          <ErrorState error={profile.error} onRetry={() => profile.refetch()} />
        </Card>
      )}
      {!profile.isLoading && !profile.error && !data && (
        <Card>
          <EmptyState
            icon={HeartPulse}
            title="No health profile yet"
            description="Blood group, allergies, medicines and emergency contacts appear here once recorded."
            action={action}
          />
        </Card>
      )}
      {data && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-caption text-fg-muted">
              {data.updatedAt ? `Updated ${formatDateTime(data.updatedAt)}` : "Not updated yet"}
            </span>
            {action}
          </div>
          <HealthProfileView profile={data} />
        </>
      )}
      <StudentIncidentsCard query={tab.incidents} columns={tab.incidentTableColumns} />
      {tab.editor && (
        <HealthProfileDialog studentId={studentId} profile={data} mode={tab.editor} onClose={tab.closeEditor} />
      )}
    </div>
  );
}
