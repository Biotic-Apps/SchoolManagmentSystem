"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { StudentAttendanceTab } from "@/features/attendance/components/StudentAttendanceTab";
import { useCan } from "@/features/auth/use-can";
import { DocumentsPanel } from "@/features/documents/components/DocumentsPanel";
import { HealthTab } from "@/features/health/components/HealthTab";
import { PickupPersonsTab } from "@/features/pickup/components/PickupPersonsTab";
import type { StudentDetail } from "../types";
import { EnrollmentHistoryTab } from "./EnrollmentHistoryTab";
import { IdCardPanel } from "./IdCardPanel";
import { StudentGuardiansTab } from "./StudentGuardiansTab";
import { StudentProfileTab } from "./StudentProfileTab";

interface StudentTabsProps {
  student: StudentDetail;
  tab: string;
  onTabChange: (tab: string) => void;
  /** Parent view: no editing, no ID card generation. */
  readOnly?: boolean;
}

export function StudentTabs({ student, tab, onTabChange, readOnly }: StudentTabsProps) {
  const can = useCan();
  const showAttendance = can("attendance.view");
  const showHealth = can("health.view");
  const showPickup = can("pickup.view");
  // POST /students/:id/id-card needs students.edit (phase5-contract Deviations).
  const canGenerateCard = !readOnly && can("students.edit");

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList className="max-w-full overflow-x-auto">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="guardians">Guardians</TabsTrigger>
        {showAttendance && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
        {showHealth && <TabsTrigger value="health">Health</TabsTrigger>}
        {showPickup && <TabsTrigger value="pickup">Pickup</TabsTrigger>}
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="enrollments">Enrollment history</TabsTrigger>
        <TabsTrigger value="id-card">ID card</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <StudentProfileTab student={student} />
      </TabsContent>
      <TabsContent value="guardians">
        <StudentGuardiansTab student={student} readOnly={readOnly} />
      </TabsContent>
      {showAttendance && (
        <TabsContent value="attendance">
          <StudentAttendanceTab studentId={student.id} />
        </TabsContent>
      )}
      {showHealth && (
        <TabsContent value="health">
          <HealthTab studentId={student.id} readOnly={readOnly} />
        </TabsContent>
      )}
      {showPickup && (
        <TabsContent value="pickup">
          <PickupPersonsTab studentId={student.id} readOnly={readOnly} />
        </TabsContent>
      )}
      <TabsContent value="documents">
        <DocumentsPanel ownerType="STUDENT" ownerId={student.id} readOnly={readOnly} />
      </TabsContent>
      <TabsContent value="enrollments">
        <EnrollmentHistoryTab studentId={student.id} />
      </TabsContent>
      <TabsContent value="id-card">
        <IdCardPanel studentId={student.id} canGenerate={canGenerateCard} />
      </TabsContent>
    </Tabs>
  );
}
