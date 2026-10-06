import { DetailList } from "@/components/shared/DetailList";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { formatDate, formatNumber, textOrDash } from "@/lib/format";
import { activityAudienceSummary, formatActivityWhen, formatFee } from "../options";
import type { Activity } from "../types";

interface ActivitySummaryProps {
  activity: Activity;
  nameOf?: (id: string) => string | undefined;
}

export function ActivitySummary({ activity, nameOf }: ActivitySummaryProps) {
  const reason = activity.reason ?? activity.comment;
  const ended = activity.status === "REJECTED" || activity.status === "CANCELLED";
  return (
    <div className="flex flex-col gap-4">
      {ended && reason && <InlineNotice tone="error">{reason}</InlineNotice>}
      <p className="whitespace-pre-line text-body text-fg">{activity.description}</p>
      <DetailList
        items={[
          { label: "When", value: formatActivityWhen(activity.startAt, activity.endAt) },
          { label: "Venue", value: textOrDash(activity.venue) },
          { label: "Audience", value: activityAudienceSummary(activity.audience, nameOf) },
          { label: "Fee", value: formatFee(activity.feeMinor) },
          {
            label: "Consent",
            value: activity.consentRequired
              ? `Required${activity.consentDeadline ? ` by ${formatDate(activity.consentDeadline.slice(0, 10))}` : ""}`
              : "Not needed",
          },
          { label: "Maximum participants", value: activity.maxParticipants ? formatNumber(activity.maxParticipants) : "No limit" },
          { label: "Proposed by", value: textOrDash(activity.proposedBy?.name) },
        ]}
      />
    </div>
  );
}
