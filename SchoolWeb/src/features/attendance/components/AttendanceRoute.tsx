"use client";

import { useAttendanceView } from "../use-attendance-page";
import { AttendancePage } from "./AttendancePage";
import { ChildAttendanceView } from "./ChildAttendanceView";

export function AttendanceRoute() {
  return useAttendanceView() === "child" ? <ChildAttendanceView /> : <AttendancePage />;
}
