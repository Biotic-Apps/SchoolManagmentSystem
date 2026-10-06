"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActivityConsents, useParticipants } from "../api";
import type { Activity } from "../types";
import { ParticipantsEditor } from "./ParticipantsEditor";

interface ParticipantsSectionProps {
  activity: Activity;
  editable: boolean;
}

/** Participants with role, result, position and remarks (results after the activity). */
export function ParticipantsSection({ activity, editable }: ParticipantsSectionProps) {
  const participants = useParticipants(activity.id);
  const consents = useActivityConsents(activity.id, activity.consentRequired);
  const loading = participants.isLoading || (activity.consentRequired && consents.isLoading);

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Participants and results" />
      {loading && <Skeleton className="h-32 w-full" />}
      {!!participants.error && <ErrorState error={participants.error} onRetry={() => participants.refetch()} />}
      {!loading && participants.data && (
        <ParticipantsEditor
          key={participants.dataUpdatedAt}
          activity={activity}
          initial={participants.data}
          consents={consents.data?.consents ?? []}
          editable={editable}
        />
      )}
    </section>
  );
}
