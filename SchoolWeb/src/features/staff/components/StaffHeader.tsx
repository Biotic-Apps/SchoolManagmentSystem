"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { designationLabel } from "../options";
import type { StaffDetail } from "../types";
import { ProbationBadge } from "./ProbationBadge";
import { RoleBadges } from "./RoleBadges";
import { SignInStatus } from "./SignInStatus";

interface StaffHeaderProps {
  staff: StaffDetail;
  actions?: ReactNode;
}

export function StaffHeader({ staff, actions }: StaffHeaderProps) {
  const facts = [designationLabel(staff.designation), staff.employeeNo, staff.branchName].filter(Boolean);

  return (
    <header className="flex flex-col gap-4">
      <Link href="/staff" className="inline-flex w-fit items-center gap-1 text-label text-fg-muted hover:text-fg">
        <ArrowLeft className="size-4" />
        Teachers & Helpers
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <PersonAvatar name={staff.name} photoUrl={staff.photoUrl} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-page-title font-semibold tracking-tight text-fg">{staff.name}</h1>
            <p className="text-label text-fg-muted">{facts.join(" · ")}</p>
            <div className="flex flex-wrap items-center gap-1">
              <StatusBadge status={staff.status} />
              {staff.requiresReview && <ProbationBadge reviewerName={staff.reviewer?.name} />}
              {staff.roles.length > 0 && <RoleBadges roles={staff.roles} />}
            </div>
            <SignInStatus staff={staff} />
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:max-w-[60%] sm:justify-end">{actions}</div>}
      </div>
    </header>
  );
}
