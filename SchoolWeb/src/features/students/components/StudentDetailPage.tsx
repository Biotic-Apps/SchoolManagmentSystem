"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStudentDetail } from "../use-student-detail";
import { ChangeSectionDialog } from "./ChangeSectionDialog";
import { EditStudentDialog } from "./EditStudentDialog";
import { StudentActions } from "./StudentActions";
import { StudentHeader } from "./StudentHeader";
import { StudentTabs } from "./StudentTabs";
import { TransferStudentDialog } from "./TransferStudentDialog";
import { WithdrawStudentDialog } from "./WithdrawStudentDialog";

export function StudentDetailPage({ studentId }: { studentId: string }) {
  const detail = useStudentDetail(studentId);
  const { student, query, action } = detail;

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (!student) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }

  return (
    <>
      <StudentHeader
        student={student}
        backHref="/students"
        actions={detail.canAct && <StudentActions onAction={action.show} />}
      />
      <StudentTabs student={student} tab={detail.tab} onTabChange={detail.setTab} />
      {action.item === "edit" && <EditStudentDialog student={student} onClose={action.close} />}
      {action.item === "section" && <ChangeSectionDialog student={student} onClose={action.close} />}
      {action.item === "transfer" && <TransferStudentDialog student={student} onClose={action.close} />}
      {action.item === "withdraw" && <WithdrawStudentDialog student={student} onClose={action.close} />}
    </>
  );
}
