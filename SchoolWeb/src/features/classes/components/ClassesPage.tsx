"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useClassesPage } from "../use-classes-page";
import { ClassesTab } from "./ClassesTab";
import { RoomsTab } from "./RoomsTab";
import { SectionsTab } from "./SectionsTab";
import { SubjectsTab } from "./SubjectsTab";

export function ClassesPage() {
  const { picker, tab, setTab } = useClassesPage();
  const { branchId, schoolId } = picker;

  return (
    <>
      <PageHeader
        title="Classes, Sections & Subjects"
        description="Classes and subjects are shared across the school; sections and rooms belong to a branch."
        actions={<BranchPickerSelect picker={picker} />}
      />
      {picker.isLoading && <Skeleton className="h-64 w-full" />}
      {!picker.isLoading && !!picker.error && (
        <Card>
          <ErrorState error={picker.error} />
        </Card>
      )}
      {!picker.isLoading && !picker.error && (!branchId || !schoolId) && (
        <Card>
          <EmptyState
            icon={Building2}
            title="No branch in your scope"
            description="Classes are set up per school branch. Ask your administrator to assign you a branch."
          />
        </Card>
      )}
      {branchId && schoolId && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>
          <TabsContent value="classes">
            <ClassesTab key={schoolId} schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="sections">
            <SectionsTab key={branchId} branchId={branchId} schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="subjects">
            <SubjectsTab key={schoolId} schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="rooms">
            <RoomsTab key={branchId} branchId={branchId} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
