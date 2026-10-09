"use client";

import { Pencil } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EntityHistory } from "@/features/audit/components/EntityHistory";
import { guardianItems } from "../guardian-items";
import { useGuardianDetail } from "../use-guardian-detail";
import { EditGuardianDialog } from "./EditGuardianDialog";
import { GuardianChildrenList } from "./GuardianChildrenList";
import { GuardianSignInPanel } from "./GuardianSignInPanel";
import { LinkChildDialog } from "./LinkChildDialog";
import { UnlinkDialog } from "./UnlinkDialog";

interface GuardianDetailDrawerProps {
  guardianId: string | null;
  branchId: string | null;
  onClose: () => void;
}

export function GuardianDetailDrawer({ guardianId, branchId, onClose }: GuardianDetailDrawerProps) {
  const detail = useGuardianDetail(guardianId);
  const { guardian, query } = detail;

  return (
    <>
      <DetailDrawer
        open={!!guardianId}
        onOpenChange={(open) => !open && onClose()}
        title={guardian?.name ?? "Guardian"}
        actions={
          guardian &&
          detail.canEdit && (
            <Button variant="secondary" size="sm" onClick={() => detail.edit.show(true)}>
              <Pencil />
              Edit
            </Button>
          )
        }
      >
        {query.isLoading && <Skeleton className="h-40 w-full" />}
        {query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {guardian && (
          <>
            <DetailList items={guardianItems(guardian)} />
            <GuardianSignInPanel guardian={guardian} />
            <GuardianChildrenList
              items={detail.children}
              onLink={detail.canLinkChild ? () => detail.linkChild.show(true) : undefined}
              onUnlink={detail.onUnlink}
            />
            <EntityHistory entityType="Guardian" entityId={guardian.id} />
          </>
        )}
      </DetailDrawer>
      {detail.edit.open && guardian && <EditGuardianDialog guardian={guardian} onClose={detail.edit.close} />}
      {detail.linkChild.open && guardian && (
        <LinkChildDialog guardian={guardian} branchId={branchId} onClose={detail.linkChild.close} />
      )}
      <UnlinkDialog unlink={detail.unlink} />
    </>
  );
}
