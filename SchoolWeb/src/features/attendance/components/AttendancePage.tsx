"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAttendancePage } from "../use-attendance-page";
import { BranchSummaryTab } from "./BranchSummaryTab";
import { LeaveReviewTab } from "./LeaveReviewTab";
import { RegisterTab } from "./RegisterTab";
import { StaffAttendanceTab } from "./StaffAttendanceTab";

export function AttendancePage() {
  const page = useAttendancePage();
  const { tabs } = page;

  return (
    <>
      <PageHeader
        title="Attendance & Leave"
        description="Daily registers per section, branch totals, staff attendance and leave requests."
      />
      <Tabs value={page.tab} onValueChange={page.setTab}>
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="register">Register</TabsTrigger>
          {tabs.summary && <TabsTrigger value="summary">Branch summary</TabsTrigger>}
          {tabs.staff && <TabsTrigger value="staff">Staff attendance</TabsTrigger>}
          {tabs.leave && <TabsTrigger value="leave">Leave</TabsTrigger>}
        </TabsList>
        <TabsContent value="register">
          <RegisterTab page={page} />
        </TabsContent>
        {tabs.summary && (
          <TabsContent value="summary">
            <BranchSummaryTab page={page} />
          </TabsContent>
        )}
        {tabs.staff && (
          <TabsContent value="staff">
            <StaffAttendanceTab />
          </TabsContent>
        )}
        {tabs.leave && (
          <TabsContent value="leave">
            <LeaveReviewTab />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}
