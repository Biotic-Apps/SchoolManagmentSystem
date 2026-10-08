"use client";

import { LayoutGrid } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTeacherSections } from "../use-teacher-sections";
import { SectionPicker } from "./SectionPicker";
import { SectionTimetablePane } from "./SectionTimetablePane";

/** Teacher: timetables of the sections they teach; their class-teacher section is editable as a draft. */
export function TeacherSectionsView() {
  const view = useTeacherSections();
  const { section } = view;

  if (view.loading) return <Skeleton className="h-96 w-full" />;
  if (!section)
    return (
      <Card>
        <EmptyState icon={LayoutGrid} title="No sections yet" description="Sections you teach appear here once you are assigned to them." />
      </Card>
    );

  return (
    <div className="flex flex-col gap-4">
      <SectionPicker choices={view.choices} value={section.id} onChange={view.setSectionId} />
      <SectionTimetablePane
        key={section.id}
        sectionId={section.id}
        sectionName={section.fullName}
        workingDays={view.workingDays}
        tryEdit={view.canEdit}
        canEdit={view.canEdit}
        canPublish={false}
        editNote={
          <InlineNotice>
            You are the class teacher of {section.fullName}, so you can build its timetable. It stays a draft; your principal
            publishes it.
          </InlineNotice>
        }
      />
    </div>
  );
}
