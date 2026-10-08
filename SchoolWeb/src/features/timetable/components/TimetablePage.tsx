"use client";

import { useTimetableView } from "../use-timetable-page";
import { ChildTimetableView } from "./ChildTimetableView";
import { MyWeekView } from "./MyWeekView";
import { TimetableAdminPage } from "./TimetableAdminPage";

export function TimetablePage() {
  const view = useTimetableView();
  if (view === "child") return <ChildTimetableView />;
  if (view === "mine") return <MyWeekView />;
  if (view === "teacher") return <MyWeekView withSections />;
  return <TimetableAdminPage />;
}
