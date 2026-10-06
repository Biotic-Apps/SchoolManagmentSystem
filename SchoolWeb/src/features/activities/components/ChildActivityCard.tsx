import { CalendarClock, Check, MapPin, Wallet, X } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { todayIso } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { consentOpen, formatActivityWhen, formatFee, typeLabel, typeTone } from "../options";
import type { MyActivity } from "../types";

interface ChildActivityCardProps {
  activity: MyActivity;
  pending: boolean;
  onGrant: () => void;
  onDecline: () => void;
}

const CONSENT_LABEL = { PENDING: "Consent pending", GRANTED: "Consent given", DECLINED: "Consent declined" };

export function ChildActivityCard({ activity, pending, onGrant, onDecline }: ChildActivityCardProps) {
  const consent = activity.consentStatus ?? (activity.consentRequired ? "PENDING" : null);
  const canRespond = consentOpen(activity, todayIso());

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={typeTone(activity.type)}>{typeLabel(activity.type)}</Badge>
          {consent && <StatusBadge status={consent} label={CONSENT_LABEL[consent]} />}
        </div>
        <h3 className="text-card-title font-semibold text-fg">{activity.title}</h3>
        <p className="line-clamp-3 whitespace-pre-line text-label text-fg-muted">{activity.description}</p>
      </div>
      <ul className="flex flex-col gap-1.5 text-label text-fg">
        <li className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
          {formatActivityWhen(activity.startAt, activity.endAt)}
        </li>
        {activity.venue && (
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            {activity.venue}
          </li>
        )}
        <li className="flex items-start gap-2">
          <Wallet className="mt-0.5 size-4 shrink-0 text-primary" />
          {formatFee(activity.feeMinor)}
        </li>
      </ul>
      {activity.consentRequired && (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-caption text-fg-muted">
            {activity.consentDeadline
              ? `Reply by ${formatDate(activity.consentDeadline.slice(0, 10))}`
              : "Consent required"}
          </span>
          {canRespond && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onDecline} disabled={pending || consent === "DECLINED"}>
                <X />
                Decline
              </Button>
              <Button size="sm" onClick={onGrant} loading={pending} disabled={consent === "GRANTED"}>
                <Check />
                Grant
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
