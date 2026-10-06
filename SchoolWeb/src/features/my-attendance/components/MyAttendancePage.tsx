"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { MyAttendanceSection } from "./MyAttendanceSection";
import { MyLeaveSection } from "./MyLeaveSection";
import { MySalarySection } from "./MySalarySection";

export function MyAttendancePage() {
  return (
    <>
      <PageHeader
        title="My Attendance, Leave & Salary"
        description="Your attendance record, leave requests and salary slips."
      />
      <MyAttendanceSection />
      <MyLeaveSection />
      <MySalarySection />
    </>
  );
}
