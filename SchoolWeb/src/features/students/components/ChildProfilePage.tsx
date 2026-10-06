"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useChildProfile } from "../use-child-profile";
import { StudentHeader } from "./StudentHeader";
import { StudentTabs } from "./StudentTabs";

/** PARENT view: read-only profile of the child picked in the Topbar. */
export function ChildProfilePage() {
  const { child, query, student, tab, setTab } = useChildProfile();

  if (!child) {
    return (
      <>
        <PageHeader title="Child Profile" />
        <Card>
          <EmptyState
            icon={UserRound}
            title="No child linked yet"
            description="Link your child from Profile & Security using their admission number and date of birth. The school confirms the request."
            action={
              <Button asChild variant="secondary">
                <Link href="/profile">Go to Profile & Security</Link>
              </Button>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Child Profile" className="sr-only" />
      {query.isLoading && <Skeleton className="h-64 w-full" />}
      {!query.isLoading && !student && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {student && (
        <>
          <StudentHeader student={student} />
          <StudentTabs key={student.id} student={student} tab={tab} onTabChange={setTab} readOnly />
        </>
      )}
    </>
  );
}
