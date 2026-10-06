"use client";

import { Bell, LayoutGrid } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSectionTimetableTab } from "../use-section-timetable";
import { SectionTimetableEditor } from "./SectionTimetableEditor";

interface SectionTimetableTabProps {
  branchId: string;
  sessionId: string | null;
  canEdit: boolean;
  canPublish: boolean;
  onOpenBell: () => void;
}

export function SectionTimetableTab({ branchId, sessionId, canEdit, canPublish, onOpenBell }: SectionTimetableTabProps) {
  const tab = useSectionTimetableTab(branchId, sessionId);
  const { section } = tab;

  return (
    <div className="flex flex-col gap-4">
      <OptionSelect
        label="Section"
        options={tab.sections.options}
        value={tab.sectionId}
        onChange={tab.setSectionId}
        className="md:w-72"
      />
      {tab.loading && <Skeleton className="h-72 w-full" />}
      {!tab.loading && !tab.hasSections && (
        <Card>
          <EmptyState
            icon={LayoutGrid}
            title="No sections in this session"
            description="Create sections in Classes & Sections before building their timetable."
          />
        </Card>
      )}
      {!tab.loading && !!tab.error && (
        <Card>
          <ErrorState error={tab.error} onRetry={() => tab.timetableQuery.refetch()} />
        </Card>
      )}
      {!tab.loading && !tab.error && section && !tab.hasPeriods && (
        <Card>
          <EmptyState
            icon={Bell}
            title="No bell schedule yet"
            description="Set up the branch's periods first; the timetable grid is built from them."
            action={
              <Button variant="secondary" size="sm" onClick={onOpenBell}>
                Open bell schedule
              </Button>
            }
          />
        </Card>
      )}
      {!tab.loading && !tab.error && section && tab.hasPeriods && (
        <SectionTimetableEditor
          key={section.id}
          section={section}
          sessionId={sessionId ?? section.sessionId}
          timetable={tab.timetable}
          rows={tab.rows}
          days={tab.days}
          canEdit={canEdit}
          canPublish={canPublish}
        />
      )}
    </div>
  );
}
