"use client";

import { UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useChildSyllabus } from "../use-child-syllabus";
import { ChildBookListSection } from "./ChildBookListSection";
import { ChildPlansSection } from "./ChildPlansSection";

/** Read-only syllabus and book list of the child picked in the Topbar switcher. */
export function ChildSyllabusView() {
  const { caption, child, student, enrollment, books, bookList, plans, subjectPlans } = useChildSyllabus();

  return (
    <>
      <PageHeader title="Syllabus & Books" description={caption} />
      {!child && (
        <Card>
          <EmptyState
            icon={UserRound}
            title="No child linked"
            description="Once the school verifies your link to a child, their syllabus and book list appear here."
          />
        </Card>
      )}
      {student.isLoading && <Skeleton className="h-64 w-full" />}
      {!!student.error && (
        <Card>
          <ErrorState error={student.error} onRetry={() => student.refetch()} />
        </Card>
      )}
      {student.data && !enrollment && (
        <Card>
          <EmptyState
            title="Not enrolled in a class"
            description="The syllabus appears once your child is placed in a section."
          />
        </Card>
      )}
      {enrollment && (
        <div className="flex flex-col gap-6">
          <ChildBookListSection query={books} bookList={bookList} />
          <ChildPlansSection query={plans} plans={subjectPlans} />
        </div>
      )}
    </>
  );
}
