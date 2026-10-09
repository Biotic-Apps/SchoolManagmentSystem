"use client";

import { Building2, CalendarRange, IdCard, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AcademicScopeBar } from "@/features/classes/components/AcademicScopeBar";
import { useStudentsPage } from "../use-students-page";
import { PrintIdCardsDialog } from "./PrintIdCardsDialog";
import { RegisterStudentDialog } from "./RegisterStudentDialog";
import { StudentsTab } from "./StudentsTab";
import { TransfersTab } from "./TransfersTab";

export function StudentsPage() {
  const page = useStudentsPage();
  const { scope } = page;
  const { branchId, sessionId } = scope;

  return (
    <>
      <PageHeader
        title={page.title}
        description="Enrolled students per branch session, and transfers between branches."
        actions={
          <>
            {page.canPrintCards && (
              <Button variant="secondary" onClick={() => page.printCards.show(true)}>
                <IdCard />
                Print ID cards
              </Button>
            )}
            {page.canAdd && (
              <Button onClick={() => page.register.show(true)}>
                <Plus />
                Register student
              </Button>
            )}
          </>
        }
      />
      <AcademicScopeBar scope={scope} withClass />
      {scope.isLoading && <Skeleton className="h-64 w-full" />}
      {!scope.isLoading && !!scope.error && (
        <Card>
          <ErrorState error={scope.error} />
        </Card>
      )}
      {page.noBranch && (
        <Card>
          <EmptyState icon={Building2} title="No branch in your scope" description="Ask your administrator to assign you a branch." />
        </Card>
      )}
      {page.noSession && (
        <Card>
          <EmptyState
            icon={CalendarRange}
            title="No academic session yet"
            description="Students are enrolled into a session. Create one in Sessions & Calendar first."
          />
        </Card>
      )}
      {branchId && sessionId && (
        <Tabs value={page.tab} onValueChange={page.setTab}>
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
          </TabsList>
          <TabsContent value="students">
            <StudentsTab
              key={`${branchId}-${sessionId}-${scope.classId ?? "all"}`}
              branchId={branchId}
              sessionId={sessionId}
              classId={scope.classId}
            />
          </TabsContent>
          <TabsContent value="transfers">
            <TransfersTab key={branchId} branchId={branchId} sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      )}
      {page.printCards.open && branchId && sessionId && (
        <PrintIdCardsDialog
          branchId={branchId}
          sessionId={sessionId}
          classes={scope.classes.options}
          classId={scope.classId}
          onClose={page.printCards.close}
        />
      )}
      {page.register.open && branchId && sessionId && (
        <RegisterStudentDialog
          scope={{ branchId, sessionId, classId: scope.classId }}
          classOptions={scope.classes.options}
          onClose={page.register.close}
        />
      )}
    </>
  );
}
