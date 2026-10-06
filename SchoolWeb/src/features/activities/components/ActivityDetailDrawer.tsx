"use client";

import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { ErrorState } from "@/components/shared/ErrorState";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AudienceOptions } from "@/features/notices/use-audience-options";
import { ACTIVITY_STEPS, typeLabel } from "../options";
import type { Activity } from "../types";
import { useActivityDetail } from "../use-activity-detail";
import { ActivityDetailActions } from "./ActivityDetailActions";
import { ActivitySummary } from "./ActivitySummary";
import { ConsentTracker } from "./ConsentTracker";
import { ParticipantsSection } from "./ParticipantsSection";

interface ActivityDetailDrawerProps {
  activityId: string | null;
  audience: AudienceOptions;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
}

export function ActivityDetailDrawer({ activityId, audience, onClose, onEdit }: ActivityDetailDrawerProps) {
  const detail = useActivityDetail(activityId);
  const { activity, query } = detail;
  const cancelling = detail.reasonFor === "cancel";

  return (
    <DetailDrawer
      open={!!activityId}
      onOpenChange={(open) => !open && onClose()}
      title={activity?.title ?? "Activity"}
      description={
        activity && (
          <span className="flex flex-wrap items-center gap-2">
            {typeLabel(activity.type)}
            <StatusBadge status={activity.status} />
          </span>
        )
      }
      actions={activity && <ActivityDetailActions detail={detail} onEdit={() => onEdit(activity)} />}
    >
      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {activity && detail.stepper && (
        <>
          <StatusStepper steps={ACTIVITY_STEPS} current={detail.stepper.current} failedLabel={detail.stepper.failedLabel} />
          <ActivitySummary activity={activity} nameOf={audience.nameOf} />
          {activity.consentRequired && <ConsentTracker activityId={activity.id} />}
          {detail.showParticipants && (
            <ParticipantsSection
              activity={activity}
              editable={detail.canEditParticipants}
            />
          )}
        </>
      )}
      <ReasonDialog
        open={!!detail.reasonFor}
        onOpenChange={(open) => !open && detail.closeReason()}
        title={cancelling ? "Cancel activity" : "Reject activity"}
        description={cancelling ? "Parents of the audience are told it is cancelled." : "The proposer sees this reason."}
        submitLabel={cancelling ? "Cancel activity" : "Reject"}
        submitting={detail.pending}
        onSubmit={detail.confirmReason}
      />
    </DetailDrawer>
  );
}
