"use client";

import Link from "next/link";
import { QrCode } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
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
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/attendance/qr-scan">
              <QrCode className="size-4" />
              QR Scanner
            </Link>
          </Button>
        }
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
