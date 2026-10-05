"use client";

import { Pencil } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EntityHistory } from "@/features/audit/components/EntityHistory";
import { formatDate, formatNumber, textOrDash } from "@/lib/format";
import { useSchool } from "../api";
import type { School } from "../types";
import { SchoolName } from "./SchoolName";

interface SchoolDetailDrawerProps {
  school: School | null;
  onClose: () => void;
  onEdit?: (school: School) => void;
}

export function SchoolDetailDrawer({ school, onClose, onEdit }: SchoolDetailDrawerProps) {
  const query = useSchool(school?.id ?? null);
  const data = query.data ?? school;

  return (
    <DetailDrawer
      open={!!school}
      onOpenChange={(open) => !open && onClose()}
      title={data?.name ?? "School"}
      description={data && <StatusBadge status={data.status} />}
      actions={
        data &&
        onEdit && (
          <Button variant="secondary" size="sm" onClick={() => onEdit(data)}>
            <Pencil />
            Edit
          </Button>
        )
      }
    >
      {query.isLoading && !data && <Skeleton className="h-32 w-full" />}
      {query.error && !data && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {data && (
        <>
          <SchoolName school={data} />
          <DetailList
            items={[
              { label: "Code", value: data.code },
              { label: "Branches", value: formatNumber(data.branchCount) },
              { label: "Phone", value: textOrDash(data.phone) },
              { label: "Email", value: textOrDash(data.email) },
              { label: "Website", value: textOrDash(data.website) },
              { label: "Created", value: formatDate(data.createdAt) },
              { label: "Address", value: textOrDash(data.address) },
            ]}
          />
          <EntityHistory entityType="School" entityId={data.id} />
        </>
      )}
    </DetailDrawer>
  );
}
