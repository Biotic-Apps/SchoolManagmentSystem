"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { useMyWeek } from "../use-my-week";
import { TeacherSectionsView } from "./TeacherSectionsView";
import { TeacherWeekGrid } from "./TeacherWeekGrid";
import { WeekNav } from "./WeekNav";

const VIEWS = [
  { id: "week", name: "My week" },
  { id: "sections", name: "My sections" },
];

/** Teacher/helper: own schedule including substitute periods, and the timetables of the sections they teach. */
export function MyWeekView({ withSections = false }: { withSections?: boolean }) {
  const { week, grid, loading, error, retry } = useMyWeek();
  // Teachers open on their sections (their class-teacher section is editable); helpers only have a week.
  const [view, setView] = useState(withSections ? "sections" : "week");

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="My Timetable" description="Your periods for the week, and the timetables of the sections you teach." />
      {withSections && <SegmentedControl label="Show" options={VIEWS} value={view} onChange={setView} className="self-start" />}
      {view === "sections" && withSections ? (
        <TeacherSectionsView />
      ) : (
        <>
          <WeekNav week={week} />
          <TeacherWeekGrid
            caption={`My timetable, week of ${week.label}`}
            week={grid}
            loading={loading}
            error={error}
            onRetry={retry}
            showSection
            emptyDescription="No periods are assigned to you this week."
          />
        </>
      )}
    </div>
  );
}
