"use client";

import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EntityHistory } from "@/features/audit/components/EntityHistory";
import { formatDate, formatDateTime, textOrDash } from "@/lib/format";
import type { UserSummary } from "../types";
import { useUserDetail } from "../use-user-detail";
import { AddAssignmentDialog } from "./AddAssignmentDialog";
import { AssignmentList } from "./AssignmentList";

export function UserDetailDrawer({ user, onClose }: { user: UserSummary | null; onClose: () => void }) {
  const detail = useUserDetail(user);
  const { data, query } = detail;

  return (
    <DetailDrawer
      open={!!user}
      onOpenChange={(open) => !open && onClose()}
      title={user?.name ?? "User"}
      description={
        user && (
          <span className="flex flex-wrap gap-2">
            <StatusBadge status={user.status} />
            {data?.mustChangePassword && <Badge tone="warning">Must change password</Badge>}
          </span>
        )
      }
    >
      {query.isLoading && <Skeleton className="h-40 w-full" />}
      {query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {data && (
        <>
          <DetailList
            items={[
              { label: "Email", value: textOrDash(data.email) },
              { label: "Phone", value: textOrDash(data.phone) },
              { label: "Last sign-in", value: formatDateTime(data.lastLoginAt) },
              { label: "Created", value: formatDate(data.createdAt) },
            ]}
          />
          <section className="flex flex-col gap-3">
            <SectionHeading
              title="Roles"
              actions={
                detail.canManageAssignments && (
                  <Button variant="secondary" size="sm" onClick={() => detail.addOpen.show(true)}>
                    <Plus />
                    Assign role
                  </Button>
                )
              }
            />
            <AssignmentList
              assignments={detail.activeAssignments}
              onEnd={detail.canManageAssignments ? detail.endTarget.show : undefined}
            />
          </section>
          <EntityHistory entityType="User" entityId={data.id} />
        </>
      )}
      {detail.addOpen.open && data && (
        <AddAssignmentDialog userId={data.id} userName={data.name} onClose={detail.addOpen.close} />
      )}
      <ConfirmDialog
        open={!!detail.endTarget.item}
        onOpenChange={detail.endTarget.onOpenChange}
        title={`End ${detail.endTarget.item?.roleName ?? "this"} assignment?`}
        description="Access through this role stops now. The assignment stays in the history."
        confirmLabel="End assignment"
        tone="danger"
        loading={detail.ending}
        onConfirm={detail.confirmEnd}
      />
    </DetailDrawer>
  );
}
