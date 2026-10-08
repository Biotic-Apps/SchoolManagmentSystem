"use client";

import { InlineNotice } from "@/components/shared/InlineNotice";
import { RoomsTab } from "./RoomsTab";
import { SubjectsTab } from "./SubjectsTab";

interface CatalogueTabProps {
  branchId: string;
  schoolId: string;
  sessionId: string | null;
}

/** Master lists for renaming. New subjects and rooms are normally created inline in Class setup or the timetable. */
export function CatalogueTab({ branchId, schoolId, sessionId }: CatalogueTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <InlineNotice>Subjects are shared by the whole school; rooms belong to this branch.</InlineNotice>
      <div className="grid gap-6 xl:grid-cols-2">
        <SubjectsTab schoolId={schoolId} branchId={branchId} sessionId={sessionId} />
        <RoomsTab branchId={branchId} />
      </div>
    </div>
  );
}
