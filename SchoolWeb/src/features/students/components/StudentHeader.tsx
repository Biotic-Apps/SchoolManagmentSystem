import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { placementLabel } from "../options";
import type { StudentDetail } from "../types";

interface StudentHeaderProps {
  student: StudentDetail;
  /** Back link to the register; omitted for parents. */
  backHref?: string;
  actions?: ReactNode;
}

export function StudentHeader({ student, backHref, actions }: StudentHeaderProps) {
  const roll = student.rollNo != null ? `Roll no ${student.rollNo}` : null;
  const caption = [student.admissionNo, placementLabel(student.className, student.sectionName), roll]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="flex flex-col gap-4">
      {backHref && (
        <Link href={backHref} className="flex items-center gap-1 self-start text-label text-fg-muted hover:text-fg">
          <ArrowLeft className="size-4" />
          Students
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <PersonAvatar name={student.name} photoUrl={student.photoUrl} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-page-title font-semibold tracking-tight text-fg">{student.name}</h1>
            <p className="text-label text-fg-muted">{caption}</p>
            <span>
              <StatusBadge status={student.status} />
            </span>
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
