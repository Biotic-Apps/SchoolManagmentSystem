"use client";

import { useState } from "react";
import { BookCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useActiveChild } from "@/features/auth/use-active-child";
import { useStudentHomework } from "../api";
import { HomeworkCard } from "./HomeworkCard";
import { SubmitHomeworkDialog } from "./SubmitHomeworkDialog";
import type { Homework } from "../types";

export function HomeworkParentPage() {
  const child = useActiveChild();
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);

  const query = useStudentHomework(child?.id ?? null, {});

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Homework" description="View assigned homework and submit answers." />

      {!child && <NoChildState description="Once your child link is verified, their homework appears here." />}

      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {query.data && query.data.length === 0 && (
        <Card>
          <EmptyState
            icon={BookCheck}
            title="No homework assigned"
            description="Homework from teachers will appear here."
          />
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {query.data?.map((hw) => (
          <HomeworkCard key={hw.id} homework={hw} compact onSelect={() => setSelectedHw(hw)} />
        ))}
      </div>

      {selectedHw && child?.id && (
        <SubmitHomeworkDialog
          homework={selectedHw}
          studentId={child.id}
          open={!!selectedHw}
          onClose={() => setSelectedHw(null)}
        />
      )}
    </div>
  );
}
