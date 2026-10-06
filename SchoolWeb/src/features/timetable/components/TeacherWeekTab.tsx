"use client";

import { UserSearch } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { Card } from "@/components/ui/Card";
import { useTeacherWeek } from "../use-teacher-week";
import { TeacherWeekGrid } from "./TeacherWeekGrid";
import { WeekNav } from "./WeekNav";

export function TeacherWeekTab({ branchId }: { branchId: string }) {
  const tab = useTeacherWeek(branchId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <OptionSelect
          label={tab.teachers.isLoading ? "Loading teachers" : "Choose a teacher"}
          options={tab.teachers.options}
          value={tab.staffId}
          onChange={tab.setStaffId}
          className="md:w-72"
        />
        <WeekNav week={tab.week} />
      </div>
      {tab.staffId ? (
        <TeacherWeekGrid
          caption={`${tab.teacherName}'s timetable, week of ${tab.week.label}`}
          week={tab.grid}
          loading={tab.loading}
          error={tab.error}
          onRetry={tab.retry}
          showSection
          emptyDescription="This teacher has no published periods or substitutions this week."
        />
      ) : (
        <Card>
          <EmptyState icon={UserSearch} title="Choose a teacher" description="See a teacher's week, including substitute periods." />
        </Card>
      )}
    </div>
  );
}
