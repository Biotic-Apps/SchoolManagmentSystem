"use client";

import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSectionTimetableTab } from "../use-section-timetable";
import { SectionPicker } from "./SectionPicker";
import { SectionTimetablePane } from "./SectionTimetablePane";

interface SectionTimetableTabProps {
  branchId: string;
  sessionId: string | null;
  initialSectionId: string | null;
  canEdit: boolean;
  canPublish: boolean;
  onOpenBell: () => void;
}

export function SectionTimetableTab({ branchId, sessionId, initialSectionId, canEdit, canPublish, onOpenBell }: SectionTimetableTabProps) {
  const tab = useSectionTimetableTab(branchId, sessionId, initialSectionId);
  const { section } = tab;

  if (tab.loading) return <Skeleton className="h-96 w-full" />;
  if (tab.error)
    return (
      <Card>
        <ErrorState error={tab.error} onRetry={tab.retry} />
      </Card>
    );
  if (!section)
    return (
      <Card>
        <EmptyState
          icon={LayoutGrid}
          title="No sections in this session"
          description="Add sections to your classes first; then build their timetable here."
          action={
            <Button variant="secondary" size="sm" asChild>
              <Link href="/classes">Open Classes</Link>
            </Button>
          }
        />
      </Card>
    );

  return (
    <div className="flex flex-col gap-4">
      <SectionPicker choices={tab.choices} value={section.id} onChange={tab.setSectionId} />
      <SectionTimetablePane
        key={section.id}
        sectionId={section.id}
        sectionName={section.fullName}
        workingDays={tab.workingDays}
        tryEdit={canEdit}
        canEdit={canEdit}
        canPublish={canPublish}
        onOpenBell={onOpenBell}
      />
    </div>
  );
}
