"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { MyAttendanceSection } from "./MyAttendanceSection";
import { MyLeaveSection } from "./MyLeaveSection";
import { SalaryPlaceholderCard } from "./SalaryPlaceholderCard";

export function MyAttendancePage() {
  return (
    <>
      <PageHeader
        title="My Attendance, Leave & Salary"
        description="Your attendance record, leave requests and salary slips."
      />
      <MyAttendanceSection />
      <MyLeaveSection />
      <SalaryPlaceholderCard />
    </>
  );
}
