"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useEnrollments } from "../api";
import { enrollmentColumns } from "../enrollment-columns";

export function EnrollmentHistoryTab({ studentId }: { studentId: string }) {
  const query = useEnrollments(studentId);
  return (
    <DataTable
      columns={enrollmentColumns}
      rows={query.data}
      getRowId={(row) => row.id}
      loading={query.isLoading}
      error={query.error}
      onRetry={() => query.refetch()}
      emptyTitle="No enrollment history"
    />
  );
}
