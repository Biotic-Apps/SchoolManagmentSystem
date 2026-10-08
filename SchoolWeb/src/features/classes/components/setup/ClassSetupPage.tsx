"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useClassSetupPage } from "../../setup/use-class-setup-page";
import { ClassSetupBody } from "./ClassSetupBody";

/** One screen per class: sections, subjects and teachers, all saved as you go. */
export function ClassSetupPage({ classId }: { classId: string }) {
  const page = useClassSetupPage(classId);
  const { query, setup } = page;

  if (page.scope.isLoading || query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.error || !setup)
    return (
      <Card>
        <ErrorState error={query.error ?? page.scope.error} onRetry={() => query.refetch()} />
      </Card>
    );
  return <ClassSetupBody page={page} setup={setup} />;
}
