"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DocumentsPanel } from "@/features/documents/components/DocumentsPanel";
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
  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList className="max-w-full overflow-x-auto">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="guardians">Guardians</TabsTrigger>
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
      <TabsContent value="documents">
        <DocumentsPanel ownerType="STUDENT" ownerId={student.id} readOnly={readOnly} />
      </TabsContent>
      <TabsContent value="enrollments">
        <EnrollmentHistoryTab studentId={student.id} />
      </TabsContent>
      <TabsContent value="id-card">
        <IdCardPanel studentId={student.id} canGenerate={!readOnly} />
      </TabsContent>
    </Tabs>
  );
}
