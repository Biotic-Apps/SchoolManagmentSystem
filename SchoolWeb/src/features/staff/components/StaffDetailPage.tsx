"use client";

import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DocumentsPanel } from "@/features/documents/components/DocumentsPanel";
import { useStaffDetail } from "../use-staff-detail";
import { AssignmentsTab } from "./AssignmentsTab";
import { CreateSignInDialog } from "./CreateSignInDialog";
import { EditStaffDialog } from "./EditStaffDialog";
import { ProbationDialog } from "./ProbationDialog";
import { ProfileTab } from "./ProfileTab";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { StaffActions } from "./StaffActions";
import { StaffHeader } from "./StaffHeader";
import { StaffStatusDialog } from "./StaffStatusDialog";
import { StaffIdCardPanel } from "./StaffIdCardPanel";
import { WorkloadTab } from "./WorkloadTab";

export function StaffDetailPage({ staffId }: { staffId: string }) {
  const page = useStaffDetail(staffId);
  const { staff, query } = page;

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (!staff) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }

  return (
    <>
      <StaffHeader
        staff={staff}
        actions={
          <StaffActions
            onEdit={page.canEdit ? () => page.edit.show(true) : undefined}
            onStatus={page.canEdit ? () => page.status.show(true) : undefined}
            onProbation={page.canSetProbation ? () => page.probation.show(true) : undefined}
            onCreateSignIn={page.canCreateSignIn ? () => page.createSignIn.show(true) : undefined}
            onResetPassword={page.canResetPassword ? () => page.resetPassword.show(true) : undefined}
          />
        }
      />
      <Tabs value={page.tab} onValueChange={page.setTab}>
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="id-card">ID card</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab staff={staff} />
        </TabsContent>
        <TabsContent value="assignments">
          <AssignmentsTab staffId={staff.id} branchId={page.branchId} canEdit={page.canEditAssignments} />
        </TabsContent>
        <TabsContent value="workload">
          <WorkloadTab staffId={staff.id} branchId={page.branchId} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsPanel ownerType="STAFF" ownerId={staff.id} />
        </TabsContent>
        <TabsContent value="id-card">
          <StaffIdCardPanel staffId={staff.id} canGenerate={page.canEdit} />
        </TabsContent>
      </Tabs>
      {page.edit.open && <EditStaffDialog staff={staff} onClose={page.edit.close} />}
      {page.status.open && <StaffStatusDialog staff={staff} onClose={page.status.close} />}
      {page.probation.open && <ProbationDialog staff={staff} branchId={page.branchId} onClose={page.probation.close} />}
      {page.createSignIn.open && <CreateSignInDialog staff={staff} onClose={page.createSignIn.close} />}
      {page.resetPassword.open && <ResetPasswordDialog staff={staff} onClose={page.resetPassword.close} />}
    </>
  );
}
