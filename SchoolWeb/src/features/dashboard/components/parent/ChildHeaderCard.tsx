import { Phone } from "lucide-react";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/Card";
import { humanize } from "@/lib/format";
import type { ParentHomeChild } from "../../types";

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-caption text-fg-muted">{label}</dt>
      <dd className="break-words text-label font-medium text-fg">{value}</dd>
    </div>
  );
}

/** Who the dashboard is about: photo, name, class and the people to reach. */
export function ChildHeaderCard({ child, today }: { child: ParentHomeChild; today: string }) {
  const classLabel = [child.className, child.sectionName].filter(Boolean).join(" - ") || null;
  return (
    <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <PersonAvatar name={child.name} photoUrl={child.photoUrl} size="lg" className="ring-4 ring-primary/20" />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-card-title font-semibold text-fg">{child.name}</h2>
          <div className="flex flex-wrap items-center gap-2 text-label text-fg-muted">
            {classLabel && <span>{classLabel}</span>}
            <StatusBadge status={today} label={today === "UNMARKED" ? "Attendance not marked yet" : `${humanize(today)} today`} />
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:ml-auto sm:flex sm:flex-wrap sm:justify-end">
        <Fact label="Roll no." value={child.rollNo !== null ? String(child.rollNo) : null} />
        <Fact label="Admission no." value={child.admissionNo} />
        <Fact label="Class teacher" value={child.classTeacher?.name ?? "Not assigned"} />
        {child.branchPhone ? (
          <div className="flex min-w-0 flex-col">
            <dt className="text-caption text-fg-muted">School office</dt>
            <dd className="truncate text-label font-medium">
              <a href={`tel:${child.branchPhone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Phone className="size-3.5" aria-hidden />
                {child.branchPhone}
              </a>
            </dd>
          </div>
        ) : (
          <Fact label="Campus" value={child.branchName} />
        )}
      </dl>
    </Card>
  );
}
