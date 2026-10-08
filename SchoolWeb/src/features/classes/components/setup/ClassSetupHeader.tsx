"use client";

import Link from "next/link";
import { ArrowLeft, CalendarRange } from "lucide-react";
import { SaveIndicator } from "@/components/shared/SaveIndicator";
import { Button } from "@/components/ui/Button";
import { timetableHref } from "../../links";
import type { ClassSetupPageState } from "../../setup/use-class-setup-page";
import type { ClassSetup } from "../../setup-types";
import { ClassNameEditor } from "./ClassNameEditor";

export function ClassSetupHeader({ page, setup }: { page: ClassSetupPageState; setup: ClassSetup }) {
  const firstSection = setup.sections[0]?.id ?? null;
  return (
    <header className="flex flex-col gap-3">
      <Link href="/classes" className="inline-flex items-center gap-1.5 self-start text-label font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Classes
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <ClassNameEditor classId={setup.class.id} name={setup.class.name} canEdit={setup.canEditStructure} />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-fg-muted">
            <span>Set up sections, subjects and teachers. Changes save on their own.</span>
            <SaveIndicator status={page.saveStatus} />
          </div>
        </div>
        {firstSection && (
          <Button variant="secondary" asChild className="self-start sm:self-auto">
            <Link href={timetableHref(page.branchId, firstSection)}>
              <CalendarRange />
              Open timetable
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
