"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AcademicScopeBar } from "@/features/classes/components/AcademicScopeBar";
import { useTimetableAdmin } from "../use-timetable-admin";
import { BellScheduleTab } from "./BellScheduleTab";
import { SectionTimetableTab } from "./SectionTimetableTab";
import { SubstitutionsTab } from "./SubstitutionsTab";
import { TeacherWeekTab } from "./TeacherWeekTab";

export function TimetableAdminPage() {
  const { scope, tab, setTab, goToBell, canEdit, canPublish } = useTimetableAdmin();
  const { branchId, sessionId } = scope;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Timetable"
        description="Bell schedule per branch, weekly timetable per section, and substitute teachers."
      />
      <AcademicScopeBar scope={scope} />
      {scope.isLoading && <Skeleton className="h-64 w-full" />}
      {!scope.isLoading && !!scope.error && (
        <Card>
          <ErrorState error={scope.error} />
        </Card>
      )}
      {!scope.isLoading && !scope.error && !branchId && (
        <Card>
          <EmptyState icon={Building2} title="No branch in your scope" description="Timetables are set up per branch." />
        </Card>
      )}
      {branchId && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="section">Section timetable</TabsTrigger>
            <TabsTrigger value="bell">Bell schedule</TabsTrigger>
            <TabsTrigger value="substitutions">Substitutions</TabsTrigger>
            <TabsTrigger value="teacher">Teacher week</TabsTrigger>
          </TabsList>
          <TabsContent value="section">
            <SectionTimetableTab
              key={`${branchId}-${sessionId}`}
              branchId={branchId}
              sessionId={sessionId}
              canEdit={canEdit}
              canPublish={canPublish}
              onOpenBell={goToBell}
            />
          </TabsContent>
          <TabsContent value="bell">
            <BellScheduleTab key={branchId} branchId={branchId} canEdit={canEdit} />
          </TabsContent>
          <TabsContent value="substitutions">
            <SubstitutionsTab key={`${branchId}-${sessionId}`} branchId={branchId} sessionId={sessionId} canEdit={canEdit} />
          </TabsContent>
          <TabsContent value="teacher">
            <TeacherWeekTab key={branchId} branchId={branchId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
